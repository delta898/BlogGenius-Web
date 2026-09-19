# Containerized Web Deployment

## Status

- Status: accepted
- Decided: `2026-09-20`

## Context

BlogGenius-Web은 공개 정적 사이트와 server-side Backoffice를 함께 개발한다.
OracleWebInfra는 여러 사이트가 공유하는 Caddy와 Docker infrastructure를 소유한다.

정적 사이트를 Caddy bind mount로 직접 제공하면 runtime은 가볍지만 정적 release
업로드와 symlink promotion, 관리자 Docker image라는 서로 다른 두 운영 절차가 필요하다.
사용자는 Development와 Production을 안전하게 분리하면서도 기억하기 쉬운 단일 배포
경험을 원한다.

Oracle 서버 architecture는 `linux/amd64`다.

## Decision

- Public site와 Backoffice를 각각 독립된 OCI/Docker image로 빌드한다.
- Development와 Production은 같은 image를 digest로 고정해 별도 Compose project로 실행한다.
- Development에서 검증한 release manifest와 image digest만 Production으로 승격한다.
- OracleWebInfra는 Caddy와 stable external edge network를 소유한다.
- BlogGenius-Web은 application Compose, build, deploy, status와 rollback을 소유한다.
- 일반 application 배포는 OracleWebInfra 변경이나 Caddy reload를 요구하지 않는다.
- root `./ops`를 운영자의 단일 진입점으로 사용한다.

Target routing contract:

```text
www.bloggenius.kr       -> bloggenius-site-production:8080
dev.bloggenius.kr       -> bloggenius-site-development:8080
admin.bloggenius.kr     -> bloggenius-admin-production:3000
admin.dev.bloggenius.kr -> bloggenius-admin-development:3000
```

## Alternatives

### Static webroot plus Backoffice container

정적 제공 효율은 높지만 upload, checksum, current/previous symlink와 image digest라는
서로 다른 배포 및 rollback 모델을 운영해야 해서 선택하지 않았다.

### One container for site and Backoffice

컨테이너 수는 줄지만 public/admin의 release cadence, 장애 범위, secret과 보안 경계를
결합하므로 선택하지 않았다.

### Provider-managed hosting

초기 운영은 이미 준비한 Oracle/Cloudflare/Caddy 기반을 사용한다. 운영 비용이나
availability 요구가 달라지면 다시 검토할 수 있다.

## Consequences

- Development와 Production을 합쳐 site/admin 네 container가 실행된다.
- static container 두 개의 resource overhead가 추가된다.
- build/publish/deploy/rollback은 image와 manifest라는 하나의 모델로 통일된다.
- server webroot와 atomic symlink 운영은 BlogGenius application 배포에서 제거된다.
- OracleWebInfra의 기존 BlogGenius bind mount와 Caddy file-server route는 별도 변경에서
  external network와 reverse proxy route로 전환해야 한다.
- 환경 secret은 image가 아니라 서버의 environment별 runtime file에만 둔다.

## Revisit When

- Oracle resource 측정에서 네 application container 상시 운영이 어렵다.
- public site가 image 배포보다 object storage/CDN 배포에서 명확한 비용·성능 이점을 얻는다.
- multi-host orchestration 또는 zero-downtime replica가 실제로 필요해진다.
