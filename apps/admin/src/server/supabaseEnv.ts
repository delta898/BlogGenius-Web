import { parseRuntimeEnvironment } from "./environment";

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

/**
 * Backoffice가 브라우저에 노출해도 되는 publishable 설정만 검증한다.
 * service_role 등 server-only credential은 이 모듈에서 절대 다루지 않는다.
 * 값이 없거나 형태가 틀리면 fail-closed (예외 발생).
 */
export function getSupabasePublicConfig(
  env: NodeJS.ProcessEnv = process.env,
): SupabasePublicConfig {
  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

  if (url === "" || anonKey === "") {
    throw new Error(
      "ENV_MISCONFIGURED: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("ENV_MISCONFIGURED: NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");
  }

  const isLocalhost =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (parsed.protocol !== "https:" && !isLocalhost) {
    throw new Error(
      "ENV_MISCONFIGURED: NEXT_PUBLIC_SUPABASE_URL must use https outside localhost.",
    );
  }

  // 환경 이름과 무관하게 실행 시점에 주입된 값을 그대로 사용한다.
  // dev 빌드에 prod 값이 섞이지 않았는지는 배포 파이프라인에서 검증한다.
  // 주입된 env 객체의 APP_ENVIRONMENT를 검증한다 (process.env 직접 참조 금지).
  parseRuntimeEnvironment(env.APP_ENVIRONMENT);

  return { url: parsed.toString().replace(/\/$/, ""), anonKey };
}
