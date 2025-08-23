# duplistatus Dockerfile

# now following the instructions from https://nextjs.org/docs/app/getting-started/deploying#docker-image

FROM node:alpine AS base

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

# install curl for healthcheck
RUN apk add --no-cache curl

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
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy source code needed for cron service
COPY --from=builder /app/src/cron-service ./src/cron-service
COPY --from=builder /app/src/lib ./src/lib

# Copy TypeScript configuration files
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# copy duplistatus-server.ts custom server
COPY --from=builder /app/duplistatus-server.ts ./duplistatus-server.ts

# Copy duplistatus-cron script
COPY duplistatus-cron.sh /app/duplistatus-cron.sh

# Create data directory & adjust permissions
RUN mkdir -p /app/data && chown -R node:node /app && chmod 755 /app/duplistatus-cron.sh

# Set the application environment variables
ENV PORT=9666 \
    CRON_PORT=9667 \
    LANG=en_GB.UTF-8 \
    TZ=Europe/London

# Labels
LABEL org.opencontainers.image.source=https://github.com/wsj-br/duplistatus
LABEL org.opencontainers.image.description="duplistatus Container Image"
LABEL org.opencontainers.image.licenses=Apache-2.0

USER node

EXPOSE 9666 9667

# Define the health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl -f -s http://localhost:9666/api/health || exit 1

CMD ["sh", "-c", "node duplistatus-server.ts & /app/duplistatus-cron.sh"]


