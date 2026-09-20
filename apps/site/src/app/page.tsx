import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../components/Reveal";

export const metadata: Metadata = {
  title: "BlogGenius | 주제만 정하세요",
  description: "어려운 컴퓨터 지식 없이 블로그를 운영하는 데스크톱 도우미, BlogGenius를 소개합니다.",
};

const highlights = [
  {
    title: "키워드 하나로 AI가 글을 씁니다",
    body: "사람이 쓴 것 같은 고품질 글이 뚝딱 완성됩니다.",
  },
  {
    title: "상품 링크만으로 쇼핑 포스팅을 만듭니다",
    body: "정보를 분석해 깔끔한 리뷰와 홍보글을 써줍니다.",
  },
  {
    title: "잠자는 동안에도 알아서 발행합니다",
    body: "매일 트렌드를 분석해 주기적으로 글을 올려줍니다.",
  },
];

const steps = [
  {
    title: "1단계: AI 두뇌 준비",
    body: "구글 AI 스튜디오에서 무료로 발급받은 키를 프로그램 설정에 붙여넣습니다.",
  },
  {
    title: "2단계: 글감 일기장 연결",
    body: "글감을 저장할 구글 스프레드시트 주소(URL)를 설정에 넣어줍니다.",
  },
  {
    title: "3단계: 네이버 로그인",
    body: "프로그램의 로그인 버튼으로 네이버에 로그인하면 바로 시작할 수 있습니다.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="hero-title">
        <Reveal>
          <p className="eyebrow">BLOGGENIUS</p>
          <h1 id="hero-title">주제만 정하세요. 글쓰기부터 발행까지 자동으로.</h1>
          <p className="lede">
            BlogGenius는 어려운 컴퓨터 지식 없이도 누구나 전문가처럼 블로그를
            운영하는 데스크톱 프로그램입니다.
          </p>
        </Reveal>
        <div className="capability-grid">
          {highlights.map((highlight) => (
            <Reveal key={highlight.title} className="capability-card">
              <h2>{highlight.title}</h2>
              <p>{highlight.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="cta-row">
            <Link className="cta-primary" href="/download/">
              다운로드 안내
            </Link>
            <Link className="cta-secondary" href="/features/">
              기능 더 보기
            </Link>
          </div>
        </Reveal>
      </section>
      <Reveal>
        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title">딱 3단계로 시작합니다</h2>
          <ol className="steps-list">
            {steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>
    </main>
  );
}
