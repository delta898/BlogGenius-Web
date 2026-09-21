const allowedEnvironments = new Set([
  "local",
  "development",
  "production",
]);

const environment = process.env.APP_ENVIRONMENT;

if (!allowedEnvironments.has(environment)) {
  process.stderr.write(
    "APP_ENVIRONMENT must be one of: local, development, production.\n",
  );
  process.exit(1);
}

// Backoffice는 기동 시점에 Supabase 공개 설정을 주입받는다.
// 빌드 시점이 아니라 실행 시점 값이므로 같은 이미지가 환경별로 동작한다.
const supabaseUrl = (process.env.SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY ?? "").trim();

if (supabaseUrl === "" || supabaseAnonKey === "") {
  process.stderr.write(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set.\n",
  );
  process.exit(1);
}

const isLocalhost =
  supabaseUrl.includes("://localhost") ||
  supabaseUrl.includes("://127.0.0.1");
const looksLikeUrl =
  (supabaseUrl.startsWith("https://") || supabaseUrl.startsWith("http://")) &&
  supabaseUrl.includes(".") &&
  !/\s/.test(supabaseUrl);

if (!looksLikeUrl) {
  process.stderr.write("SUPABASE_URL is not a valid URL.\n");
  process.exit(1);
}
if (supabaseUrl.startsWith("http://") && !isLocalhost) {
  process.stderr.write("SUPABASE_URL must use https outside localhost.\n");
  process.exit(1);
}
