import type { Metadata } from "next";
import Reveal from "../../components/Reveal";

export const metadata: Metadata = {
  title: "이용약관 | BlogGenius",
  description:
    "BlogGenius 데스크톱 앱 이용에 관한 권리와 의무, 라이선스와 이용 한도를 안내합니다.",
};

const sections = [
  {
    id: "terms-purpose",
    title: "1. 목적과 적용 범위",
    body: "이 약관은 도전인생(이하 “운영자”)이 제공하는 BlogGenius 데스크톱 앱과 bloggenius.kr 공개 사이트의 이용에 관한 기본적인 사항을 정합니다. 앱은 사용자 PC에 설치되어 동작하며, 글감 관리·글 생성·블로그 발행을 돕습니다.",
  },
  {
    id: "terms-license",
    title: "2. 라이선스와 이용 자격",
    body: "앱의 기능은 라이선스 키 기반으로 제공됩니다. 라이선스 키는 사용자 본인만 사용해야 하며, 타인에게 양도·대여·공유할 수 없습니다. 앱은 기기식별값을 함께 확인하며, 기기를 변경한 경우에는 앱 안내에 따라 재인증을 받아야 합니다. 테스트 목적으로 제공되는 플랜은 1회성으로 소진되면 다시 사용할 수 없습니다.",
  },
  {
    id: "terms-quota",
    title: "3. 플랜과 이용 한도",
    body: "플랜별로 월간 또는 총량 기준의 이용 한도가 적용됩니다. 현재 플랜과 남은 이용 횟수는 앱의 계정 화면에서 확인할 수 있습니다. 플랜 구성과 한도가 바뀌면 시행 전에 사이트에 공지합니다.",
  },
  {
    id: "terms-account",
    title: "4. 연동 계정의 관리",
    body: "Google 계정, 네이버 로그인, AI API 키, 텔레그램 연결 정보는 사용자가 직접 관리합니다. 로그인 정보가 유출되지 않도록 PC와 계정을 안전하게 보관해야 하며, 제3자에게 계정을 빌려주어 생긴 문제의 책임은 사용자에게 있습니다. 연동은 앱 설정에서 언제든 해제할 수 있습니다.",
  },
  {
    id: "terms-prohibited",
    title: "5. 금지 행위",
    body: "다음 행위를 해서는 안 됩니다. 라이선스 키의 부정 취득·공유·판매, 기기식별값의 위조·변조, 앱의 기술적 보호조치 무력화, 타인의 계정 도용, 법령에 위반되는 콘텐츠의 생성·발행, 서비스의 정상 운영을 방해하는 행위. 위반이 확인되면 기능 제한이나 이용 정지를 할 수 있습니다.",
  },
  {
    id: "terms-paid",
    title: "6. 유료 이용",
    body: "유료 플랜의 가격·결제 수단·청약 철회와 환불 조건은 결제 화면과 별도 안내에서 정하며, 이 약관과 함께 적용됩니다. 결제 관련 문의는 아래 연락처로 접수하면 관련 법령에 따라 처리합니다.",
  },
  {
    id: "terms-change",
    title: "7. 서비스의 변경과 중단",
    body: "운영자는 기능 개선을 위해 앱을 업데이트할 수 있습니다. 서비스를 중단하거나 중요한 내용을 바꿀 때에는 시행 전에 사이트에 공지합니다. Google·Naver·Telegram 등 연동 서비스의 정책 변경이나 장애로 일부 기능이 제한될 수 있습니다.",
  },
  {
    id: "terms-liability",
    title: "8. 책임의 범위",
    body: "앱이 생성한 글의 사실 여부·표현의 적절성과 발행 결과에 대한 최종 판단과 책임은 사용자에게 있습니다. 발행 전에 내용을 확인해 주세요. 무료로 제공되는 범위에서는 법령이 허용하는 한도에서 책임을 집니다.",
  },
  {
    id: "terms-law",
    title: "9. 준거법과 분쟁 해결",
    body: "이 약관은 대한민국 법을 따릅니다. 분쟁이 생기면 먼저 협의를 시도하고, 협의가 안 되면 관련 법령에 따른 관할에서 해결합니다.",
  },
  {
    id: "terms-contact",
    title: "10. 연락처와 시행일",
    body: "약관 문의는 운영자 도전인생, 이메일 amadejjs@naver.com 으로 연락해 주세요. 이 약관은 2026년 9월 20일부터 시행합니다.",
  },
];

export default function TermsPage() {
  return (
    <main className="page-shell">
      <article className="policy" aria-labelledby="terms-title">
        <Reveal>
          <p className="eyebrow">TERMS</p>
          <h1 id="terms-title">이용약관</h1>
          <p className="lede">
            BlogGenius를 이용하기 전에 꼭 읽어주세요. 라이선스·이용 한도·금지
            행위와 문의 창구를 안내합니다.
          </p>
        </Reveal>
        {sections.map((section) => (
          <Reveal key={section.id}>
            <section aria-labelledby={section.id}>
              <h2 id={section.id}>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          </Reveal>
        ))}
      </article>
    </main>
  );
}
