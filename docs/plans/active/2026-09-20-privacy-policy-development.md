# Privacy Policy Page

## Status

- Branch: `feature/privacy-policy`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

Google OAuth 브랜드 인증을 `bloggenius.kr`로 이전하려면 공개
개인정보처리방침 페이지가 필요하다. 이전 `blog.gongzza.com` 신청은
"방침 내용 부족"으로 반려된 바 있어 한 번에 통과할 수준으로 만들어야 한다.

## Goal

- `https://www.bloggenius.kr/privacy-policy/` 경로에 실내용 방침을 둔다.
- Desktop 실제 데이터 흐름에만 근거해 작성한다 (날조 금지).
- 푸터에 방침 링크를 추가한다. 주 메뉴는 바꾸지 않는다.

## Scope

- Desktop 저장소 읽기 전용 인벤토리 (수정 없음)
- `/privacy-policy/`·`/terms/` 페이지와 방침·약관 공용 스타일
- 푸터 법적 링크 2개와 이 개발 기록

## Non-Goals

- 주 내비게이션 변경
- Supabase·Desktop 코드 변경
- Search Console·Cloud Console 작업 (사용자 직접 수행)

## Data Inventory (Desktop 저장소 확인済み)

- Google Sheets OAuth 단일 방식: 사용자 Google 계정 승인, access/refresh
  token을 앱이 보관·자동 갱신, scope `.../auth/spreadsheets`,
  service account 방식 제거 (`google-sheets-credentials-plan.md`)
- 네이버 로그인은 앱 내 브라우저 세션·쿠키 기반 (위 문서 대비 표)
- 라이선스: 고유 키 + HWID를 Supabase RPC로 검증·quota 차감,
  이메일은 verified contact로 복구·안내에 사용, 키는 로컬
  `config/license.key` 저장 (`license-policy.md`, operations guide)
- 이메일 인증코드는 Brevo 발송 함수 (`send-license-code`, `BREVO_API_KEY`)
- 텔레그램 연결·알림은 로컬 설정 기반 (README, config sample)
- AI API 키는 사용자가 설정에 직접 입력 (README 3단계)

## Proposed Design

방침은 수집 항목·목적·보관, 수집하지 않는 것(웹사이트 무수집 선언),
제3자·연동 서비스(Google·Naver·Supabase·Brevo·Telegram), 보유·파기,
이용자 권리(열람·정정·삭제 요청 창구), Google API 고지(OAuth 범위와
접근 철회 방법), 책임자·연락처(`도전인생`, `amadejjs@naver.com`),
변경 고지로 구성한다. 확인되지 않은 저장 경로·암호화·보유기간 수치는
단정하지 않고 원칙 서술로 둔다.

## Boundaries and Risks

- 법률 자문이 아니라 운영자 고지 문서다. 표현은 단정보다 사실 중심.
- 시행일은 작성일(`2026-09-20`)로 둔다.
- Production `www`가 라이브되어야 심사관이 페이지를 열 수 있다. 인증
  신청 전 Production cutover가 선행되어야 한다.

## Stages

1. 인벤토리 (완료)
2. 페이지·스타일·푸터 링크 구현
3. typecheck·build·lint 검증

## Decisions and Alternatives

- 경로는 Google 관례인 `/privacy-policy/`를 사용한다.
- 주 메뉴 제외·푸터 포함: 법적 페이지는 주 내비 대상이 아니다.

## Progress and Corrections

- 2026-09-20: 브랜치 생성, 인벤토리 후 기록 작성.
- 구현 완료: `/privacy-policy/` 9개 절(범위·수집 8항목·무수집 선언·연동 5곳·
  Google 고지·보유·권리·책임자·변경 고지), 방침 스타일, 푸터 링크.
  typecheck·build(7경로)·eslint 통과.
- `/terms/` 추가: 목적·라이선스·한도·연동 관리·금지행위·유료 원칙·중단·책임·
  준거법·연락처 10개 절. 수치·결제조건 등 미확정 사항은 단정하지 않고 원칙
  서술로 둠. 푸터에 이용약관 링크 추가.

## Verification

- site typecheck·production build·eslint
- 산출물에 방침 본문과 시행일 존재 확인
- Google 관점 자가 점검: 수집·사용 세부정보, 운영자 신원, 연락처, 범위 고지

## Remaining Risks and Follow-up

- `/terms/` 신설 (다음 작업)
- Production cutover 후 실제 URL 접근 확인
- Search Console 소유권과 승인된 도메인 등록 (사용자)

## Result

`/privacy-policy/` 9절과 `/terms/` 10절, 푸터 법적 링크 2개를 실전 배포/dev·prod
검증까지 완료. Drive·선택 연동 고지는 후속 `privacy-drive-disclosure` 기록으로
이어졌다. Search Console·승인된 도메인·브랜드 재신청은 사용자 측 완료.
