import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "변경내역 | BlogGenius",
  description: "BlogGenius 변경내역 페이지입니다.",
};

export default function ChangelogPage() {
  return (
    <main className="page-shell">
      <section className="stub" aria-labelledby="changelog-title">
        <p className="eyebrow">CHANGELOG</p>
        <h1 id="changelog-title">변경내역을 준비하고 있습니다.</h1>
        <p className="lede">
          새 버전이 나오면 바뀐 내용과 업데이트 방법을 이곳에 알리겠습니다.
        </p>
        <p>
          <Link href="/">소개로 돌아가기</Link>
        </p>
      </section>
    </main>
  );
}
