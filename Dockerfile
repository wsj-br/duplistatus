# duplistatus Dockerfile with integrated Docusaurus documentation

FROM node:lts-alpine AS base

# ------------------------------------------------------------
# Install dependencies only when needed
# ------------------------------------------------------------
FROM base AS deps

# Install build dependencies needed for native modules (better-sqlite3)
RUN apk add --no-cache libc6-compat tzdata icu-libs icu-data-full python3 make g++

# Install pnpm for workspace install/build (build-only; not copied to runner)
RUN npm install -g pnpm@latest-10

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy full docs directory structure for proper workspace installation
COPY docs ./docs

# Set the BASE_URL to /docs/ to be included in the container and served by duplistatus-server.ts
ENV BASE_URL="/docs/"

# Install all workspace dependencies (including docs)
RUN pnpm install --frozen-lockfile

# Build Docusaurus documentation right after install (workspace is ready)
RUN pnpm --filter docs run build

# Output will be in /app/docs/build

# ------------------------------------------------------------
# Build the application with standalone output
# ------------------------------------------------------------
FROM base AS builder

# Install build dependencies needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Install pnpm for build (build-only tool)
RUN npm install -g pnpm@latest-10

WORKDIR /app

# Copy node_modules from deps stage (includes all dependencies)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and configuration files
COPY . .

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built Docusaurus files into Next.js public directory before build
# This makes them available at /docs route
COPY --from=deps /app/docs/build ./public/docs

# Build the application (standalone output will be in .next/standalone)
RUN mkdir -p /app/data && pnpm run build

# ------------------------------------------------------------
# Create production-only dependencies with pnpm
# ------------------------------------------------------------
FROM base AS prod-deps

# Install pnpm
RUN npm install -g pnpm@latest-10

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy docs workspace package.json (needed for pnpm workspace to work)
# We don't install docs dependencies, but pnpm needs to know about the workspace structure
COPY docs/package.json ./docs/package.json

# Install only production dependencies
# This creates node_modules with proper pnpm structure (.pnpm folder + symlinks)
# excluding all devDependencies
RUN pnpm install --prod --frozen-lockfile --filter=!docs

# ------------------------------------------------------------
# Production image - minimal runtime environment
# ------------------------------------------------------------
FROM base AS runner

# Install only runtime dependencies (no build tools)
RUN apk add --no-cache curl tzdata icu-libs icu-data-full tini sqlite

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV VERSION=1.0.2 \
    PORT=9666 \
    CRON_PORT=9667 \
    TZ=Europe/London \
    LANG=en_GB 

WORKDIR /app

# Use the existing 'node' user from base image (UID 1000) for compatibility with existing volumes
# The node:lts-alpine base image already includes a 'node' user with UID 1000
# This ensures existing Docker volumes created with previous versions remain accessible

# Copy standalone output from Next.js build (includes minimal production node_modules)
# Standalone output automatically includes only production dependencies that are actually used
COPY --chown=node:node --from=builder /app/.next/standalone ./

# Copy production-only node_modules from prod-deps stage
# This includes the complete pnpm structure (.pnpm folder + symlinks) for all production dependencies
# Our custom server (duplistatus-server.ts) and cron service use packages not detected by Next.js standalone
# The prod-deps stage installed with pnpm --prod, so we get proper pnpm structure without devDependencies
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules

# Copy static files (standalone doesn't include .next/static)
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

# Copy public files (includes /docs from Docusaurus)
COPY --chown=node:node --from=builder /app/public ./public

# Copy source code needed for runtime (custom server and cron service use TypeScript)
# Note: tsx is needed at runtime for TypeScript execution
COPY --chown=node:node --from=builder /app/duplistatus-server.ts ./duplistatus-server.ts
COPY --chown=node:node --from=builder /app/src/cron-service ./src/cron-service
COPY --chown=node:node --from=builder /app/src/lib ./src/lib

# Copy scripts directory (for admin recovery and other utility scripts)
COPY --chown=node:node --from=builder /app/scripts ./scripts

# Copy TypeScript configuration (needed for tsx to compile TypeScript files)
COPY --chown=node:node --from=builder /app/tsconfig.json ./tsconfig.json

# Copy shell scripts with execute permissions
COPY --chown=node:node --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh
COPY --chown=node:node --chmod=755 admin-recovery /app/admin-recovery

# Install tsx globally for TypeScript execution at runtime
# tsx is a devDependency but needed at runtime because we run TypeScript files directly
# (duplistatus-server.ts, cron-service). It won't be in standalone output since Next.js
# doesn't import it. Installing globally is simpler than copying tsx + all its dependencies
# from builder's node_modules. This is acceptable since tsx is relatively small (~5MB).
RUN npm install -g tsx@4.21.0

# Create data directory & adjust permissions
# Use node:node to match existing volume ownership (UID 1000)
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

# Use tini as entrypoint to properly forward signals to child processes
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/docker-entrypoint.sh"]
