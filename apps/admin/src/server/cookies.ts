/**
 * Secure 쿠키 판단은 APP_ENVIRONMENT 이름이 아니라 실제 접속 protocol/host로
 * 한다. APP_ENVIRONMENT=development를 로컬 http에서 띄우는 경우(Supabase dev
 * 프로젝트 대상 기능 테스트)에도 세션이 끊기지 않기 위함이다.
 * 알 수 없으면 secure(안전한 쪽 기본).
 */
export function shouldUseSecureCookies(input: {
  host?: string | null;
  protocol?: string | null;
}): boolean {
  const host = (input.host ?? "").trim().toLowerCase();
  const protocol = (input.protocol ?? "").trim().toLowerCase();

  const hostPart = host.split(",")[0]?.trim() ?? "";
  const bareHost = hostPart.split(":")[0] ?? "";

  if (protocol === "http:") return false;
  if (protocol === "https:") return true;
  if (bareHost === "localhost" || bareHost === "127.0.0.1") return false;
  return true;
}
