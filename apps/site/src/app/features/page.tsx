import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "../../components/Reveal";

export const metadata: Metadata = {
  title: "기능 | BlogGenius",
  description: "AI 글쓰기부터 자동발행까지, BlogGenius의 기능을 소개합니다.",
};

const groups = [
  {
    title: "AI가 대신 쓰는 블로그",
    body: "어려운 글쓰기는 AI에게 맡기고 주제 선택과 판단에 집중합니다.",
    items: [
      "키워드 하나만 넣어도 사람이 쓴 것 같은 고품질 글이 완성됩니다",
      "상품 링크만 넣으면 정보를 분석해 리뷰와 홍보글을 써줍니다",
    ],
  },
  {
    title: "글감과 트렌드 관리",
    body: "무엇을 쓸지 고민하는 시간을 줄여줍니다.",
    items: [
      "네이버 트렌드와 RSS 구독으로 글감을 편하게 모읍니다",
      "매일 트렌드를 분석해 주기적으로 알아서 발행합니다",
    ],
  },
  {
    title: "소통과 알림",
    body: "댓글과 외부 조작, 결과 확인까지 이어집니다.",
    items: [
      "내용에 맞는 댓글 후보를 만들어 댓글을 쉽게 답니다",
      "텔레그램을 연결하면 언제 어디서나 글을 발행합니다",
      "텔레그램과 Slack으로 발행 결과를 받아봅니다",
    ],
  },
  {
    title: "누구나 쉽게",
    body: "초보자를 기준으로 만든 화면과 운영 방식입니다.",
    items: [
      "보기 편한 화면이라 버튼만 눌러 조작합니다",
      "새 버전이 나오면 셀프 업데이트로 계속 발전합니다",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="page-shell">
      <section className="page-intro" aria-labelledby="features-title">
        <Reveal>
          <p className="eyebrow">FEATURES</p>
          <h1 id="features-title">블로그 운영의 반복을 줄입니다.</h1>
          <p className="lede">
            글쓰기부터 발행과 알림까지, 매일 반복되는 일을 자동화에 맡기세요.
          </p>
        </Reveal>
      </section>
      <div className="feature-grid">
        {groups.map((group) => (
          <Reveal key={group.title} className="feature-card">
            <section aria-label={group.title}>
              <h2>{group.title}</h2>
              <p>{group.body}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <div className="cta-row">
          <Link className="cta-primary" href="/download/">
            다운로드 안내
          </Link>
          <Link className="cta-secondary" href="/support/">
            도움받기
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
