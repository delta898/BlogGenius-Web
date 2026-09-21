# Admin Auth Foundation (1층)

## Status

- Branch: `feature/admin-foundation-contract`
- Base/parent branch: `dev`
- Started: `2026-09-21`
- Status: in progress

## User Need

0층 계약(역할·capability·audit·마스킹·Supabase Auth·MFA)이 승격됐으므로,
이제는 실제 로그인 뼈대가 필요하다. 초대받은 관리자만 들어오고, 세션·MFA·
capability 검사·audit 기록이 동작해야 다음 층(license 조회)을 올릴 수 있다.

## Goal

- 초대 전용 Supabase Auth 로그인 (비밀번호 + MFA)
- cookie 세션 + CSRF + `aal2` 확인 + capability 미들웨어 + audit 기반
- 최초 super_admin 초대 절차 (소유자 수동 초대 + 로컬 CLI 스크립트)
- MFA 미등록 상태에서는 mutation 불가

## Scope

- `apps/admin`의 auth flow: 로그인·MFA 등록(QR)·검증·수단 선택·로그아웃
- `@supabase/ssr` cookie 세션, server-only DAL, environment-bound client
- capability 미들웨어 (`super_admin`·`operator`, 0층 capability 목록)
- audit 기반 (append-only, 0층 스키마; 저장소 sink 포함)
- Development 배지, 로그인 rate limit
- 로컬 초대 CLI (`service_role`은 실행 시점 환경에서만 읽음, repo·이미지 제외)
- 이 개발 기록과 index 반영

## Non-Goals

- license/surface/catalog 등 도메인 화면·API (2층 이후)
- export, 계정 복구 자동화 (수동 runbook으로 대체)
- prod SMTP 구축 (동작 확인만)
- Supabase schema 변경·migration (migration ownership 결정 후)
- Production Auth 설정 변경 (별도 승인 후)

## Boundaries and Risks

- Trust: 브라우저의 Supabase 직접 호출은 로그인/MFA 같은 승인된 public Auth
  동작으로 제한. service_role은 로컬 CLI + 최소 서버 코드에서만.
- Environment: dev/prod Auth는 별개. 공개 가입 차단 + 초대 전용을 양쪽에 확인.
  설정 오류 시 fail closed. feature preview는 Production Auth에 접근 금지.
- Data: 초대·로그인 화면에서 식별자 마스킹 유지. 에러에 내부 정보 노출 금지.
- 2026-09-21 확인 (공식 문서): Supabase Auth MFA factor는 TOTP와 Phone(SMS)
  둘뿐이다. email OTP는 1단계 로그인 수단(`aal1`)이며 2단계 수단으로 등록할 수
  없다. `listFactors()`도 `totp`·`phone`만 반환한다.
  출처: `https://supabase.com/docs/guides/auth/auth-mfa`
- 위 확인에 따라 0층의 "TOTP/email 선택식 MFA"는 네이티브로 구현 불가.
  대안은 Progress and Corrections에 기록하고 사용자와 결정한다.

## Proposed Design

- 스택 평가 문서의 방향을 따른다: `@supabase/ssr` cookie 세션, server/API에서
  `aal` claim 확인, capability 재검사, `server-only` DAL의 안전 DTO.
- MFA 미등록 세션(`aal1`)은 mutation 불가. MFA 등록 강제 흐름을 첫 로그인에 둔다.
- 초대: 소유자가 Dashboard 또는 로컬 CLI로 초대 → 본인이 비밀번호 설정 →
  첫 로그인 시 TOTP 등록 강제 → 정식 활성화.
- 이후 초대는 Backoffice UI(`admin:invite`, super_admin만) + allowlist.

## Stages

1. Auth 지원 여부 확인 (MFA factor 종류 — 완료, 위 Boundaries 참조)
2. MFA 방식 최종 결정 (사용자 합의 대기)
3. 로그인·등록·검증·세션·미들웨어·audit 기반 구현
4. 초대 CLI + 최초 super_admin 초대 runbook
5. 검증 (허용·미인증·권한부족·변조 입력·`aal1` 차단)

## Decisions and Alternatives

- 2026-09-21: 최초 super_admin 만들기는 방안 1(소유자 직접 초대)로 합의.
  일회성 부트스트랩 토큰안은 잔여 공격 표면 때문에 탈락, SQL 직접 insert도 탈락.
- MFA 수단 문제 (2026-09-21 합의: D안):
  - (D, 채택) TOTP-only MFA + email은 초대·비밀번호 재설정·소유자 경유 복구용.
    네이티브 `aal2` 강제, custom 보안 코드 없음. 기기 분실 시 소유자가 재초대.
    공식 문서 확인 결과 email OTP는 2단계 수단으로 등록 불가하므로 선택식 MFA는
    철회하고 0층 승격 문서의 해당 항목은 본 기록이 대체한다.
  - (B, 탈락) TOTP MFA + email 코드 단독 로그인 병행. email 단독은 1단계(`aal1`)라
    0층의 "검증된 계정 + MFA" 요구를 약화한다.
  - SMS 채택은 과금·SIM 스왑 이유로 0층에서 이미 제외.

## Progress and Corrections

- 2026-09-21: 1층 기록 작성. 공식 문서 확인으로 0층 MFA 전제(TOTP/email 선택식)가
  네이티브 불가임을 발견 — 구현 전 확인 항목이 실제 설계 변경을 막아냄.
  코드 작성 전에 발견했으므로 손실 없음.
- 2026-09-21: MFA D안(TOTP-only)으로 합의.
- 2026-09-21: 1층 구현 완료 (코드, working tree).
  - `src/server/`: `supabaseEnv`(fail-closed 공개설정 검증), `authorization`
    (역할·capability 중앙 정의), `audit`(마스킹+stdout JSONL sink),
    `rateLimit`(로그인 시도 제한),     `supabaseServer`(쿠키 세션 + 역할·`aal` claims), `authActions`(로그인·TOTP 등록/검증/해제·로그아웃 + audit)
  - `middleware.ts`: 세션 refresh + `/login`·`/mfa`·앱 경로 가드
    (쿠키는 redirect 응답에도 유지)
  - `src/app/`: `/login`, `/mfa`(검증), `/mfa/enroll`(등록·해제), 홈(환경 배지·
    역할·capability 표시·로그아웃)
  - `scripts/invite-admin.mjs`: 소유자 로컬 초대 CLI (역할은 app_metadata에만)
  - 보안 header 4종 (`next.config.ts`), `service_role`은 CLI 실행 시점 env에서만
- 수정 이력: 테스트가 `supabaseEnv`의 env 검증 버그(process.env 직접 참조)를
  발견해 수정. middleware 쿠키 유실(redirect 시) 수정. 초대 CLI의 역할을
  `user_metadata`에서 `app_metadata`로 수정.
- 2026-09-21: Secure 쿠키 판단을 APP_ENVIRONMENT 이름 → 실제 protocol/host
  기준으로 변경 (`src/server/cookies.ts` + 테스트 4개). 로컬 http에서
  APP_ENVIRONMENT=development로 dev Supabase 대상 테스트가 가능해짐.
  재사용 진입점은 scattered script 대신 `./ops admin-dev`로 추가
  (`apps/admin/.env.local` 사용, Production 의심 시 거부).
- 2026-09-21: 실동작 과정에서 1층 누락 2건 발견 (코드 작성 전이 아니라 작성 후
  발견 — 교훈으로 기록).
  ① 초대 수락 경로 없음: 초대 메일의 accept 링크는 Site URL로 가는데, 받은 쪽에
  token 검증 + 비밀번호 설정 화면이 없었다. `/auth/confirm`(verifyOtp 후
  `/auth/setup-password`) + `passwordActions.setPasswordAction` 추가.
  구 템플릿(token_hash 없음)은 조용히 통과시키지 않고 실패 처리.
  ② Dashboard 초대는 `app_metadata.role`이 안 붙는다. CLI 재초대로 해결
  (초대 + 역할 동시付与). CLI에 `--redirect-to` 추가 — 단 로컬 검증용
  `http://127.0.0.1:3000/auth/confirm`으로만 허용.
- 변경 파일 추가: `src/app/auth/confirm/route.ts`,
  `src/app/auth/setup-password/*`, `src/server/passwordActions.ts`,
  `src/server/passwordPolicy.ts(+test)`, `src/server/cookies.ts(+test)`,
  `ops`(admin-dev), `package.json`(dev:development).
- 변경 파일: `apps/admin/{middleware.ts,next.config.ts,package.json,
  src/server/*.ts,src/app/login/*,src/app/mfa/**/*,src/app/page.tsx,
  src/app/SignOutButton.tsx,src/app/styles.css,scripts/invite-admin.mjs}`,
  `package.json`(test에 `APP_ENVIRONMENT=local`).

## Verification

- [x] MFA 방식 D안 사용자 합의
- [x] Desktop App migration 원천과 계약명 대조 (0층에서 완료)
- [x] 문서 index(`docs/README.md`) 반영
- [x] 자동 검증: typecheck 통과, `pnpm test` 40개 통과,
  `pnpm lint` 통과, `next build` 통과 (단, 빌드는 컴파일 확인용 dummy 값 사용)
- [x] `service_role`이 `src/` 번들에 없는지 grep 확인 (CLI 스크립트 실행 시점 env만)
- [x] dev Auth Dashboard: 공개 가입 차단, 초대 전용, Redirect URL — 사용자 완료
- [x] dev 실동작 6번 전부 통과 (2026-09-21): 초대 → 비밀번호 설정 → OTP 등록 →
  홈(super_admin·capability) → 로그아웃·`/` 차단 → 재로그인 시 검증 화면 →
  OTP 검증 → 홈. audit 출력 확인.
- [ ] prod Auth 설정 + prod 초대 (dev 실동작 통과 후 — 다음 작업)

## Blocker: dev 초대 메일 발송 (2026-09-21, 해결됨)

- 증상: CLI 초대 → `supabase invite failed: Error sending invite email`.
  auth_logs: `/invite` 500 + `535 "5.7.8 Authentication failed"` (Supabase→Brevo SMTP 로그인 거부).
- 원인: Brevo 측 unauthorized IP 제한. 해소 후 발송 정상 (초대 메일 도착 확인).
  직접 curl의 67(login denied)은 동일 원인의 다른 얼굴이었으며 본류 아님.
- prod 주의: Brevo IP 제한이 prod SMTP에도 걸릴 수 있음. prod 설정 시 확인.
- 관련 산출물: `scripts/assign-admin-role.mjs` (메일 없이 역할 부여, 향후 역할 변경에도 사용).
- 2026-09-21: 세션 유실 미스터리 해결. 증상: `/auth/confirm` verify 성공(audit
  success) 직후 `/auth/setup-password`가 항상 `/login`으로. 원인: dev 서버의
  `request.url`/`nextUrl` host가 브라우저 실제 접속 host와 달랐다 (관측:
  브라우저 127.0.0.1 vs request.url localhost). 우리 리다이렉트가
  `new URL(path, request.url)`로 절대 URL을 만들어別 host(localhost)로 보내서
  127.0.0.1용 세션 쿠키가 전송되지 않은 것. 증거: curl로 Host 127.0.0.1 요청 시
  request.url이 localhost로 기록됨 + localhost 쿠키함 비어 있음.
  수정: `src/server/requestHost.ts` 신설 — 리다이렉트 URL은 Host 헤더
  (허용 목록: localhost·127.0.0.1·bloggenius.kr 도메인,以外 fail-closed) 기준 생성.
  confirm route·middleware 전부 교체 + 테스트 4개. 교훈: dev/prod를 막론하고
  리다이렉트 host는 절대 request.url에 의존하지 않는다.
- 2026-09-21: 초대 메일 템플릿이 implicit 방식(`#access_token` fragment)이라
  서버가 token을 읽을 수 없어 `/auth/confirm`이 실패하고 `/login?error=invite`로
  가던 문제 발견. 초대 템플릿을 PKCE 방식(`?token_hash=&type=`)으로 교체해야
  함 (Dashboard → Authentication → Emails → Templates → Invite user).
  CLI의 `--redirect-to`는 템플릿의 `{{ .RedirectTo }}` 분기로 살린다.
  부수 확인: 초대 JWT의 `app_metadata.role=super_admin`으로 CLI 역할 부여 정상
  동작 입증. 로그인 페이지에 `?error=` 배너 표시 추가.
- 주의: secret 3종(anon·service_role·Brevo SMTP 키)의 자리 구분 유지.
  service_role·SMTP 키를 채팅·문서·repo에 기록하지 말 것.
- OTP secret은 관리자 본인의 OTP 앱에만 둔다 (스크린샷·문서·채팅에 노출 금지).
  분실 대비 복구 절차(소유자 재초대)는 prod 전에 운영 문서로 남긴다.
- [x] 허용·미인증·권한부족 테스트: 미인증 `/`→로그인, `aal1`→MFA 강제,
  역할 없는 계정 capability 없음(deny-by-default 단위 테스트) 확인.
  변조 입력(잘못된 비밀번호·OTP·토큰 재사용)은 실동작 중 확인.

## Remaining Risks and Follow-up

- audit 저장소 sink(DB 테이블 vs 서버 로그): migration ownership 결정과 연결.
  스택 평가는 Desktop 저장소가 canonical migration owner이며 Web의 독립 history를
  경계한다. 1층에서 audit 테이블이 필요해지면 owner를 먼저 정한다.
- prod SMTP는 email 초대·재설정 발송에 필요. 구축은 별도 작업.
- TOTP-only 채택 시 기기 분실 복구는 소유자 재초대 runbook으로 커버한다.

## Result

진행 중이다.
