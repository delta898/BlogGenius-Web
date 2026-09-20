import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "가이드 | BlogGenius",
  description: "BlogGenius 활용 가이드 페이지입니다.",
  alternates: { canonical: "/guides/" },
};

export default function GuidesPage() {
  return (
    <main className="page-shell">
      <section className="stub" aria-labelledby="guides-title">
        <p className="eyebrow">GUIDES</p>
        <h1 id="guides-title">활용 가이드를 준비하고 있습니다.</h1>
        <p className="lede">
          처음 설정부터 자주 쓰는 활용법까지 검색 가능한 글로 정리하겠습니다.
        </p>
        <p>
          <Link href="/">소개로 돌아가기</Link>
        </p>
      </section>
    </main>
  );
}
