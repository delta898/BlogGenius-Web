# Deployment Quick Start

## Current Status

Deployment commands are being implemented incrementally. Only commands marked
available in this document may be treated as operational interfaces.

## Local Foundation

Target interface for the workspace foundation:

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

## Planned Development Deployment

```bash
./ops deploy development
```

This command is not available until the Development deployment feature
implements immutable image publication, release manifests, server preflight,
health checks and rollback state.

## Planned Production Promotion

```bash
./ops promote production vX.Y.Z
./ops rollback production
```

Production promotion will reuse the exact release manifest and image digests
verified in Development. It will require an explicit confirmation and will not
rebuild artifacts.
