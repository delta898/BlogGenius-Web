import { redirect } from "next/navigation";
import { maskEmail } from "../server/audit";
import { capabilitiesFor } from "../server/authorization";
import { getRuntimeEnvironment } from "../server/environment";
import { getSessionClaims } from "../server/supabaseServer";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const environment = getRuntimeEnvironment();
  const claims = await getSessionClaims();
  // middleware가 aal2를 강제하지만, 방어 차원에서 서버에서도 재확인한다.
  if (claims === null || claims.aal !== "aal2") {
    redirect("/login");
  }

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-labelledby="admin-title">
        <div className="environment-badge">{environment.toUpperCase()}</div>
        <p className="eyebrow">BLOGGENIUS ADMIN</p>
        <h1 id="admin-title">운영 개요</h1>
        <dl className="session-box">
          <dt>환경</dt>
          <dd>{environment}</dd>
          <dt>계정</dt>
          <dd>{maskEmail(claims.email) ?? claims.userId}</dd>
          <dt>역할</dt>
          <dd>{claims.role ?? "미지정(권한 없음)"}</dd>
          <dt>부여된 capability</dt>
          <dd>
            {capabilitiesFor(claims.role).length > 0
              ? capabilitiesFor(claims.role).join(", ")
              : "없음"}
          </dd>
        </dl>
        <p>업무 모듈(license 조회 등)은 다음 층에서 연결한다.</p>
        <SignOutButton />
      </section>
    </main>
  );
}
