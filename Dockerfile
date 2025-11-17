# duplistatus Dockerfile with integrated Docusaurus documentation

FROM node:alpine AS base

# Install pnpm globally at base
RUN npm install -g pnpm@latest-10

# ------------------------------------------------------------
# Install dependencies only when needed
# ------------------------------------------------------------
FROM base AS deps

RUN apk add --no-cache libc6-compat tzdata icu-libs icu-data-full python3 make g++

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy full website directory structure for proper workspace installation
COPY website ./website


# Set the BASE_URL to /docs/ to be included in the container and served by duplistatus-server.ts
ENV BASE_URL="/docs/"

# Install all workspace dependencies (including website)
RUN pnpm install --frozen-lockfile

# Build Docusaurus documentation right after install (workspace is ready)
RUN pnpm --filter website run build

# Output will be in /app/website/build

# ------------------------------------------------------------
# Rebuild the source code only when needed
# ------------------------------------------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built Docusaurus files into Next.js public directory before build
# This makes them available at /docs route
COPY --from=deps /app/website/build ./public/docs

# Build the application
RUN mkdir -p /app/data && pnpm run build

# ------------------------------------------------------------
# Production image, copy all the files and run next
# ------------------------------------------------------------
FROM base AS runner

RUN apk add --no-cache curl tzdata icu-libs icu-data-full

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV VERSION=0.9.4 \
    PORT=9666 \
    CRON_PORT=9667 \
    TZ=Europe/London \
    LANG=en_GB 

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy node_modules from builder (includes all dependencies including tsx for utility scripts)
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy public files (now includes /docs from Docusaurus)
COPY --chown=node:node --from=builder /app/public ./public

# Copy the complete Next.js build output
COPY --chown=node:node --from=builder /app/.next ./.next

# Copy source code needed for cron service
COPY --chown=node:node --from=builder /app/src/cron-service ./src/cron-service
COPY --chown=node:node --from=builder /app/src/lib ./src/lib

# Copy scripts directory (for admin recovery and other utility scripts)
COPY --chown=node:node --from=builder /app/scripts ./scripts

# Copy TypeScript configuration files
COPY --chown=node:node --from=builder /app/tsconfig.json ./tsconfig.json

# Copy duplistatus-server.ts custom server
COPY --chown=node:node --from=builder /app/duplistatus-server.ts ./duplistatus-server.ts

# Copy duplistatus-server.sh and duplistatus-cron script
COPY --chown=node:node --chmod=755 duplistatus-cron.sh /app/duplistatus-cron.sh

# Copy admin recovery wrapper script
COPY --chown=node:node --chmod=755 admin-recovery /app/admin-recovery

# Create data directory & adjust permissions
RUN mkdir -p /app/data && chown -R node:node /app/data

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
