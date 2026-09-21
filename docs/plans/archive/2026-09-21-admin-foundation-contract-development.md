# Admin Foundation Contract (0층)

## Status

- Branch: `feature/admin-foundation-contract`
- Base/parent branch: `dev`
- Started: `2026-09-21`
- Status: in progress

## User Need

Static page 기초가 잡혔으므로 Backoffice를 시작해야 한다. 후보 도메인은
관리자 로그인, 사용자 관리, 라이선스 관리, surface contents 관리, AI 모델 관리,
플랜별 기능 관리(config)다. 한 번에 다 만들지 않고 매일 집을 짓듯 하나의
완결된 vertical slice씩 쌓기 전에, 모든 층이 공유할 기반 계약(역할·capability·
audit·에러·마스킹)을 먼저 확정해야 한다.

## Goal

- Admin 0층 기반 계약 초안을 문서로 확정한다: 역할, capability 목록, audit event
  스키마, 공통 에러코드, 민감정보 마스킹 규칙.
- 이후 slice(인증 기반 → 읽기 전용 license 조회 → 제한된 mutation → surface →
  AI 모델/플랜 기능)가 이 계약을 참조하게 한다.
- Desktop App 원천 계약과 충돌하지 않음을 확인한다.

## Scope

- `docs/decisions/` 또는 `docs/architecture/` 승격 전 초안 계약 정리
  (역할·capability·audit·에러·마스킹)
- Desktop App 계약 참조 확인: `licenses`, `license_plans`,
  `license_usage_operations`, `app_surface_*`, `ai_model_catalog_versions`,
  `app_runtime_configs`와 대응 RPC
  (`check_license_status`, `get_app_surface_content`, `get_ai_model_catalog`,
  `get_runtime_config`)
- 이 개발 기록과 `docs/README.md` index 반영

## Non-Goals

- 인증/MFA/세션 구현 (1층에서)
- license 조회·mutation UI/API 구현 (2·3층에서)
- surface/AI 모델/플랜 기능 관리 구현 (4·5층에서)
- Supabase schema 변경, migration 작성
- Production 데이터 조회

## Boundaries and Risks

- Trust boundary: 브라우저에는 public 설정만. service_role·secret은 서버 전용.
  범용 `update(table, payload)` API 금지, use-case 단위 API만 허용.
- Environment boundary: Development/Production Supabase·도메인 분리,
  쿼리파라미터·쿠키·UI selector로 환경 전환 금지, 설정 오류 시 fail-closed.
  Development UI에는 텍스트+배지 표시.
- Data boundary: 원본 `license_key`·원본 HWID·token은 목록·로그·audit에 노출
  금지. `license_plans`·catalog·config 변경은 Desktop App 호환성에 직접 영향 —
  배포 순서와 rollback 전제 없이 쓰기 UI를 만들지 않는다.
- Account boundary: license holder와 미래 account 모델을 혼동하지 않는다.
  동일 이메일로 license 자동 병합 금지.

## Proposed Design

- 역할은 최소 집합에서 시작: `super_admin`, `operator` 2개.
  `viewer`는 불필요하기로 합의 (2026-09-21). 필요해지면 capability만 추가.
  세부 권한은 역할 이름 비교가 아니라 capability 단위로 정의한다.
- Capability는 조회·상세·mutation·export·관리자권한변경으로 분리한다.
  예: `license:read`, `license:pause`, `surface:publish`, `catalog:publish`,
  `admin:invite`, `audit:read`, `export:request`.
- `plan:update`는 `super_admin` 한정으로 합의 (2026-09-21).
  플랜 변경은 전 Desktop 플릿에 즉시 영향.
- Audit는 append-only: actor, environment, action, target, request/correlation id,
  timestamp, result, 축약 before/after. secret·원본 키·원본 HWID 제외.
  audit 기록 실패 시 중요 mutation을 성공 처리하지 않는다.
- 에러는 안정적인 error code + 안전한 사용자 메시지 분리. 내부 query·credential
  노출 금지.
- 마스킹: 이메일 부분 마스킹. license_key·HWID는 앞을 `*`로 가리고 뒤 8자리만
  표시 (Desktop 앱의 `********ee82bce8` 표시와 동일 정도, 2026-09-21 합의).
  전체보기가 필요하면 별도 capability + audit로 묶는다 (지금은 미구현).

## Stages

1. 역할·capability·audit·에러·마스킹 초안 계약 작성 (코드 없음)
2. 사용자와 초안 합의, 대안·trade-off 기록
3. 안정된 내용을 `docs/architecture/`·`docs/decisions/`로 승격
4. 1층(인증 기반) 계획으로 연결

## Decisions and Alternatives

- 2026-09-21: 미리 6개 도메인을 만들지 않고 0층 계약부터 하기로 합의.
  대안(인증 구현부터 바로 시작)은 기반 없이 권한 체계가 층마다 달라질 위험이 있어
  보류. 대안(전체 도메인 계약을 한 번에 확정)은 Desktop 호환성 검토가 커져
  slice별 계약으로 분할하기로 함.
- 브랜치 전략: `feature/admin-foundation-contract`에서 `dev` 기준으로 작업.
  미커밋 문서 2건은 `dev`에 `docs:` 커밋으로 먼저 정리하고 분기함.
- 2026-09-21: 역할은 `super_admin`·`operator` 2개로 합의 (`viewer` 불필요).
  `plan:update`는 `super_admin` 한정. 마스킹은 Desktop 표시와 동일하게
  license_key·HWID 모두 뒤 8자리만 표시.
- 2026-09-21: Backoffice DB(audit·관리자 신원)는 환경별 Supabase 프로젝트
  (dev/prod 분리)에 두기로 합의. Web 소유 신규 schema로 관리하고 Desktop
  migration은 건드리지 않는다.
- 2026-09-21: 관리자 신원은 Supabase Auth(초대 전용, 공개 가입 차단)로 합의.
  Desktop `license key + HWID`와 완전 별개 주체. 직접 구현안은 비밀번호 해시·
  세션·MFA를 전부 손으로 만들어야 해서 탈락.
- 2026-09-21: MFA는 로그인 시점에 2단계 수단을 선택하는 방식으로 합의 (TOTP /
  email OTP 중 등록된 수단 제시, 기본 선택은 TOTP). 비상 우회가 아니라 정식
  선택지다. SMS는 과금·SIM 스왑 위험이 있어 채택하지 않는다. 선택식의 보안
  하한선은 가장 약한 등록 수단이므로: ① 매 로그인에 사용된 수단을 audit에
  기록 ② 수단 등록·변경 시 super_admin 알림 ③ TOTP-only를 원하는 관리자는
  email 수단을 등록하지 않으면 됨. 1층 착수 전 확인: dev/prod Auth에서
  TOTP·email OTP의 2단계 수단 병행 지원 여부, 등록 수단 목록 조회 API,
  공개 가입 차단, 초대 전용 설정, prod SMTP.

## Progress and Corrections

- 2026-09-21: 미커밋 2건(`privacy-policy`, `site-seo` 결과 마무리)을 `dev`에
  커밋(`c04befd`) 후 브랜치 생성, 개발 기록 작성.
- 2026-09-21: Desktop 원천 계약 확인. `license_plans`는
  `plan_code/display_name/status/quota_mode/quota_limit/quota_cycle/
  features(jsonb)/note` 구조이며, 플랜별 기능 관리는 `features` +
  quota 필드(`quota_mode/limit/cycle`)를 대상으로 한다. `app_runtime_configs`는
  네이버 키·TTL 같은 운영 설정으로 별개 영역임을 확인.
  참조: `NaverAutoBlog/supabase/migrations/202608270001_license_v4_unique_keys.sql`,
  `202608270008_runtime_config.sql`, `202608270009_ai_model_catalog.sql`,
  `202608270012_surface_content.sql`.

## Verification

- [ ] Desktop App migration 원천과 계약명 대조 완료
- [ ] 역할·capability·audit 초안에 대한 사용자 합의 기록
- [ ] 문서 index(`docs/README.md`) 반영

## Remaining Risks and Follow-up

- 인증 공급자·세션 저장소·MFA 방식 미정이 1층의 선행 결정으로 남음.
- 공지사항은 별도 domain contract로 분리 예정, 본 기록에서 다루지 않음.

## Result

0층 합의 8건(역할 2개·capability + plan:update 한정·audit/에러 계약·뒤 8자리
마스킹·Supabase Auth·TOTP/email 선택식 MFA·Backoffice DB 환경별 분리)을
`docs/decisions/2026-09-21-admin-foundation-contract.md`와
`docs/architecture/backoffice-trust-boundary.md`로 승격하고 본 기록은 archive로
이동한다. 1층(인증 기반)은 승격된 계약 위에서 시작한다.
