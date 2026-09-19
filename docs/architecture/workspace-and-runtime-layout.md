# Workspace and Runtime Layout

## Purpose

BlogGenius Web는 공개 제품 사이트와 Backoffice를 하나의 pnpm workspace에서
개발한다. 코드와 도구는 공유하되 build artifact, runtime, origin과 보안 경계는
분리한다.

## Repository Layout

```text
apps/
  site/             static-exported public site
  admin/            server-rendered Backoffice and health endpoints
deployment/
  compose.local.yml local runtime verification
docs/               architecture, decisions, plans and operations
ops                 single local operator interface
```

## Runtime Units

| Unit | Build result | Runtime | Local port | Production host |
| --- | --- | --- | --- | --- |
| Public site | Static HTML/CSS/JavaScript | Caddy container | 8080 | `www.bloggenius.kr` |
| Backoffice | Next.js standalone server | Node.js container | 3000 | `admin.bloggenius.kr` |

Development uses the same two units at `dev.bloggenius.kr` and
`admin.dev.bloggenius.kr`. The public site cannot receive privileged Supabase
credentials. The Backoffice server may eventually receive server-only credentials,
but browser bundles must never contain them.

## Platform Contract

- Node.js is pinned to 24 LTS and pnpm to 11.
- TypeScript is strict across both applications.
- Oracle runtime images target `linux/amd64`.
- Builds on Apple Silicon use the native build platform for Next.js tooling and
  emit an AMD64 final runtime image.
- Every final image must pass container health and HTTP checks before deployment
  automation treats it as releasable.

Next.js build tools such as SWC/Turbopack and Sharp contain platform-specific
native binaries. That does not make application source platform-specific. It does
mean that emulating the complete AMD64 build on ARM can be unstable, so CI or the
Oracle AMD64 host should eventually perform the authoritative release build.

## Ownership Boundary

This repository owns application code, application images, release metadata and
product-specific deployment automation. `OracleWebInfra` owns the shared Caddy
edge, TLS routing and infrastructure shared by other sites. A Web release must not
silently modify that separate repository.
