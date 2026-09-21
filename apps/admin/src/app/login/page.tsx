import { getRuntimeEnvironment } from "../../server/environment";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invite:
    "초대 링크가 만료되었거나 이미 사용되었습니다. 새 초대 메일을 요청해 주세요.",
  config: "서버 설정에 문제가 있습니다. 관리자에게 문의해 주세요.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const environment = getRuntimeEnvironment();
  const params = await searchParams;
  const banner =
    params.error !== undefined ? (ERROR_MESSAGES[params.error] ?? null) : null;

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-labelledby="login-title">
        <div className="environment-badge">{environment.toUpperCase()}</div>
        <p className="eyebrow">BLOGGENIUS ADMIN</p>
        <h1 id="login-title">관리자 로그인</h1>
        <p>초대받은 관리자 계정으로 로그인합니다. 다음 단계에서 OTP 인증을 요구합니다.</p>
        {banner !== null ? (
          <p role="alert" className="auth-error">
            {banner}
          </p>
        ) : null}
        <LoginForm />
      </section>
    </main>
  );
}
