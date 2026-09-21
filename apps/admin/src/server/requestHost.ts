/**
 * 리다이렉트 URL 생성은 `request.url`/`nextUrl`의 host를 쓰지 않는다.
 * dev 서버가 request.url의 host를 실제 접속 host와 다르게 적는 경우
 * (관측: 브라우저는 127.0.0.1, request.url은 localhost)가 있어,
 * 절대 URL 리다이렉트가 다른 host로 보내버리면 세션 쿠키가 끊긴다.
 * 브라우저가 쓴 Host 헤더를 기준으로 삼는다.
 */

const ALLOWED_HOSTS = [/^localhost(:\d+)?$/i, /^127\.0\.0\.1(:\d+)?$/];

function isAllowedHost(host: string): boolean {
  const bare = host.trim().toLowerCase();
  if (ALLOWED_HOSTS.some((pattern) => pattern.test(bare))) return true;
  const hostname = bare.split(":")[0] ?? "";
  return (
    hostname === "bloggenius.kr" || hostname.endsWith(".bloggenius.kr")
  );
}

export interface RequestHost {
  protocol: "http:" | "https:";
  host: string;
}

/**
 * 브라우저가 실제 접속한 protocol/host. 허용 목록 밖이면 null
 * (Host 헤더 위조 시 fail-closed).
 */
export function getRequestHost(input: {
  hostHeader?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  fallbackProtocol?: string | null;
}): RequestHost | null {
  const host = (input.forwardedHost ?? input.hostHeader ?? "").trim();
  if (host === "" || !isAllowedHost(host)) return null;

  const proto = (input.forwardedProto ?? input.fallbackProtocol ?? "")
    .trim()
    .toLowerCase();
  const protocol = proto === "https:" ? "https:" : "http:";
  return { protocol, host };
}

export function buildAppUrl(base: RequestHost, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base.protocol}//${base.host}${normalizedPath}`;
}
