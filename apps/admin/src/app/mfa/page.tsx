import { redirect } from "next/navigation";
import { getRuntimeEnvironment } from "../../server/environment";
import { createAdminServerClient } from "../../server/supabaseServer";
import { VerifyForm } from "./VerifyForm";

export const dynamic = "force-dynamic";

export default async function MfaPage() {
  const environment = getRuntimeEnvironment();
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect("/login");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = (factors?.totp ?? []).filter((f) => f.status === "verified");
  if (verified.length === 0) redirect("/mfa/enroll");

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-labelledby="mfa-title">
        <div className="environment-badge">{environment.toUpperCase()}</div>
        <p className="eyebrow">BLOGGENIUS ADMIN</p>
        <h1 id="mfa-title">2단계 인증</h1>
        <p>OTP 앱에 표시된 6자리 숫자를 입력해 주세요.</p>
        <VerifyForm factorId={verified[0].id} />
      </section>
    </main>
  );
}
