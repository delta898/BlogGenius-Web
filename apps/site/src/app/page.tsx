const capabilities = [
  "블로그 운영 흐름을 더 단순하게",
  "반복 작업은 자동화하고 판단에 집중",
  "안전한 개발과 배포를 바탕으로 확장",
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">BLOGGENIUS</p>
        <h1 id="hero-title">콘텐츠 작업의 좋은 흐름을 만듭니다.</h1>
        <p className="lede">
          BlogGenius 공식 사이트를 준비하고 있습니다. 제품 소개와 다운로드,
          사용 가이드를 이곳에서 차례로 제공하겠습니다.
        </p>
        <ul className="capability-list">
          {capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
