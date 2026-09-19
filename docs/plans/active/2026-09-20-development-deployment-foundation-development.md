# Development Deployment Foundation

## Status

- Branch: `feature/development-deployment-foundation`
- Base/parent branch: `dev`
- Started: `2026-09-20`
- Status: in progress

## User Need

BlogGenius Web에서 검증한 공개 사이트와 Backoffice를 Development에 안전하고
반복 가능하게 배포해야 한다. 사용자는 복잡한 Docker Compose, image tag와 server
경로를 매번 기억하지 않고 root `./ops`로 preflight, manifest 생성과 배포 상태를
다룰 수 있어야 한다.

## Goal

- site/admin image를 GHCR에 게시할 수 있는 CI build contract를 만든다.
- 배포 대상을 mutable tag가 아니라 image digest가 들어간 release manifest로 고정한다.
- Development와 Production이 같은 application Compose를 사용하되 명시적 environment로
  분리되게 한다.
- Development 배포 전 branch, commit, manifest, runtime environment와 required input을
  fail-closed 방식으로 검증한다.
- OracleWebInfra가 사용할 stable network alias와 health endpoint 계약을 문서화한다.

## Scope

- GHCR site/admin multi-platform publish workflow
- environment-neutral Oracle application Compose
- release manifest schema와 example
- local manifest/Compose validation
- `./ops manifest|preflight|deploy`의 안전한 Development foundation
- 배포 architecture, runbook와 전자책 경험 기록

## Non-Goals

- 실제 GHCR push, Oracle SSH 접속 또는 공개 Development 배포
- Production promotion과 rollback 실행
- Caddy/OracleWebInfra 파일 변경 또는 shared infrastructure 재시작
- Supabase credential, admin authentication 또는 database migration
- GitHub environment/secret 생성

## Boundaries and Risks

- 현재 OracleWebInfra는 BlogGenius static webroot를 Caddy가 직접 제공한다. Application
  Compose를 추가해도 Caddy를 reverse proxy로 전환하기 전에는 public traffic이 새
  container에 도달하지 않는다.
- 두 저장소를 한 feature에서 암묵적으로 바꾸지 않는다.
- image reference에는 immutable `sha256` digest가 반드시 있어야 한다.
- Development 명령이 Production environment, host 또는 secret으로 fallback하면 안 된다.
- manifest와 logs는 secret 값을 포함하지 않는다.
- Production은 Development에서 검증한 동일 digest만 승격하며 재빌드하지 않는다.

## Proposed Design

```text
GitHub Actions (dev)
  -> build site/admin for linux/amd64
  -> publish GHCR images
  -> emit release.env with immutable digests

BlogGenius-Web on Oracle
  deployment/compose.oracle.yml
  releases/<commit>/release.env
  -> bloggenius-development project
  -> aliases:
       bloggenius-site-development:8080
       bloggenius-admin-development:3000

OracleWebInfra
  oracle-web-edge external network
  Caddy reverse proxy to stable aliases
```

The application Compose file is environment-neutral. A validated manifest supplies
`DEPLOY_ENVIRONMENT`, `RELEASE_SHA`, `SITE_IMAGE` and `ADMIN_IMAGE`.

## Stages

1. Record the actual OracleWebInfra baseline and cross-repository contract.
2. Define and test the immutable release manifest validator.
3. Add the Oracle application Compose and static validation fixtures.
4. Add GHCR build/publish workflow with least required permission.
5. Extend `./ops` with safe manifest/preflight interfaces.
6. Run shell, manifest, Compose and existing application validation.
7. Promote stable docs and archive this record.

## Decisions and Alternatives

- `delta898/BlogGenius-Web` maps to separate
  `ghcr.io/delta898/bloggenius-web-site` and
  `ghcr.io/delta898/bloggenius-web-admin` images.
- A text env manifest is chosen because Docker Compose can consume it directly and
  operators can review it without another parser. Strict validation compensates for
  the loose file format.
- Development and Production use separate Compose project names and stable network
  aliases rather than fixed `container_name` values.
- Automatic SSH deployment from CI is deferred until server candidate validation,
  GitHub Environment approval and rollback behavior are proven manually.

## Progress and Corrections

- Workspace foundation was fast-forward merged into `dev`; its local feature branch
  was deleted.
- OracleWebInfra inspection confirmed that BlogGenius routing still uses static
  bind-mounted webroots. The accepted OCI route is therefore a coordinated future
  infrastructure change, not part of this application feature.

## Verification

Planned checks:

```bash
./ops validate
./ops manifest verify deployment/examples/development.release.env
./ops preflight development deployment/examples/development.release.env
docker compose --env-file deployment/examples/development.release.env \
  -f deployment/compose.oracle.yml config -q
```

Negative tests must reject mutable tags, wrong environments, malformed commit SHA,
missing values and attempts to use a Development command with Production input.

## Remaining Risks and Follow-up

- GHCR package visibility and server pull authentication require explicit external
  setup and verification.
- Oracle resource consumption must be measured with four Development/Production
  application containers before Production activation.
- OracleWebInfra must create/own the external edge network and replace static
  BlogGenius routes with verified reverse proxies.

## Result

진행 중이다.
