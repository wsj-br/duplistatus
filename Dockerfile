# duplistatus Dockerfile

# now following the instructions from https://nextjs.org/docs/app/getting-started/deploying#docker-image

FROM node:lts-alpine AS base

# ------------------------------------------------------------
# Install dependencies only when needed
# ------------------------------------------------------------
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest-10

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------
# Rebuild the source code only when needed
# ------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@latest-10

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN mkdir -p /app/data && pnpm run build

# ------------------------------------------------------------
# Production image, copy all the files and run next
# ------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Install pnpm globally
RUN npm install -g pnpm@latest-10

# Copy package files for production dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Copy source code needed for cron service
COPY --from=builder --chown=node:node /app/src/cron-service ./src/cron-service
COPY --from=builder --chown=node:node /app/src/lib ./src/lib

# Copy TypeScript configuration files
COPY --from=builder --chown=node:node /app/tsconfig.json ./tsconfig.json

# Copy duplistatus-cron script
COPY --chmod=755 --chown=node:node duplistatus-cron.sh /app/duplistatus-cron.sh

# Create data directory
RUN mkdir -p /app/data && chown node:node /app/data

# Set environment variables
ENV PORT=9666 \
    CRON_PORT=9667 \
    TZ=UTC

# Labels
LABEL org.opencontainers.image.source=https://github.com/wsj-br/duplistatus
LABEL org.opencontainers.image.description="duplistatus Container Image"
LABEL org.opencontainers.image.licenses=Apache-2.0

USER node

EXPOSE 9666 9667

# Define the health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl -f -s http://localhost:9666/api/health || exit 1

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "node server.js & /app/duplistatus-cron.sh"] 
