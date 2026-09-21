import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { shouldUseSecureCookies } from "./src/server/cookies";
import { buildAppUrl, getRequestHost, type RequestHost } from "./src/server/requestHost";

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = (process.env.SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY ?? "").trim();
  if (url === "" || anonKey === "") return null;
  if (!url.startsWith("https://") && !url.startsWith("http://localhost")) {
    return null;
  }
  return { url, anonKey };
}

function isSecureCookie(request: NextRequest): boolean {
  return shouldUseSecureCookies({
    host:
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      request.nextUrl.hostname,
    protocol:
      request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol,
  });
}

export async function middleware(request: NextRequest) {
  const config = getSupabaseConfig();
  // 브라우저 Host 기준으로 리다이렉트를 만든다. request.url의 host는
  // dev에서 실제 접속 host와 다를 수 있어 세션 쿠키가 끊긴다.
  const appHost: RequestHost | null = getRequestHost({
    hostHeader: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    fallbackProtocol: request.nextUrl.protocol,
  });
  // 설정이 없거나 host가 허용 목록 밖이면 fail-closed.
  if (config === null || appHost === null) {
    return NextResponse.json({ code: "ENV_MISCONFIGURED" }, { status: 500 });
  }

  const response = NextResponse.next({ request });
  const pendingCookies: { name: string; value: string }[] = [];
  const supabase = createServerClient(config.url, config.anonKey, {
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
            secure: isSecureCookie(request),
            sameSite: "lax",
            path: "/",
          });
          pendingCookies.push({ name, value });
        }
      },
    },
  });

  // 세션 refresh로 생긴 쿠키는 최종 응답(redirect 포함)에 반드시 싣는다.
  function withCookies(result: NextResponse): NextResponse {
    for (const { name } of pendingCookies) {
      const refreshed = response.cookies.get(name);
      if (refreshed) result.cookies.set(name, refreshed.value, refreshed);
    }
    return result;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isMfa = pathname === "/mfa" || pathname.startsWith("/mfa/");
  const isAuthFlow = pathname.startsWith("/auth/");

  if (user === null) {
    if (isLogin || isMfa) return withCookies(response);
    // 초대 수락·비밀번호 설정은 세션 없이 token으로 들어오므로 허용하고
    // route에서 검증한다.
    if (isAuthFlow) return withCookies(response);
    return withCookies(NextResponse.redirect(buildAppUrl(appHost, "/login")));
  }

  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel === "aal2") {
    if (isLogin || isMfa || isAuthFlow) {
      return withCookies(NextResponse.redirect(buildAppUrl(appHost, "/")));
    }
    return withCookies(response);
  }

  // aal1: 초대 직후 비밀번호 미설정 상태면 setup으로, 아니면 TOTP 등록/검증으로.
  if (isAuthFlow) return withCookies(response);

  // aal1: TOTP 등록 여부에 따라 enroll/verify로 보낸다.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const enrolled = (factors?.totp ?? []).some((f) => f.status === "verified");
  if (isMfa) return withCookies(response);
  return withCookies(
    NextResponse.redirect(
      buildAppUrl(appHost, enrolled ? "/mfa" : "/mfa/enroll"),
    ),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|health).*)"],
};
