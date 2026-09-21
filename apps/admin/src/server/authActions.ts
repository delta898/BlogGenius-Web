"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  maskEmail,
  recordAuditEvent,
} from "./audit";
import { createAdminServerClient } from "./supabaseServer";
import {
  isRateLimited,
  registerAttempt,
  resetAttempts,
} from "./rateLimit";

export type ActionResult =
  | { ok: true; next: string }
  | { ok: false; code: string; message: string };

async function clientIp(): Promise<string> {
  // Caddy 뒤에서 동작한다. XFF 첫 항목은 위조 가능하므로 근사치로만 쓰고
  // Supabase Auth 측 rate limit을 최종 방어로 둔다.
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function auditBase(requestId: string) {
  return { requestId };
}

async function currentActor(): Promise<{ id: string; role: string | null }> {
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return {
    id: user?.id ?? "anonymous",
    role: typeof user?.app_metadata?.role === "string"
      ? user.app_metadata.role
      : null,
  };
}

export async function signInAction(
  email: string,
  password: string,
): Promise<ActionResult> {
  const requestId = crypto.randomUUID();
  const ip = await clientIp();
  const normalizedEmail = email.trim().toLowerCase();
  const masked = maskEmail(normalizedEmail) ?? "***";

  if (normalizedEmail === "" || password === "") {
    return { ok: false, code: "INVALID_INPUT", message: "이메일과 비밀번호를 입력해 주세요." };
  }

  const { limited } = isRateLimited(`login:${ip}`);
  if (limited) {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: masked,
      action: "auth.login",
      target: null,
      result: "failure",
      reasonCode: "RATE_LIMITED",
      detail: {},
    });
    return {
      ok: false,
      code: "RATE_LIMITED",
      message: "시도가 너무 많습니다. 10분 뒤에 다시 시도해 주세요.",
    };
  }
  registerAttempt(`login:${ip}`);

  const supabase = await createAdminServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: masked,
      action: "auth.login",
      target: null,
      result: "failure",
      reasonCode: "INVALID_CREDENTIALS",
      detail: {},
    });
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  resetAttempts(`login:${ip}`);
  const actor = await currentActor();
  recordAuditEvent({
    ...auditBase(requestId),
    actor: actor.id,
    actorRole: actor.role,
    action: "auth.login",
    target: null,
    result: "success",
    detail: {},
  });

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const enrolled = (factors?.totp ?? []).some((f) => f.status === "verified");
  return { ok: true, next: enrolled ? "/mfa" : "/mfa/enroll" };
}

export async function verifyTotpAction(
  factorId: string,
  code: string,
): Promise<ActionResult> {
  const requestId = crypto.randomUUID();
  const actor = await currentActor();
  const supabase = await createAdminServerClient();

  if (!/^[0-9]{6}$/.test(code.trim())) {
    return { ok: false, code: "INVALID_INPUT", message: "6자리 숫자를 입력해 주세요." };
  }

  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: actor.id,
      actorRole: actor.role,
      action: "auth.mfa.verify",
      target: factorId,
      result: "failure",
      reasonCode: "MFA_CHALLENGE_FAILED",
      detail: {},
    });
    return { ok: false, code: "MFA_CHALLENGE_FAILED", message: "인증 요청에 실패했습니다. 다시 시도해 주세요." };
  }

  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code: code.trim(),
  });
  if (verify.error) {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: actor.id,
      actorRole: actor.role,
      action: "auth.mfa.verify",
      target: factorId,
      result: "failure",
      reasonCode: "MFA_VERIFY_FAILED",
      detail: {},
    });
    return { ok: false, code: "MFA_VERIFY_FAILED", message: "코드가 올바르지 않습니다." };
  }

  recordAuditEvent({
    ...auditBase(requestId),
    actor: actor.id,
    actorRole: actor.role,
    action: "auth.mfa.verify",
    target: factorId,
    result: "success",
    detail: { method: "totp" },
  });
  return { ok: true, next: "/" };
}

export interface TotpEnrollment {
  factorId: string;
  uri: string;
  secret: string;
  qrCode: string | null;
}

export async function enrollTotpAction(): Promise<
  | { ok: true; enrollment: TotpEnrollment }
  | { ok: false; code: string; message: string }
> {
  const requestId = crypto.randomUUID();
  const actor = await currentActor();
  const supabase = await createAdminServerClient();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "admin-totp",
  });
  if (error || !data) {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: actor.id,
      actorRole: actor.role,
      action: "auth.mfa.enroll",
      target: null,
      result: "failure",
      reasonCode: "MFA_ENROLL_FAILED",
      detail: {},
    });
    return { ok: false, code: "MFA_ENROLL_FAILED", message: "등록 준비에 실패했습니다. 다시 시도해 주세요." };
  }

  return {
    ok: true,
    enrollment: {
      factorId: data.id,
      uri: data.totp.uri,
      secret: data.totp.secret,
      qrCode: (data.totp as { qr_code?: string }).qr_code ?? null,
    },
  };
}

export async function confirmEnrollAction(
  factorId: string,
  code: string,
): Promise<ActionResult> {
  const requestId = crypto.randomUUID();
  const actor = await currentActor();
  const supabase = await createAdminServerClient();

  if (!/^[0-9]{6}$/.test(code.trim())) {
    return { ok: false, code: "INVALID_INPUT", message: "6자리 숫자를 입력해 주세요." };
  }

  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) {
    return { ok: false, code: "MFA_CHALLENGE_FAILED", message: "인증 요청에 실패했습니다. 다시 시도해 주세요." };
  }
  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code: code.trim(),
  });
  if (verify.error) {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: actor.id,
      actorRole: actor.role,
      action: "auth.mfa.enroll",
      target: factorId,
      result: "failure",
      reasonCode: "MFA_VERIFY_FAILED",
      detail: {},
    });
    return { ok: false, code: "MFA_VERIFY_FAILED", message: "코드가 올바르지 않습니다." };
  }

  recordAuditEvent({
    ...auditBase(requestId),
    actor: actor.id,
    actorRole: actor.role,
    action: "auth.mfa.enroll",
    target: factorId,
    result: "success",
    detail: { method: "totp" },
  });
  return { ok: true, next: "/" };
}

export async function unenrollTotpAction(factorId: string): Promise<ActionResult> {
  const requestId = crypto.randomUUID();
  const actor = await currentActor();
  const supabase = await createAdminServerClient();

  // 수단 제거는 aal2 세션에서만 (탈취된 1단계 세션의 무력화 방지).
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    recordAuditEvent({
      ...auditBase(requestId),
      actor: actor.id,
      actorRole: actor.role,
      action: "auth.mfa.unenroll",
      target: factorId,
      result: "failure",
      reasonCode: "FORBIDDEN",
      detail: {},
    });
    return { ok: false, code: "FORBIDDEN", message: "2단계 인증을 먼저 완료해 주세요." };
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) {
    return { ok: false, code: "MFA_UNENROLL_FAILED", message: "해제에 실패했습니다. 다시 시도해 주세요." };
  }

  recordAuditEvent({
    ...auditBase(requestId),
    actor: actor.id,
    actorRole: actor.role,
    action: "auth.mfa.unenroll",
    target: factorId,
    result: "success",
    detail: {},
  });
  return { ok: true, next: "/mfa/enroll" };
}

export async function signOutAction(): Promise<void> {
  const requestId = crypto.randomUUID();
  const actor = await currentActor();
  const supabase = await createAdminServerClient();
  await supabase.auth.signOut();
  recordAuditEvent({
    ...auditBase(requestId),
    actor: actor.id,
    actorRole: actor.role,
    action: "auth.logout",
    target: null,
    result: "success",
    detail: {},
  });
  redirect("/login");
}
