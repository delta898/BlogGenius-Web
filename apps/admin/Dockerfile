FROM --platform=$BUILDPLATFORM node:24.18.0-bookworm-slim AS dependencies

WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/package.json
RUN pnpm install --frozen-lockfile --filter @bloggenius/admin...

FROM dependencies AS builder

COPY tsconfig.base.json ./
COPY apps/admin apps/admin
RUN pnpm --filter @bloggenius/admin build

FROM node:24.18.0-bookworm-slim AS runtime

WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=node:node /workspace/apps/admin/.next/standalone ./
COPY --from=builder --chown=node:node /workspace/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=node:node /workspace/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=node:node /workspace/apps/admin/scripts/validate-runtime-env.mjs ./validate-runtime-env.mjs

USER node

EXPOSE 3000
CMD ["sh", "-c", "node validate-runtime-env.mjs && node apps/admin/server.js"]
