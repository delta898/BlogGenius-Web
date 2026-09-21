# Admin Foundation Contract

## Status

- Status: accepted
- Decided: `2026-09-21`
- Source record: `docs/plans/archive/2026-09-21-admin-foundation-contract-development.md`

## Context

공개 사이트 기초가 잡힌 뒤 Backoffice를 시작해야 했다. 후보 도메인(관리자 로그인,
사용자 관리, 라이선스 관리, surface contents 관리, AI 모델 관리, 플랜별 기능 관리)을
한 번에 만들면 권한 체계가 층마다 달라질 위험이 있어, 구현보다 먼저 모든 slice가
공유할 기반 계약(역할·capability·audit·에러·마스킹·신원·MFA)을 확정해야 했다.

## Decision

### Roles

- `super_admin`: 관리자 초대·역할 변경 가능.
- `operator`: 일상 운영 mutation 가능.
- `viewer`는 두지 않는다. 필요해지면 capability만 추가한다.
- 마지막 `super_admin` 삭제, 자기 권한 상승, 권한 없는 초대는 서버에서 차단한다.

### Capabilities

권한 검사는 역할 이름이 아니라 capability 단위로 한다. UI 숨김은 편의일 뿐이며
검사는 매 API에서 서버가 수행한다.

- `license:read`, `license:pause`, `license:revoke`
- `surface:read`, `surface:publish`
- `catalog:read`, `catalog:publish`
- `plan:read`, `plan:update` (단, `plan:update`는 `super_admin` 한정 —
  플랜 변경이 전 Desktop 플릿에 즉시 영향이기 때문)
- `config:read`, `config:update`
- `admin:invite`, `admin:role`
- `audit:read`
- `export:request` (별도 승인 전제, 미구현)

### Administrator identity

- 관리자 신원은 환경별 Supabase 프로젝트의 Supabase Auth에 둔다 (초대 전용,
  공개 가입 차단).
- Desktop App의 `license key + HWID` 인증과는 완전히 별개의 보안 주체다.
  재사용하지 않는다.

### MFA

- 로그인 2단계 수단을 선택식으로 제공한다: TOTP(기본 선택) / email OTP 중
  등록된 수단.
- SMS는 과금·SIM 스왑 위험으로 채택하지 않는다.
- 매 로그인에 사용된 수단을 audit에 기록하고, 수단 등록·변경 시
  super_admin에게 알림한다.
- TOTP-only를 원하는 관리자는 email 수단을 등록하지 않으면 된다.
- 전제: 관리자 이메일 계정의 2단계 인증, prod SMTP 발송 설정.

### Masking

- 이메일은 부분 마스킹.
- `license_key`·HWID는 앞을 `*`로 가리고 뒤 8자리만 표시
  (Desktop 앱의 `********ee82bce8` 표시와 동일 정도).
- 전체보기가 필요해지면 별도 capability + audit로 묶는다 (미구현).

### Audit and errors

- 중요 mutation은 append-only audit event 없이 성공 처리하지 않는다.
  필드: actor, environment, action, target, request/correlation id, timestamp(UTC),
  result, 축약 before/after. secret·원본 키·원본 HWID·불필요한 개인정보 제외.
- API 에러는 안정적인 error code + 안전한 사용자 메시지로 분리한다.
  내부 query·credential 노출 금지.

## Alternatives

### Custom admin credential store

별도 테이블 + 직접 세션 구현은 통제권이 크지만 비밀번호 해시·세션 rotation·
CSRF·rate limit·MFA를 전부 손으로 만들어야 해서 공격 표면이 넓어진다.
검증된 Auth 구현을 쓰는 쪽이 장기 유지에 유리하다고 판단해 선택하지 않았다.

### Generic table CRUD for operations

`update(table, payload)` 형태는 service_role이 RLS를 우회한다는 전제와 결합하면
위험하다. `pauseLicense`, `publishNotice` 같은 use-case 단위 API만 허용한다.

### SMS as MFA factor

익숙한 선택지지만 건당 과금, SIM 스왑 공격, 전화번호 수집 부담이 있어 제외했다.
TOTP + email OTP면 현 규모에서 충분하다.

### Viewer role from the start

읽기 전용 역할이 당장 필요하지 않아 제외했다. 나중에 필요해지면 역할 추가가
아니라 capability 부여로 해결한다.

## Consequences

- Security: 이후 모든 slice는 이 계약의 capability·audit·마스킹을 따른다.
  예외가 필요하면 계약 개정으로 처리하고 층별로 임의 확장하지 않는다.
- Environment: Backoffice DB(audit·관리자 신원)는 환경별 Supabase 프로젝트에
  두며, Web 소유 신규 schema로 관리한다. Desktop migration은 건드리지 않는다.
- Compatibility: `license_plans.features` + quota 필드, AI catalog, surface 계약은
  Desktop 원천을 그대로 따르며 쓰기 UI는 배포 순서·rollback 전제 없이 만들지 않는다.
- Operations: TOTP·email OTP 병행 지원 여부, 초대 전용 설정, prod SMTP는
  1층(인증 기반) 착수 전 확인 항목이다.
- 후속: 사용자 관리는 license holder 기준으로 시작하며 account 모델 도입 시
  별도 계약을 정의한다. 공지사항도 별도 domain contract로 분리한다.
