import { getRuntimeEnvironment } from "../server/environment";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const environment = getRuntimeEnvironment();

  return (
    <main className="admin-shell">
      <section className="admin-card" aria-labelledby="admin-title">
        <div className="environment-badge">{environment.toUpperCase()}</div>
        <p className="eyebrow">BLOGGENIUS ADMIN</p>
        <h1 id="admin-title">운영 기반을 준비하고 있습니다.</h1>
        <p>
          현재 화면은 인증과 업무 기능을 연결하기 전 runtime 및 환경 경계를
          검증하기 위한 최소 Backoffice입니다.
        </p>
      </section>
    </main>
  );
}
