# Web Workspace Foundation Development

## Status

- Branch: `feature/web-workspace-foundation`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

BlogGenius 공개 사이트와 Backoffice를 하나의 저장소에서 개발하되 서로 독립적으로
빌드할 수 있어야 한다. 사용자는 Development와 Production 배포 구조를 매번 외우지
않고 하나의 편리한 운영 명령과 단계별 문서로 안전하게 작업할 수 있어야 한다.

## Goal

- Node.js 24 LTS와 strict TypeScript를 사용하는 workspace를 만든다.
- 정적 공개 사이트와 server-side Backoffice의 build/runtime 경계를 분리한다.
- 두 애플리케이션을 `linux/amd64` Docker image로 재현 가능하게 빌드한다.
- 배포 기능을 추가하기 전에 local validation과 runtime 확인을 단일 `./ops`
  인터페이스로 제공한다.

## Scope

- pnpm workspace와 공통 TypeScript/configuration 기반
- `apps/site`: static export 가능한 최소 공개 사이트
- `apps/admin`: standalone runtime과 안전한 health endpoint를 가진 최소 Backoffice
- site/admin multi-stage Dockerfile
- local Compose와 container health check
- `./ops help|doctor|validate|build|up|down|status`
- architecture, decision, operations와 전자책 주제 문서 갱신

## Non-Goals

- Supabase 연결, 관리자 로그인, MFA, authorization 또는 audit
- 실제 고객 데이터와 Production secret
- GHCR push, Oracle 서버 배포 또는 Caddy 변경
- Development/Production promotion과 rollback 구현
- 공개 사이트 디자인 완성 또는 Backoffice 업무 기능

## Boundaries and Risks

- `site`는 build 결과가 HTML/CSS/JavaScript인 정적 artifact여야 한다.
- `admin`은 server-only credential을 가질 수 있는 별도 runtime이어야 한다.
- Local image에 Development 또는 Production secret을 포함하지 않는다.
- Docker build target은 Oracle 서버 architecture와 같은 `linux/amd64`다.
- 같은 workspace에 있어도 한 앱의 변경이 다른 앱의 runtime을 강제로 결합하지 않는다.
- `./ops down`은 project container만 중지하며 volume 삭제 명령을 사용하지 않는다.

## Proposed Design

```text
apps/
  site/            static export -> bloggenius-web-site image
  admin/           standalone server -> bloggenius-web-admin image
packages/
  config/          shared TypeScript and tooling policy
deployment/
  compose.local.yml
ops                single operator entry point
```

Local ports are intentionally explicit:

- Public site: `http://127.0.0.1:8080`
- Backoffice: `http://127.0.0.1:3000`
- Liveness: `http://127.0.0.1:3000/health/live`
- Readiness: `http://127.0.0.1:3000/health/ready`

## Stages

1. Record the accepted deployment decision and this branch plan.
2. Pin Node/package manager versions and scaffold the workspace.
3. Implement the minimal static site and Backoffice health boundary.
4. Build `linux/amd64` runtime images and local Compose.
5. Implement the safe local `./ops` interface.
6. Run install, type, test, build, container and HTTP verification.
7. Promote stable documentation and archive this development record.

## Decisions and Alternatives

- Public site와 Backoffice를 모두 Docker image로 배포하기로 결정했다.
- 정적 파일 bind mount는 runtime container를 줄이지만 static upload/symlink와
  admin image라는 두 배포 방식을 운영해야 하므로 선택하지 않았다.
- 공개 사이트와 Backoffice를 한 process/image로 합치면 배포와 장애·보안 경계가
  결합되므로 선택하지 않았다.
- 사용자가 기억할 운영 명령은 root `./ops` 하나로 제한한다.

## Progress and Corrections

- 기존 README, AGENTS.md와 docs를 `main`의
  `de08c6b` (`docs: establish BlogGenius Web foundation`)로 기록했다.
- `main`에서 `dev`, `dev`에서 `feature/web-workspace-foundation`을 생성했다.
- Oracle 서버가 `linux/amd64`임을 사용자에게 확인했다.

## Verification

Planned commands:

```bash
./ops doctor
./ops validate
./ops build
./ops up
./ops status
```

HTTP checks:

```text
GET http://127.0.0.1:8080/
GET http://127.0.0.1:3000/
GET http://127.0.0.1:3000/health/live
GET http://127.0.0.1:3000/health/ready
```

## Remaining Risks and Follow-up

- Oracle 서버의 실제 container resource 사용량은 Development 배포 단계에서 측정한다.
- External `oracle-web-edge` network와 Caddy upstream은 OracleWebInfra의 별도 승인된
  변경으로 추가한다.
- GHCR authentication, immutable digest manifest와 server runtime env는 다음 feature에서
  설계하고 검증한다.

## Result

진행 중이다.
