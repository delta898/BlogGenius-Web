import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { shouldUseSecureCookies } from "../../../server/cookies";
import { maskEmail, recordAuditEvent } from "../../../server/audit";
import { buildAppUrl, getRequestHost } from "../../../server/requestHost";

/**
 * 초대·복구 메일의 token을 검증하고 세션을 세운 뒤 비밀번호 설정 화면으로 보낸다.
 * - PKCE 템플릿: ?token_hash=...&type=invite|recovery
 * - 레거시 템플릿: ?token=...&type=... (verifyOtp가 token도 받는다)
 * 검증 실패 시 /login?error=invite 로 보낸다 (사유는 서버 audit에만).
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const supabaseUrl = (process.env.SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY ?? "").trim();
  if (supabaseUrl === "" || anonKey === "") {
    return NextResponse.json(
      { code: "ENV_MISCONFIGURED" },
      { status: 500 },
    );
  }

  // request.url의 host를 쓰지 않는다 (dev에서 localhost로 정규화되어
  // 세션 쿠키 host와 어긋나는 현상 확인). 브라우저 Host 기준.
  const appHost = getRequestHost({
    hostHeader: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    fallbackProtocol: request.nextUrl.protocol,
  });
  if (appHost === null) {
    recordAuditEvent({
      actor: "anonymous",
      action: "auth.invite.accept",
      target: null,
      requestId,
      result: "failure",
      reasonCode: "BAD_HOST",
      detail: {},
    });
    return NextResponse.json({ code: "BAD_HOST" }, { status: 400 });
  }

  const response = NextResponse.redirect(buildAppUrl(appHost, "/auth/setup-password"));
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: shouldUseSecureCookies({
              host:
                request.headers.get("x-forwarded-host") ??
                request.nextUrl.hostname,
              protocol: request.nextUrl.protocol,
            }),
            sameSite: "lax",
            path: "/",
          });
        }
      },
    },
  });

  async function verifyToken(): Promise<string | null> {
    // PKCE 템플릿 기준. token_hash가 없으면 구 템플릿이므로 실패 처리하고
    // 템플릿 점검을 유도한다 (조용히 통과시키지 않음).
    if (!tokenHash || (type !== "invite" && type !== "recovery")) {
      return `missing or legacy token (type=${type ?? "none"})`;
    }
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    return error?.message ?? null;
  }

  const verifyError = await verifyToken();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // verify 성공 직후 같은 client로 세션이 읽혀야 쿠키에 실린 것이다.
  // user가 null이면 세션 확립 실패로 보고 setup-password로 보내지 않는다.
  const sessionEstablished = verifyError === null && user !== null;

  recordAuditEvent({
    actor: user?.id ?? maskEmail(url.searchParams.get("email")) ?? "anonymous",
    action: "auth.invite.accept",
    target: null,
    requestId,
    result: sessionEstablished ? "success" : "failure",
    reasonCode: sessionEstablished
      ? null
      : (verifyError === null ? "SESSION_NOT_ESTABLISHED" : "INVITE_VERIFY_FAILED"),
    detail: { type },
  });

  if (!sessionEstablished) {
    return NextResponse.redirect(buildAppUrl(appHost, "/login?error=invite"));
  }
  return response;
}
