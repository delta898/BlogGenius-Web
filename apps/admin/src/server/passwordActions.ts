"use server";

import { redirect } from "next/navigation";
import { recordAuditEvent } from "./audit";
import { validateNewPassword } from "./passwordPolicy";
import { createAdminServerClient } from "./supabaseServer";

export type PasswordActionResult =
  | { ok: true; next: string }
  | { ok: false; code: string; message: string };

/**
 * 초대 수락 직후(aal1) 또는 로그인 상태에서 비밀번호를 설정한다.
 * 초대받은 계정은 이 단계를 거쳐야 하며, 이후 TOTP 등록으로 이어진다.
 */
export async function setPasswordAction(
  password: string,
  confirm: string,
): Promise<PasswordActionResult> {
  const requestId = crypto.randomUUID();
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect("/login");
  }

  const validationError = validateNewPassword(password, confirm);
  if (validationError !== null) {
    return { ok: false, code: "INVALID_INPUT", message: validationError };
  }

  const { error } = await supabase.auth.updateUser({ password });
  const actorRole =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role
      : null;

  if (error) {
    recordAuditEvent({
      actor: user.id,
      actorRole,
      action: "auth.password.setup",
      target: null,
      requestId,
      result: "failure",
      reasonCode: "PASSWORD_UPDATE_FAILED",
      detail: {},
    });
    return {
      ok: false,
      code: "PASSWORD_UPDATE_FAILED",
      message: "비밀번호 설정에 실패했습니다. 다시 시도해 주세요.",
    };
  }

  recordAuditEvent({
    actor: user.id,
    actorRole,
    action: "auth.password.setup",
    target: null,
    requestId,
    result: "success",
    detail: {},
  });
  return { ok: true, next: "/mfa/enroll" };
}
