# Architecture and Stack Evaluation

## Status

- Branch: `main`
- Base/parent branch: `origin/main`
- Started: `2026-09-19`
- Status: proposal; user decision pending

## User Need

보안과 Development/Production 분리를 최우선으로 하는 BlogGenius Web platform의 architecture,
framework와 language를 결정해야 한다. 공개 사이트는 정적으로 제공하고, Backoffice는 작은
기능부터 시작해 사용자, license, 콘텐츠와 공지사항 관리로 확장할 수 있어야 한다.

## Decision Drivers

- Browser에 Supabase secret/service role을 노출하지 않을 것
- 관리자 인증, MFA, capability authorization과 audit를 일관되게 적용할 것
- Development와 Production을 별도 domain, deployment와 Supabase project로 분리할 것
- 한 명 또는 작은 팀이 초기 복잡도를 감당할 수 있을 것
- Desktop App의 Node.js/Supabase 계약을 이해하고 재사용하기 쉬울 것
- Type, runtime validation과 자동 테스트로 AI 생성 코드의 경계 오류를 빨리 찾을 것
- 향후 필요하면 API나 background worker를 독립 service로 추출할 수 있을 것

## Recommended Direction

### Language

- TypeScript `strict` mode
- UI, server/BFF, domain contract와 tests에 같은 언어 사용
- TypeScript type은 compile-time 보조이며 외부 입력에는 별도 runtime validation 적용

### Runtime

- Node.js 24 LTS
- Desktop App의 Node 24 기준과 맞추고 Production에는 Current가 아닌 LTS 사용
- `.nvmrc`와 `package.json.engines`로 version 고정

### Framework

- Next.js App Router
- React Server Component를 기본으로 사용하고 browser interaction이 필요한 작은 경계만
  Client Component로 전환
- Server Component는 server-only DAL을 직접 호출하고 자기 자신의 Route Handler를 HTTP로
  다시 호출하지 않음
- Browser가 필요한 mutation에는 Server Action 또는 Route Handler를 사용할 수 있지만 둘 다
  public endpoint로 보고 매 요청마다 인증, 인가와 입력 검증 수행

### Architecture Style

- 공개 사이트와 Backoffice를 독립적으로 build/deploy하는 하나의 workspace
- Backoffice 내부는 modular monolith로 시작하고 UI routing과 domain/application/infrastructure를 분리
- 초기 microservice와 별도 frontend/backend repository는 만들지 않음
- long-running job, webhook 처리량 또는 독립 scaling 요구가 실제로 생길 때 service 추출 검토

```text
Administrator Browser
  -> Next.js page / Client Component
  -> Server Action or Route Handler
  -> Authentication + MFA session verification
  -> Capability authorization
  -> Application use case
  -> Audit boundary
  -> Server-only DAL / safe DTO
  -> Environment-bound Supabase client
  -> Development or Production Supabase
```

### Authentication and Authorization

- Supabase Auth를 Backoffice 관리자 identity에 사용
- Desktop App의 license holder와 Backoffice administrator는 별도 주체로 유지
- `@supabase/ssr`의 cookie-based session 사용
- 관리자에게 TOTP MFA를 필수화하고 server/API/database boundary에서 `aal2` 확인
- Role은 관리 편의를 위한 묶음으로 사용하되 실제 authorization은 capability 기준
- UI 표시 여부와 별개로 모든 민감한 use case가 server에서 capability를 재검사

### Data Access

- `server-only` DAL만 secret key와 privileged Supabase client에 접근
- DAL은 raw row 대신 필요한 필드만 가진 안전한 DTO 반환
- Read와 mutation 모두 pagination, filter와 stable sorting을 명시
- 중요한 mutation은 명시적 use case, transaction/idempotency와 append-only audit 사용
- Browser의 Supabase 직접 접근은 로그인/MFA flow처럼 명시적으로 승인된 public Auth 동작으로 제한

### Proposed Workspace Layout

```text
apps/
  site/                      # 정적 공개 사이트
  admin/                     # Next.js Backoffice
    src/
      app/
      modules/
        administrators/
        licenses/
        surface-content/
        notices/
        audit/
      server/
        auth/
        authorization/
        environment/
        supabase/
packages/
  ui/
  contracts/
  config/
```

`apps/admin/src/app/`은 composition과 transport를 담당하고 핵심 domain rule이나 privileged
query를 소유하지 않는다. 공개 사이트와 Backoffice는 공통 package를 사용할 수 있지만 서로의
build와 deployment를 요구하지 않는다.

## Database Migration Ownership

같은 Supabase database에 Desktop App 저장소와 BlogGenius-Web 저장소가 각각 독립 migration history를
만들지 않는다.

초기 제안:

1. 현재 canonical migration owner인 `/Users/delta898/Project/NaverAutoBlog/supabase/migrations`를 유지한다.
2. Backoffice에 필요한 공유 schema/RPC 변경도 별도 승인된 Desktop App 저장소 작업으로 반영한다.
3. BlogGenius-Web repository는 해당 계약을 소비하고 schema version compatibility를 검증한다.
4. Backend 변경 빈도와 독립 배포 필요가 커질 때 별도 BlogGenius Backend 저장소로 migration과
   functions를 한 번에 추출한다.

이는 편의보다 split-brain migration 방지를 우선한 과도기 정책이다.

## Deployment Shape

- 공개 사이트와 Backoffice는 동일 workspace에서 각각 별도로 build/deploy
- 공개 사이트는 정적 artifact로 배포하고 Backoffice는 독립 Node.js server/container로 배포
- Development와 Production은 같은 검증된 source/artifact 계보에서 별도로 승격
- 각각 고정된 environment profile과 Supabase project만 주입
- 하나의 배포가 runtime selector로 다른 환경에 연결되는 기능 금지
- Next.js는 Node.js server 또는 Docker container로 배포 가능하도록 provider-neutral하게 유지
- Hosting provider는 domain, preview isolation, secret 관리, deployment approval와 운영 비용을 비교한
  별도 decision에서 확정

## Alternatives Considered

### React SPA + Separate API Server

장점:

- Frontend와 privileged backend 경계가 물리적으로 명확함
- API를 Desktop 또는 다른 client와 공유하기 쉬움

현재 보류 이유:

- 초기부터 두 deployment, 두 project structure와 별도 API contract 운영이 필요함
- 작은 팀의 초기 기능 범위에 비해 운영 복잡도가 큼
- Modular monolith 내부의 엄격한 server-only 경계로 현재 위험을 충분히 통제 가능

API 소비자가 늘거나 독립 scaling이 필요하면 가장 먼저 재검토한다.

### SvelteKit or Nuxt

둘 다 SSR/BFF를 구현할 수 있지만 기존 BlogGenius의 Node.js 생태계, React/Next.js의 공식 Supabase
quickstart와 현재 팀의 참고 자료를 고려할 때 전환 이점이 크지 않다.

### Microservices from the Start

License, content, notice를 처음부터 독립 service로 나누면 network authorization, observability,
deployment와 consistency 문제가 먼저 생긴다. Domain boundary는 코드 안에서 유지하고 실제 독립
운영 요구가 확인된 뒤 추출한다.

### Python Backend

Data/AI worker가 중심이면 유리할 수 있으나 현재 핵심은 관리자 Web UI, Supabase, 인증과 CRUD성
workflow다. Frontend와 backend의 language를 분리할 만큼의 이점이 아직 없다. 향후 독립 분석/AI
worker가 필요하면 Python service를 별도로 추가할 수 있다.

## Decisions Still Needed

- 이 제안의 승인 여부
- Hosting provider와 deployment model
- Package manager
- UI styling/component strategy
- Runtime validation library
- Unit/integration test runner와 browser test 범위
- 관리자 최초 provisioning과 recovery policy
- Canonical backend migration을 별도 저장소로 추출할 시점

## Pre-Development Alignment Checklist

### Must decide before scaffold

- Architecture, framework, language와 runtime 제안의 승인 여부
- Package manager와 dependency lock 정책
- Source branch, Development 자동 배포와 Production 수동 승격 방식
- Local/Development/Production의 실제 domain 및 configuration source
- Preview deployment가 어느 backend에 접근할 수 있는지 또는 완전히 차단할지

### Must decide before authentication implementation

- 최초 관리자 생성 방식과 초대 가능한 주체
- 허용할 로그인 방식과 TOTP MFA 강제 시점
- 관리자 계정 또는 MFA 분실 시 복구 주체와 절차
- 초기 role/capability matrix와 마지막 super admin 보호 규칙
- Session lifetime, 강제 로그아웃과 관리자 비활성화 반영 시점

### Must decide before the first data feature

- 첫 vertical slice의 정확한 사용자 시나리오와 non-goals
- Supabase migration의 canonical owner와 cross-repository 변경 순서
- 목록·상세 화면에 노출할 정보와 반드시 마스킹할 정보
- Read, mutation, export별 capability와 audit 범위
- Pagination, search, stable sorting과 timezone 계약
- Development fixture와 Production data 비복제 원칙의 실제 적용 방법

### Must decide before Production

- Hosting, domain, TLS와 secret store
- 동일 artifact를 승격할지 환경별 build를 만들지에 대한 정책
- Production deployment approval과 rollback 절차
- Log redaction, retention, error monitoring과 alert owner
- Database backup/restore와 incident response runbook
- Security review, dependency audit와 Production smoke gate

### Can be deferred

- 전체 기능의 세부 UI와 visual polish
- 아직 구현하지 않을 유료 결제 provider
- 미래의 모든 role과 capability
- Microservice 분리와 별도 Python worker
- 대량 export, 고급 analytics와 복잡한 notice targeting

미룬 결정에는 다시 논의할 trigger를 함께 기록한다. 단순히 `나중에`라고만 남기지 않는다.

## Proposed First Slice After Approval

1. Accepted decision을 `docs/decisions/`에 기록
2. Next.js + strict TypeScript + Node 24 최소 scaffold
3. Local/Development/Production environment contract와 fail-closed validation
4. Server-only boundary와 forbidden client import test
5. `/health` 또는 environment status의 비민감 read-only slice

관리자 로그인이나 실제 Production 연결은 이 첫 slice에 포함하지 않는다.

## Sources Reviewed

- [Next.js installation and TypeScript support](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js data security and DAL guidance](https://nextjs.org/docs/app/guides/data-security)
- [Next.js authentication and authorization guidance](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Backend for Frontend guide](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase server package selection](https://supabase.com/docs/guides/auth/choosing-a-server-package)
- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [Supabase RLS and secret key boundary](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [TypeScript strict mode](https://www.typescriptlang.org/tsconfig/strict)
- [Node.js release status](https://nodejs.org/en/about/previous-releases)

## Verification

- 제안은 공식 Next.js, Supabase, TypeScript와 Node.js 문서를 기준으로 검토했다.
- Repository code나 dependency는 변경하지 않았다.
- 원격 Supabase와 Production 환경에 접근하지 않았다.

## Result

Architecture와 stack 제안만 작성했다. 사용자 승인 전에는 scaffold와 dependency 설치를 시작하지 않는다.
