FROM --platform=$BUILDPLATFORM node:24.18.0-bookworm-slim AS dependencies

WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/site/package.json apps/site/package.json
RUN pnpm install --frozen-lockfile --filter @bloggenius/site...

FROM dependencies AS builder

COPY tsconfig.base.json ./
COPY apps/site apps/site
RUN pnpm --filter @bloggenius/site build

FROM caddy:2-alpine AS runtime

COPY --from=builder /workspace/apps/site/out /srv

EXPOSE 8080
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":8080"]
