import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { parseAdminRole } from "./authorization";
import { shouldUseSecureCookies } from "./cookies";
import { getSupabasePublicConfig } from "./supabaseEnv";

async function cookieSecurity(): Promise<{ secure: boolean }> {
  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  return {
    secure: shouldUseSecureCookies({ host, protocol: forwardedProto }),
  };
}

export async function createAdminServerClient() {
  const config = getSupabasePublicConfig();
  const cookieStore = await cookies();
  const { secure } = await cookieSecurity();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, {
            ...options,
            httpOnly: true,
            secure,
            sameSite: "lax",
            path: "/",
          });
        }
      },
    },
  });
}

export interface SessionClaims {
  userId: string;
  email: string | null;
  role: ReturnType<typeof parseAdminRole>;
  aal: "aal1" | "aal2" | null;
  totpEnrolled: boolean;
}

/**
 * 세션 + 역할(app_metadata.role) + AAL을 한 번에 읽는다.
 * 어떤 단계에서든 user가 없으면 null (미인증). UI는 null을 로그인으로 보낸다.
 */
export async function getSessionClaims(): Promise<SessionClaims | null> {
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const { data: factorsData } = await supabase.auth.mfa.listFactors();

  return {
    userId: user.id,
    email: user.email ?? null,
    role: parseAdminRole(user.app_metadata?.role),
    aal: (aalData?.currentLevel ?? null) as SessionClaims["aal"],
    totpEnrolled: (factorsData?.totp ?? []).some(
      (factor) => factor.status === "verified",
    ),
  };
}
