FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/api-client/package.json packages/api-client/
COPY services/api/package.json services/api/
RUN pnpm install --frozen-lockfile --filter @ccore/api --filter @ccore/shared --filter @ccore/api-client

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/api-client/node_modules ./packages/api-client/node_modules
COPY --from=deps /app/services/api/node_modules ./services/api/node_modules
COPY . .
RUN pnpm --filter @ccore/shared build && pnpm --filter @ccore/api-client build && pnpm --filter @ccore/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 express
COPY --from=builder --chown=express:nodejs /app/services/api/dist ./dist
COPY --from=builder --chown=express:nodejs /app/services/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@ccore/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@ccore/shared/
COPY --from=builder /app/packages/api-client/dist ./node_modules/@ccore/api-client/dist
COPY --from=builder /app/packages/api-client/package.json ./node_modules/@ccore/api-client/

USER express
EXPOSE 3001
CMD ["node", "dist/server.js"]
