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

## Planned Development Deployment

```bash
./ops deploy development
```

This command is not available until OracleWebInfra provides the external edge
network, reverse proxy contract, server release state and rollback procedure.

## Planned Production Promotion

```bash
./ops promote production vX.Y.Z
./ops rollback production
```

Production promotion will reuse the exact release manifest and image digests
verified in Development. It will require an explicit confirmation and will not
rebuild artifacts.
