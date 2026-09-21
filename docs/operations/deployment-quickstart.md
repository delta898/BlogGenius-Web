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
./ops deploy development [<manifest>]
./ops rollback development
```

`deploy`는 manifest 경로를 생략하면 현재 커밋에 대한 성공 publish run의
manifest를 자동으로 받아 사용하고, 경로를 주면 그 파일을 그대로 사용한다.
어느 경우든 manifest 적격성(`dev` 브랜치, clean tree, SHA 일치, digest,
Compose render)을 먼저 강제하고, 서버 `releases/<sha>/`에 Compose와 manifest를 전송한 뒤 `pull`과
`up --wait`로 healthy 도달을 확인한다. 성공한 릴리스만 `current`로 승격하고 이전
릴리스를 `previous`에 남긴다. `rollback`은 `previous`가 있을 때만 직전 릴리스로
복귀한다. 두 명령 모두 Caddy, OracleWebInfra, Production에触하지 않는다.

### Host environment file (Backoffice runtime config)

Backoffice 이미지는 환경 값을 빌드하지 않는다. 같은 digest가 Development와
Production에서 각 환경 값을 주입받아 동작한다 (artifact 승격 보존).
운영 머신의 `deployment/env/<environment>.env`가 단일 진실의 원천이며,
`deploy` 때마다 호스트로 동기화되므로 손으로 SSH 관리하지 않는다.
repo에 커밋되지 않는다 (`.gitignore`).

```bash
cp deployment/env/development.env.example deployment/env/development.env
# SUPABASE_URL, SUPABASE_ANON_KEY를 Development Supabase 값으로 채운다
chmod 600 deployment/env/development.env
```

- `deploy`는 이 파일을 검증(필수 키 존재·manifest 키 혼입 금지)한 뒤
  호스트 `$DEPLOY_ROOT/env/<environment>.env`로 매번 업로드한다.
  `rollback`은 호스트의 기존 파일을 그대로 쓴다.
- 이 파일에는 `SUPABASE_URL`·`SUPABASE_ANON_KEY`만 둔다.
  manifest 키(`RELEASE_*`, `*_IMAGE`, `DEPLOY_ENVIRONMENT`) 혼입은 거부된다.
- Production 파일(`production.env`)은 Production 승격이 승인될 때 별도로 만든다.
  Development 값을 복사하지 않는다.

### Local Backoffice config

로컬 Backoffice(`./ops admin-dev`)도 같은 파일에서 읽는다.
`apps/admin/.env.local`의 구 변수명(`NEXT_PUBLIC_*`)은 더 이상 쓰지 않으므로
지우거나 무시한다.

`ops up` 컨테이너 전체 검증 시에는 실행 전에 주입한다:

```bash
set -a; source deployment/env/development.env; set +a
./ops up
```

(`APP_ENVIRONMENT`는 Compose의 `local`이 우선한다.)

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
