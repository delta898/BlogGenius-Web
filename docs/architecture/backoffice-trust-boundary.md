# Backoffice Trust Boundary

## Purpose

Backoffice(`apps/admin`)가 공개 사이트·Desktop App·Supabase와 맺는 보안·환경·
데이터 경계를 정의한다. 상세 권한 계약은
[Admin Foundation Contract](../decisions/2026-09-21-admin-foundation-contract.md)를 따른다.

## Ownership Boundary

- 이 저장소는 Backoffice 앱 코드·이미지·release metadata를 소유한다.
- Desktop App 저장소(`NaverAutoBlog`)의 Supabase migration·RPC·정책은 원천 계약이며
  복제하거나 임의로 변경하지 않는다. 참조 계약:
  - `licenses`, `license_plans`, `license_usage_operations`,
    `license_device_states` (+ `check_license_status`, `reserve_publish_quota` 등)
  - `app_surface_assets/contents/campaigns/placements`
    (+ `get_app_surface_content` — resolved payload만 소비)
  - `ai_model_catalog_versions` (+ `get_ai_model_catalog` — published snapshot만 소비)
  - `app_runtime_configs` (+ `get_runtime_config`)
- Backoffice가 필요한 신규 schema(audit event, 관리자 프로필·capability 매핑 등)는
  Web 소유로 두며, 소유권과 소비자를 명시하고 순서 있는 migration으로 관리한다.

## Browser Boundary

- 브라우저에는 public/publishable 설정만 전달한다.
- Supabase `service_role`/secret key, database password, provider secret, webhook
  secret, operator token을 bundle·HTML·source map·local storage에 포함하지 않는다.
- 관리자 브라우저가 민감 운영 테이블을 직접 범용 CRUD하지 않는다.
  모든 민감 mutation은 Backoffice server/BFF의 명시적 use case를 거친다.

## Server Boundary

- server-only credential은 환경별 secret store에서만 관리한다.
- `service_role`은 RLS 우회 전제로 최소 범위 서버 코드에서만 사용한다.
- 모든 입력은 server boundary에서 재검증한다. Client 검증은 보안 경계가 아니다.
- mutation 직전에 resource ownership·역할·현재 상태·허용 상태 전이를 확인한다.
- 중요 변경은 transaction·idempotency·optimistic concurrency로 중복 처리와
  lost update를 방지한다.

## Administrator Identity Boundary

- Backoffice 관리자와 Desktop license holder는 서로 다른 보안 주체다.
- 관리자 신원은 환경별 Supabase 프로젝트의 Supabase Auth(초대 전용)에 둔다.
- 검증된 계정 + MFA(TOTP/email OTP 선택식)를 요구한다.

## Environment Boundary

- Development와 Production은 서로 다른 Supabase project·배포·도메인을 사용한다.
  (`admin.dev.bloggenius.kr` / `admin.bloggenius.kr`)
- 실행 중인 Backoffice에서 query parameter·cookie·UI selector로 환경을 전환하지 않는다.
- 설정 오류 시 Production fallback 없이 fail closed한다.
- Development UI에는 텍스트+배지로 Development 표시를 둔다.
  (색상만으로 구분하지 않는다)
- Production 데이터·이메일·license key·HWID·token을 Development로 복사하지 않는다.
- `local`·`development`는 live payment·실제 고객 알림·자동 발행 등 외부 효과를
  기본 차단한다.

## Data Exposure Boundary

- 원본 `license_key`·원본 HWID·인증 code/token·provider payload·secret은
  기본 비노출이다.
- 목록·UI·로그·오류·audit에서는 이메일 부분 마스킹,
  `license_key`·HWID는 뒤 8자리만 표시한다.
- 오류 메시지는 credential·내부 query를 노출하지 않는다.
- export는 별도 권한·최소 컬럼·감사 event·안전한 파일 수명을 갖춘 뒤 추가한다.
