import type { Metadata } from "next";
import Reveal from "../../components/Reveal";

export const metadata: Metadata = {
  title: "개인정보처리방침 | BlogGenius",
  description:
    "BlogGenius 데스크톱 앱과 공개 사이트가 어떤 정보를 수집·이용·보관하고 어떻게 파기하는지 안내합니다.",
};

const collectedItems = [
  {
    item: "Google 계정 OAuth 토큰 (액세스·갱신 토큰)",
    purpose: "사용자가 지정한 구글 스프레드시트에 글감을 읽고 쓰는 연결 유지",
    storage: "사용자 PC의 앱 저장 영역에 보관하며, 갱신 토큰이 유효한 동안 자동 갱신합니다",
  },
  {
    item: "스프레드시트 글감 데이터 (키워드·주제 등 사용자가 입력한 내용)",
    purpose: "글 생성과 발행 작업의 재료로 사용",
    storage: "사용자 본인의 스프레드시트에 보관되며 앱은 작업 시점에 읽고 씁니다",
  },
  {
    item: "네이버 로그인 세션 (브라우저 쿠키·세션)",
    purpose: "사용자 본인의 네이버 블로그에 글을 발행하기 위한 로그인 유지",
    storage: "사용자 PC의 앱 저장 영역에 보관되며, 만료되면 다시 로그인합니다",
  },
  {
    item: "AI API 키 (사용자가 설정에 직접 입력)",
    purpose: "글 생성을 위한 AI 호출 인증",
    storage: "사용자 PC의 앱 설정에 보관되며, 운영자가 키 원문을 수집하지 않습니다",
  },
  {
    item: "라이선스 키·기기식별값(HWID)·발행 사용량",
    purpose: "부정 사용 방지, 플랜별 이용 한도(quota) 적용과 라이선스 상태 안내",
    storage: "라이선스 검증·quota 처리를 위해 운영자의 라이선스 서버로 전송·보관합니다",
  },
  {
    item: "이메일 주소 (사용자가 입력한 경우에 한함)",
    purpose: "이메일 인증, 라이선스 복구, 플랜 전환 자격 확인, 중요한 라이선스 상태 안내",
    storage: "라이선스 서버에 보관되며, 인증 코드는 이메일 발송 대행을 통해 전달됩니다",
  },
  {
    item: "텔레그램 연동 정보 (봇 토큰·대화 식별값 등 사용자가 입력한 값)",
    purpose: "원격 발행 조작과 발행 결과 알림 전송",
    storage: "사용자 PC의 앱 설정에 보관됩니다",
  },
  {
    item: "생성·발행 콘텐츠 (글감·생성 글 등)",
    purpose: "AI 글 생성과 블로그 발행이라는 앱의 핵심 기능 수행",
    storage: "생성을 위해 AI 서비스에, 발행을 위해 사용자의 블로그에 전송됩니다",
  },
];

const thirdParties = [
  {
    name: "Google (AI API·스프레드시트 API)",
    purpose: "사용자 요청에 따른 글 생성과 스프레드시트 읽기·쓰기",
  },
  {
    name: "Naver",
    purpose: "사용자 요청에 따른 블로그 글 발행",
  },
  {
    name: "Supabase (라이선스 서버)",
    purpose: "라이선스 검증·이용 한도 처리·이메일 연결 정보 보관",
  },
  {
    name: "Brevo (이메일 발송 대행)",
    purpose: "라이선스 이메일 인증 코드 발송",
  },
  {
    name: "Telegram",
    purpose: "사용자가 연결한 경우 발행 조작과 결과 알림 전송",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell">
      <article className="policy" aria-labelledby="privacy-title">
        <Reveal>
          <p className="eyebrow">PRIVACY POLICY</p>
          <h1 id="privacy-title">개인정보처리방침</h1>
          <p className="lede">
            BlogGenius(이하 &ldquo;앱&rdquo;)와 이 공개 사이트의 운영자
            도전인생은 사용자의 정보를 아래와 같이 처리합니다. 시행일:
            2026년 9월 20일.
          </p>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-scope">
            <h2 id="privacy-scope">1. 적용 범위</h2>
            <p>
              이 방침은 사용자 PC에서 실행되는 BlogGenius 데스크톱 앱과
              bloggenius.kr 공개 사이트에 적용됩니다. 앱은 SaaS가 아니라
              사용자 컴퓨터에 설치되어 동작하며, 대부분의 설정과 인증 정보는
              사용자 PC에 보관됩니다.
            </p>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-collect">
            <h2 id="privacy-collect">2. 수집하는 정보와 이용 목적, 보관 장소</h2>
            <ul className="policy-list">
              {collectedItems.map((entry) => (
                <li key={entry.item}>
                  <h3>{entry.item}</h3>
                  <p>이용 목적: {entry.purpose}</p>
                  <p>보관: {entry.storage}</p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-not-collect">
            <h2 id="privacy-not-collect">3. 수집하지 않는 정보</h2>
            <p>
              bloggenius.kr 공개 사이트는 회원가입·문의 폼·방문자 분석·광고용
              쿠키를 두지 않으며, 사이트 이용만으로 개인정보를 수집하지
              않습니다.
            </p>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-third">
            <h2 id="privacy-third">4. 정보가 전송되는 연동 서비스</h2>
            <p>
              아래 전송은 모두 앱 기능을 수행하기 위한 것으로, 운영자가 정보를
              별도로 판매하거나 목적 외로 이용하지 않습니다.
            </p>
            <ul className="policy-list">
              {thirdParties.map((entry) => (
                <li key={entry.name}>
                  <h3>{entry.name}</h3>
                  <p>목적: {entry.purpose}</p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-google">
            <h2 id="privacy-google">5. Google API 이용에 관한 고지</h2>
            <p>
              앱은 사용자의 구글 스프레드시트에 접근하기 위해 Google OAuth를
              사용합니다. 요청 범위는 스프레드시트 접근이며, 접근은 항상 사용자
              본인 계정의 권한으로만 수행됩니다. 저장된 토큰은 사용자 PC에만
              보관됩니다.
            </p>
            <p>
              Google 계정의 보안 설정에서 언제든 앱의 접근 권한을 철회할 수
              있으며, 철회 후에는 스프레드시트 연동 기능이 동작하지 않습니다.
              Google API를 통한 정보 이용에는 Google 개인정보처리방침이 함께
              적용됩니다.
            </p>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-retention">
            <h2 id="privacy-retention">6. 보유와 파기</h2>
            <p>
              사용자 PC의 인증 정보와 설정은 연결을 해제하거나 앱 저장 데이터를
              삭제하면 제거됩니다. 라이선스 서버의 라이선스·이용 기록은 부정
              사용 방지와 분쟁 대응을 위해 목적 달성 후 파기하며, 법령이 보존을
              요구하는 경우에는 해당 기간 동안 보관합니다.
            </p>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-rights">
            <h2 id="privacy-rights">7. 이용자의 권리</h2>
            <p>
              사용자는 자신의 정보에 대한 열람·정정·삭제와 연동 해제를 요청할 수
              있습니다. 앱 설정에서 직접 해제할 수 있는 항목 외에는 아래
              연락처로 요청해 주세요. 요청받은 내용은 본인 확인 후 지체 없이
              처리합니다.
            </p>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-contact">
            <h2 id="privacy-contact">8. 책임자와 연락처</h2>
            <p>
              개인정보 처리에 관한 문의와 권리 행사는 운영자 도전인생,
              이메일 amadejjs@naver.com 으로 연락해 주세요.
            </p>
          </section>
        </Reveal>
        <Reveal>
          <section aria-labelledby="privacy-change">
            <h2 id="privacy-change">9. 방침의 변경 고지</h2>
            <p>
              이 방침이 바뀌면 시행 7일 전에 이 사이트에 변경 내용을 공지합니다.
            </p>
          </section>
        </Reveal>
      </article>
    </main>
  );
}
