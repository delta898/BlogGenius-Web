# Deployment Quick Start

## Current Status

Local foundation commands are available. Oracle Development/Production deployment
is still being implemented incrementally; only commands marked available in this
document may be treated as operational interfaces.

## Local Foundation

Available interface for the workspace foundation:

```bash
./ops help
./ops doctor
./ops validate
./ops build
./ops up
./ops status
./ops down
```

These commands affect only the local BlogGenius Compose project. They do not
connect to Oracle, publish an image, modify Caddy or access Development and
Production Supabase.

### First Run

```bash
pnpm install --frozen-lockfile
./ops doctor
./ops validate
./ops up
```

- Public site: `http://127.0.0.1:8080`
- Backoffice: `http://127.0.0.1:3000`
- Liveness: `http://127.0.0.1:3000/health/live`
- Readiness: `http://127.0.0.1:3000/health/ready`

`./ops up` builds and runs Oracle-compatible `linux/amd64` images. On an Apple
Silicon host, the application build runs on the native build platform and only the
final runtime image targets AMD64. Stop the local stack without deleting volumes:

```bash
./ops down
```

## Development Publication and Preflight

`dev`에 원격 push하면 GitHub Actions가 검증 후 GHCR image와 immutable release
manifest를 발행하도록 workflow가 준비되어 있다. 로컬에서는 실제 외부 변경 없이
계약을 검증할 수 있다.

```bash
./ops manifest verify deployment/examples/development.release.env development
./ops preflight development deployment/examples/development.release.env --check-only
```

자세한 계약과 현재 제한은
[Development release preflight](development-release-preflight.md)를 따른다.

## Development Deployment

```bash
./ops deploy development <manifest>
./ops rollback development
```

`deploy`는 manifest 적격성(`dev` 브랜치, clean tree, SHA 일치, digest, Compose render)을
먼저 강제하고, 서버 `releases/<sha>/`에 Compose와 manifest를 전송한 뒤 `pull`과
`up --wait`로 healthy 도달을 확인한다. 성공한 릴리스만 `current`로 승격하고 이전
릴리스를 `previous`에 남긴다. `rollback`은 `previous`가 있을 때만 직전 릴리스로
복귀한다. 두 명령 모두 Caddy, OracleWebInfra, Production에触하지 않는다.

배포 후 OracleWebInfra의 환경별 cutover 검사를 수행한다.

```bash
./scripts/test-bloggenius-cutover.sh development
```

`DEPLOY_HOST`(`oracle1`)와 `DEPLOY_ROOT`(`/home/ubuntu/Project/BlogGenius-Web`)로
대상 override가 가능하다. GHCR 패키지는 public이라 서버 pull에 별도 인증이
필요 없다.

## Planned Production Promotion

```bash
./ops promote production vX.Y.Z
./ops rollback production
```

Production promotion will reuse the exact release manifest and image digests
verified in Development. It will require an explicit confirmation and will not
rebuild artifacts.
