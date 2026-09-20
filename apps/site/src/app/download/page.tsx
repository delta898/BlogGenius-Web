import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "다운로드 | BlogGenius",
  description: "BlogGenius 설치 파일 안내 페이지입니다.",
  alternates: { canonical: "/download/" },
};

export default function DownloadPage() {
  return (
    <main className="page-shell">
      <section className="stub" aria-labelledby="download-title">
        <p className="eyebrow">DOWNLOAD</p>
        <h1 id="download-title">설치 파일 안내를 준비하고 있습니다.</h1>
        <p className="lede">
          운영체제별 설치 방법과 올바른 파일 선택 안내를 이곳에 두겠습니다.
          급하면 지원 채널로 문의해 주세요.
        </p>
        <p>
          <Link href="/support/">지원 안내 보기</Link>
        </p>
      </section>
    </main>
  );
}
