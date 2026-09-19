# BlogGenius Web Working Rules

## 1. Project Identity

- 이 저장소는 BlogGenius의 공개 사이트와 운영자용 Backoffice를 함께 개발하는 Web platform 저장소다.
- 실제 프로젝트 루트는 `/Users/delta898/Project/BlogGenius-Web`이다.
- BlogGenius Desktop App 저장소는 `/Users/delta898/Project/NaverAutoBlog`다.
- Desktop App 저장소는 제품 계약, Supabase schema, license 정책, 환경 분리 방식을
  확인하기 위한 주요 참고 자료다.
- 별도 요청이 없는 한 Web 작업 중 Desktop App 저장소를 수정하지 않는다.
- 두 저장소 사이에 계약 변경이 필요하면 영향 범위와 적용 순서를 먼저 설명하고
  사용자의 승인을 받은 뒤 각각의 저장소에서 작업한다.

## 2. Product Direction

우선순위는 다음과 같다.

1. 보안과 운영 안전성
2. Development와 Production의 강한 분리
3. 공개 사이트와 관리자 앱을 독립적으로 배포할 수 있는 작고 검증 가능한 기본 구조
4. 명시적인 권한과 감사 가능성
5. 사용자 관리, license 관리, 콘텐츠 관리, 공지사항 관리의 단계적 확장

- 초기부터 많은 기능을 한 번에 넣지 않는다.
- 공통 기반을 먼저 만들고 하나의 완결된 vertical slice씩 추가한다.
- 빠른 임시 구현보다 이후 기능을 안전하게 확장할 수 있는 구조를 우선한다.
- 기술 스택, 인증 공급자, 배포 플랫폼, 결제 공급자처럼 되돌리기 어려운 선택은
  비교안과 trade-off를 정리하고 사용자와 결정한다.

## 3. Canonical Environments

BlogGenius Web platform의 canonical environment는 다음 세 가지다.

- `local`
- `development`
- `production`

환경 이름과 의미를 임의로 추가하거나 `dev` 같은 별칭을 만들지 않는다.

### Mandatory separation

- Development와 Production은 서로 다른 Supabase project를 사용한다.
- Development와 Production은 서로 다른 public site 및 Backoffice deployment와 domain을 사용한다.
- Canonical product domain은 `bloggenius.kr`다.
- Production public site는 `www.bloggenius.kr`, Production Backoffice는
  `admin.bloggenius.kr`를 사용한다.
- Development public site는 `dev.bloggenius.kr`, Development Backoffice는
  `admin.dev.bloggenius.kr`를 사용한다.
- Apex `bloggenius.kr`는 canonical public site인 `www.bloggenius.kr`로 redirect한다.
- 환경별 secret, OAuth 설정, cookie, storage, webhook, 외부 서비스 설정을 분리한다.
- Production deployment는 Production Supabase만 접근할 수 있어야 한다.
- Development deployment는 Development Supabase만 접근할 수 있어야 한다.
- 하나의 실행 중인 Backoffice에서 query parameter, cookie, UI selector 또는 요청값으로
  환경을 전환하지 않는다.
- 설정이 없거나 잘못된 경우 Production으로 fallback하지 않고 fail closed한다.
- 화면, 로그, API 응답에 현재 환경을 안전하게 식별할 수 있어야 하며 Development UI에는
  항상 눈에 띄는 Development 표시를 둔다.
- 실제 Production 데이터, 이메일, license key, HWID, token을 Development로 복사하지 않는다.
- fixture와 seed는 가짜 데이터만 사용하며 Production seed와 분리한다.

### External effects

- `local`과 `development`는 live payment, 실제 고객 알림, 자동 발행 등 외부 효과를
  기본적으로 차단한다.
- Development에서 외부 연동이 필요하면 sandbox, allowlist, sink, 테스트 계정과 제한된
  budget을 사용한다.
- Production 외부 효과는 명시적인 기능 정책과 배포 승인 없이는 활성화하지 않는다.

## 4. Security and Trust Boundaries

### Browser boundary

- 브라우저에는 public/publishable 설정만 전달한다.
- Supabase `service_role`/secret key, database password, provider secret, webhook secret,
  operator token을 브라우저 bundle, HTML, source map, local storage에 포함하지 않는다.
- 관리자 브라우저가 민감한 운영 테이블을 직접 범용 CRUD하지 않도록 한다.
- 모든 민감한 mutation은 Backoffice server/BFF의 명시적인 use case를 거친다.

### Server boundary

- server-only credential은 환경별 secret store에서만 관리한다.
- service role은 RLS를 우회할 수 있다는 전제로 최소 범위의 서버 코드에서만 사용한다.
- 범용 `update(table, payload)` 형태의 관리자 API보다 `pauseLicense`, `publishNotice`처럼
  허용된 행위를 표현하는 API를 사용한다.
- 모든 입력은 server boundary에서 다시 검증한다. Client 검증은 보안 경계가 아니다.
- resource ownership, 역할, 현재 상태, 허용된 상태 전이를 mutation 직전에 확인한다.
- 중요 변경은 transaction, idempotency key 또는 optimistic concurrency를 사용해
  중복 처리와 lost update를 방지한다.

### Administrator identity

- Backoffice 관리자와 BlogGenius 일반 사용자/license holder를 서로 다른 보안 주체로 본다.
- Desktop App의 `license key + HWID` 인증을 관리자 인증에 재사용하지 않는다.
- 관리자 인증에는 검증된 계정과 MFA를 요구한다.
- 초기 관리자 초대는 명시적인 allowlist 또는 초대 흐름으로 제한한다.
- 권한은 최소 권한 원칙과 deny-by-default를 따른다.
- 역할 이름과 세부 권한은 기능 구현 전에 계약으로 정의하며 UI 숨김만으로 권한을
  통제하지 않는다.
- 마지막 `super_admin` 제거, 자기 자신의 권한 상승, 권한 없는 관리자 초대 같은
  위험한 전이는 서버에서 차단한다.

### Web security baseline

- session cookie는 `HttpOnly`, `Secure`, 적절한 `SameSite`와 짧고 명확한 수명을 사용한다.
- state-changing request에는 CSRF 방어를 적용한다.
- 환경별 명시적 origin allowlist와 엄격한 CORS 정책을 사용한다.
- CSP, clickjacking 방어, MIME sniffing 방지, referrer 정책 등 기본 보안 header를 적용한다.
- 로그인, 검색, export, mutation API에는 목적에 맞는 rate limit을 둔다.
- redirect URL과 외부 URL은 allowlist로 검증한다.
- 의존성 추가 시 유지보수 상태, 권한, bundle 영향과 알려진 취약점을 확인한다.

### Sensitive data

- license key, 원본 HWID, 인증 code/token, provider payload와 secret은 기본적으로 노출하지 않는다.
- 목록, UI, 로그, 오류, support payload에서는 이메일과 식별자를 목적에 맞게 마스킹한다.
- secret 또는 개인정보를 Git, migration, seed, fixture, screenshot, 문서에 기록하지 않는다.
- 오류 메시지는 운영자에게 해결 가능한 정보를 주되 credential이나 내부 query를 노출하지 않는다.
- export 기능은 별도 권한, 최소 컬럼, 감사 이벤트, 안전한 파일 수명을 갖춘 뒤 추가한다.

## 5. Authorization and Audit

- 인증과 인가를 분리하고 모든 API에서 인가를 명시적으로 검사한다.
- 권한은 역할 이름만 비교하기보다 capability 단위로 정의한다.
- 목록 조회, 상세 조회, mutation, export, 관리자 권한 변경을 별도 capability로 취급한다.
- Production mutation은 Development보다 강한 확인 절차를 적용한다.
- license 변경, 사용자 상태 변경, 콘텐츠 게시, 공지 게시, 관리자/권한 변경 등 모든 중요한
  mutation은 append-only audit event를 남긴다.
- audit event에는 최소한 actor, environment, action, target, request/correlation id, timestamp,
  result와 안전하게 축약된 before/after 정보를 기록한다.
- audit log에는 secret, 원본 license key, 원본 HWID와 불필요한 개인정보를 넣지 않는다.
- audit event 기록 실패를 무시한 채 중요한 mutation을 성공 처리하지 않는다.

## 6. Backend and Database Rules

- Desktop App의 canonical Supabase migration과 정책 문서를 먼저 확인하고 중복 schema를 만들지 않는다.
- Backoffice가 필요한 신규 schema는 소유권과 소비자를 명확히 정한다.
- schema 변경은 순서가 있는 migration으로 관리하며 Dashboard의 수동 변경에 의존하지 않는다.
- migration, operational action, seed, fixture, recovery script를 서로 구분한다.
- destructive migration에는 영향 분석, backup/rollback 또는 forward-recovery 계획과 별도 승인이 필요하다.
- Production schema를 일반 개발이나 테스트 과정에서 조회·변경하지 않는다.
- 직접 table access보다 검토 가능한 service/RPC 경계를 우선하고 grants와 RLS를 테스트한다.
- pagination, filtering, stable sorting을 서버 계약에 포함하고 무제한 전체 조회를 만들지 않는다.
- 날짜와 시간은 저장·API 계약에서 UTC를 사용하고 UI에서 명시적인 timezone으로 표시한다.

## 7. Initial Domain Boundaries

### User management

- 현재 Desktop App의 verified email/license holder와 미래의 로그인 account를 혼동하지 않는다.
- 실제 account model이 도입되기 전에는 license holder 관리라는 현재 사실을 UI와 코드에 반영한다.
- 동일 이메일이라는 이유만으로 account 또는 license를 자동 병합하지 않는다.
- account claim, merge, device transfer에는 재인증과 감사 기록을 요구한다.

### License management

- 기존 `license_plans`, `licenses`, device state, registration, usage operation 계약을 존중한다.
- 원본 license key와 HWID를 일반 목록이나 audit log에 노출하지 않는다.
- plan/status 변경은 허용된 상태 전이와 사유를 요구한다.
- 사용량 조정은 기존 값을 조용히 덮어쓰기보다 조정 event와 근거를 남기는 방향을 우선한다.
- Desktop App 호환성을 깨는 RPC/schema 변경은 양쪽 저장소의 배포 순서와 rollback을 먼저 정한다.

### Content management

- 기존 `app_surface_*` schema와 audience/version/scheduling 계약을 먼저 재사용한다.
- draft, published, paused, retired 상태를 명시적으로 구분한다.
- Preview와 Production 게시를 같은 행위로 취급하지 않는다.
- 외부 URL, asset type, 크기, 공개 범위와 접근성을 검증한다.

### Notice management

- 공지사항은 generic content CRUD로 시작하지 않고 별도 domain contract를 정의한다.
- 최소한 status, severity, audience, app version range, publish window, dismiss policy를 고려한다.
- 예약 게시와 즉시 게시를 구분하고 시간대와 만료 동작을 명시한다.
- Desktop App 소비 계약이 필요한 경우 Backoffice 작성 모델과 Desktop read model을 분리한다.

## 8. Architecture and Coding Rules

- UI, application/use-case, domain, infrastructure 경계를 분리한다.
- UI component에서 service-role client나 database query를 직접 소유하지 않는다.
- 인증/권한/환경 정책을 페이지마다 복사하지 않고 공통 경계에서 일관되게 적용한다.
- 환경 이름, 역할, 상태, capability는 흩어진 문자열 대신 중앙 계약과 validator로 관리한다.
- provider-specific payload를 domain model 전체로 전파하지 않는다.
- 오류는 안정적인 error code와 안전한 사용자 메시지를 분리한다.
- 실패가 마지막으로 확인된 정상 상태를 불필요하게 지우지 않도록 한다.
- 배치와 비동기 작업은 재시도, 중복 실행, 부분 실패, 취소와 관찰 가능성을 설계한다.
- 새로운 abstraction은 실제 두 번째 사용처나 명확한 변경 축이 있을 때 도입한다.
- 아직 선택하지 않은 framework나 infrastructure를 문서에서 확정 사실처럼 쓰지 않는다.

## 9. UI and Operational Safety

- Backoffice UI는 예쁜 화면보다 정확한 상태, 위험도, 대상과 결과를 먼저 전달한다.
- Development와 Production을 색상만으로 구분하지 않고 텍스트와 배지로 함께 표시한다.
- destructive 또는 고객 영향 mutation에는 대상과 영향을 보여주는 확인 단계를 둔다.
- 버튼 disabled 상태만 믿지 않고 server authorization과 domain validation을 함께 적용한다.
- 긴 작업은 progress, 성공/실패 결과, correlation id와 재시도 가능 여부를 보여준다.
- 검색 결과가 없다는 상태와 조회 실패를 구분한다.
- optimistic UI는 운영 mutation의 사실을 오해하게 만들 수 있는 경우 사용하지 않는다.
- 접근성, keyboard navigation, focus, form label과 오류 연결을 기본 품질로 취급한다.

## 10. Development Workflow

### Before implementation

- 작업 시작 시 현재 branch, working tree, 관련 문서와 Desktop App 계약을 확인한다.
- 사용자가 조사, 의견, 진단 또는 설계를 요청한 경우 명시적인 구현 승인 전에는 코드를 수정하지 않는다.
- 중요한 작업은 user need, scope, non-goals, security impact, environment impact, validation plan을 먼저 정리한다.
- 사용자 경험, 데이터 소유권, 비용, 외부 효과, 호환성에 영향을 주는 선택은 설명하고 합의한다.
- 기능 branch를 시작할 때 material implementation보다 먼저 날짜 기반 개발 기록을
  `docs/plans/active/`에 만든다.

### During implementation

- 기존 사용자 변경을 보존하고 관련 없는 파일을 정리하거나 되돌리지 않는다.
- 하나의 review 가능한 vertical slice에 집중한다.
- 기능과 함께 authorization, audit, 실패 상태와 테스트를 구현한다.
- 문서는 실제 계약과 함께 갱신하며 완료 후 기억에 의존해 재작성하지 않는다.
- 임시 우회가 필요하면 만료 조건과 제거 계획을 기록하고 영구 구조처럼 확장하지 않는다.

### Verification

- 변경 위험에 비례해 가장 좁은 관련 테스트부터 실행한다.
- authorization은 허용 사례뿐 아니라 미인증, 권한 부족, 다른 환경과 변조된 입력을 테스트한다.
- database 변경은 clean migration, rollback/forward recovery와 grants/RLS를 검증한다.
- UI 변경은 loading, empty, error, forbidden, stale data와 좁은 화면을 확인한다.
- 전체 테스트 suite, 실제 외부 서비스 호출, 유료 API, 실제 알림과 Production 접속은 실행 전에
  사용자에게 범위와 이유를 알리고 필요한 승인을 받는다.
- 자동 테스트 성공을 시각적 완성이나 Production 안전성의 증거로 과장하지 않는다.

## 11. Git, Deployment, and Approval

- 장기 branch는 `main`과 `dev`를 사용하고 release 준비 시 `release/vX.Y.Z` branch를 만든다.
- 변경 승격 흐름은 `feature/* -> dev -> release/vX.Y.Z -> main`이다.
- `main`은 Production에 승인되어 배포된 source of truth이고 `dev`는 Development integration branch다.
- feature branch는 기본적으로 최신 `dev`에서 만들고 review 가능한 작은 범위로 유지한다.
- 여러 stage를 가진 기능은 `feature/<purpose>` parent와 필요한 sub-feature branch를 사용할 수 있다.
- release branch에는 안정화, version, release note와 release-only fix만 포함하고 기능을 확장하지 않는다.
- release 중 수정한 내용은 `main` 반영 후 `dev`에도 되돌려 합쳐 divergence를 남기지 않는다.
- 긴급 hotfix는 `main`에서 분기하고 Production 검증 후 `main`과 `dev`, 열려 있는 release branch에 반영한다.
- Development 배포는 `dev`, Production 배포는 승인된 release가 반영된 `main` commit/tag에서 수행한다.
- feature/PR preview는 Production Supabase나 Production secret에 접근할 수 없다.
- branch 생성은 사용자가 branched development 시작을 요청하거나 합의한 후 수행한다.
- commit은 논리적으로 작게 유지하고 conventional commit 형식을 사용한다.
- 사용자의 명시적 요청 없이 commit, merge, tag, push, 배포 또는 release를 수행하지 않는다.
- 사용자의 승인 없이 Production database, Production function, Production secret, Production content를
  조회하거나 변경하지 않는다.
- Production 배포는 target identity, branch, migration, secret 존재 여부, diff, rollback 계획을 확인하고
  사용자에게 명시적으로 승인받는다.
- `승인`, `고고`, `gogo` 같은 짧은 승인은 현재 합의된 범위에만 적용되며 push나 배포까지 자동으로
  확대 해석하지 않는다.
- destructive command와 데이터 삭제는 정확한 대상을 read-only 방식으로 먼저 확인하고 별도 승인을 받는다.

## 12. Documentation

문서는 부가 산출물이 아니라 코드와 같은 수준으로 유지하는 engineering asset이다.
구현 결과만 정리하지 않고 질문, 판단, 실패, 수정, 검증과 남은 위험을 작업 중에
축적한다. 완료 시점에 기억에 의존해 개발 과정을 재구성하지 않는다.

### Canonical structure

- `docs/architecture/`: 현재의 안정된 구조와 trust boundary
- `docs/decisions/`: 장기적으로 유지할 결정과 trade-off
- `docs/features/`: 운영자 관점의 기능 계약과 동작
- `docs/plans/active/`: 진행 중인 큰 작업의 범위와 검증 기록
- `docs/plans/archive/`: 완료된 개발 기록
- `docs/operations/`: 환경별 운영, 배포, 장애 대응 runbook
- `docs/backlog.md`: 현재 남아 있는 구체적이고 실행 가능한 후속 작업

`docs/README.md`는 전체 문서의 canonical index다. 문서를 추가, 이동, 승격 또는
archive할 때 같은 변경에서 index도 갱신한다.

### Date and naming rules

- 날짜는 작업이 시작된 한국 시간 기준 `YYYY-MM-DD`를 사용한다.
- 개발 기록과 장기 결정 문서의 파일명은
  `YYYY-MM-DD-normalized-purpose-development.md`,
  `YYYY-MM-DD-normalized-decision.md` 형식을 기본으로 한다.
- 파일명은 branch 또는 주제와 쉽게 연결되는 소문자 kebab-case를 사용한다.
- 날짜는 문서를 나중에 정리한 날짜가 아니라 실제 작업이나 결정이 시작된 날짜다.
- 같은 작업의 parent plan과 stage plan이 있으면 서로 링크하고 각 문서가 독립적으로
  이해될 수 있게 작성한다.

### Feature branch development records

- 모든 feature branch와 독립적으로 review 가능한 sub-feature branch는 자신만의
  `docs/plans/active/` 개발 기록을 가져야 한다.
- 기록은 branch 생성 직후, material implementation 전에 만든다.
- 개발 기록에는 최소한 다음을 포함한다.
  - 정확한 branch 이름, base/parent branch, 시작일, 현재 status
  - user need, goal, scope와 explicit non-goals
  - 제안한 구조, 영향받는 trust/environment/data boundary와 구현 단계
  - 사용자와 확정한 결정, 검토한 대안과 trade-off
  - 진행 중 발견한 사실, 실패, 수정과 원래 계획에서 달라진 점
  - 변경된 파일/계약, automated verification, manual check와 남은 위험
- 작업 중 중요한 판단과 결과가 생길 때마다 기록을 갱신한다.
- branch merge 전에 실제 구현, 검증 결과와 후속 작업을 최신 상태로 맞춘다.
- 완료된 개발 기록은 `docs/plans/archive/`로 이동한다. 장기적으로 유효한 내용은
  architecture, decision, feature 또는 operations 문서로 승격하고 개발 기록에는 링크를 남긴다.
- parent plan은 전체 단계와 stage 문서를 연결하지만, stage 문서의 세부 결과를 대신하지 않는다.

### Documentation lifecycle

- 큰 설계와 아직 변하는 생각은 `docs/plans/active/`에서 시작한다.
- 현재 구현의 안정된 구조와 경계는 `docs/architecture/`로 승격한다.
- 왜 특정 선택을 했고 어떤 대안을 버렸는지는 `docs/decisions/`에 남긴다.
- 운영자가 사용하는 기능의 보장된 동작과 제한은 `docs/features/`에 남긴다.
- 배포, migration, secret rotation, 복구, 장애 대응 절차는 `docs/operations/`에 둔다.
- `docs/backlog.md`는 완료된 항목이나 아이디어 저장소, 두 번째 changelog로 사용하지 않는다.
- 구현과 문서가 다르면 구현을 무조건 사실로 간주하지 말고 의도된 계약을 확인한 뒤
  같은 작업에서 둘을 일치시킨다.
- Desktop App 계약을 참조하는 문서는 정확한 파일 경로와 필요한 contract를 링크하되,
  Desktop 문서를 BlogGenius-Web 저장소에 그대로 복제해 서로 다른 진실의 원천을 만들지 않는다.

### Documentation quality and safety

- 문서에 credential, 실제 개인정보, exploitable operational detail을 기록하지 않는다.
- 장기 계약은 코드와 테스트의 위치를 링크하고 중복된 진실의 원천을 만들지 않는다.
- 환경 구성, 권한 모델, schema 또는 운영 절차가 바뀌면 관련 문서를 함께 갱신한다.
- 문서는 현재 상태, 목표 상태와 아직 구현되지 않은 제안을 명확히 구분한다.
- 완료되지 않은 작업을 완료된 것처럼 쓰거나 테스트하지 않은 내용을 검증됐다고 기록하지 않는다.
- 명령 출력 전체를 붙여 넣기보다 결론, 필요한 증거와 재현 명령을 안전하게 요약한다.
- release note와 개발 기록은 목적이 다르다. 내부 구조 변경을 그대로 사용자용 release note로
  복사하지 않는다.

## 13. Handoff and Definition of Done

완료 보고에는 다음을 포함한다.

- 변경된 사용자/운영자 동작
- 보안 및 환경 경계에 미치는 영향
- 변경 파일과 핵심 설계 결정
- 수행한 자동 검증과 결과
- 수행하지 않은 검증과 남은 위험
- 필요한 migration, secret, 배포 순서와 수동 확인 항목
- 변경이 working tree에만 있는지 commit되었는지 여부

작업은 happy path만 동작한다고 완료된 것이 아니다. 합의된 범위에서 authorization, audit,
실패 처리, 환경 분리, 테스트와 문서가 함께 준비되어야 완료로 본다.

## 14. Current Foundation Scope

초기 구현 순서는 다음을 기본 방향으로 삼되, 각 단계 시작 전 사용자와 범위를 확정한다.

1. public site와 Backoffice를 포함한 workspace 구조와 환경 계약
2. 환경별 설정 검증과 fail-closed startup
3. 관리자 인증, MFA, session과 capability 기반 authorization
4. append-only audit 기반
5. 읽기 전용 license 조회 vertical slice
6. 제한된 license 관리 mutation
7. 기존 app surface content 관리
8. 공지사항 domain과 Desktop read contract
9. 실제 account model에 맞춘 사용자 관리 확장

기능 수보다 신뢰할 수 있는 운영 경계를 먼저 완성한다.
