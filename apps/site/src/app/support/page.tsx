import type { Metadata } from "next";
import { supportChatUrl } from "../../content/navigation";

export const metadata: Metadata = {
  title: "지원 | BlogGenius",
  description: "BlogGenius 지원 진입점입니다.",
  alternates: { canonical: "/support/" },
};

export default function SupportPage() {
  return (
    <main className="page-shell">
      <section className="stub" aria-labelledby="support-title">
        <p className="eyebrow">SUPPORT</p>
        <h1 id="support-title">막히면 언제든 물어보세요.</h1>
        <p className="lede">
          설정과 사용 중 궁금한 점은 오픈채팅방에서 친절하게 도와드립니다.
        </p>
        <p>
          <a href={supportChatUrl} rel="noreferrer" target="_blank">
            오픈채팅방 참여하기
          </a>
        </p>
      </section>
    </main>
  );
}
