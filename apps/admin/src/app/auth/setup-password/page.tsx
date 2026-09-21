import { redirect } from "next/navigation";
import { getRuntimeEnvironment } from "../../../server/environment";
import { createAdminServerClient } from "../../../server/supabaseServer";
import { SetupPasswordForm } from "./SetupPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetupPasswordPage() {
  const environment = getRuntimeEnvironment();
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect("/login");

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-labelledby="password-title">
        <div className="environment-badge">{environment.toUpperCase()}</div>
        <p className="eyebrow">BLOGGENIUS ADMIN</p>
        <h1 id="password-title">비밀번호 설정</h1>
        <p>
          초대받은 계정의 비밀번호를 정합니다. 8자 이상이어야 하며, 다음 단계에서
          OTP 등록을 요구합니다.
        </p>
        <SetupPasswordForm />
      </section>
    </main>
  );
}
