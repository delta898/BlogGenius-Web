import { redirect } from "next/navigation";
import { getRuntimeEnvironment } from "../../../server/environment";
import { createAdminServerClient } from "../../../server/supabaseServer";
import { EnrollForm } from "./EnrollForm";

export const dynamic = "force-dynamic";

export default async function MfaEnrollPage() {
  const environment = getRuntimeEnvironment();
  const supabase = await createAdminServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect("/login");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = (factors?.totp ?? []).filter((f) => f.status === "verified");

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-labelledby="enroll-title">
        <div className="environment-badge">{environment.toUpperCase()}</div>
        <p className="eyebrow">BLOGGENIUS ADMIN</p>
        <h1 id="enroll-title">OTP 등록</h1>
        <p>
          OTP 앱(Google Authenticator, Apple 암호 등)에 등록한 뒤 6자리 숫자로
          확인합니다. 등록을 마쳐야 운영 화면에 들어갈 수 있습니다.
        </p>
        <EnrollForm
          verifiedFactors={verified.map((f) => ({
            id: f.id,
            name: f.friendly_name ?? f.id,
          }))}
        />
      </section>
    </main>
  );
}
