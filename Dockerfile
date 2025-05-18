# Production image
FROM node:lts-alpine

# Install runtime dependencies and pnpm
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-libs \
    curl \
    && npm install -g pnpm@latest-10

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install ALL dependencies first
RUN pnpm add better-sqlite3 sharp unrs-resolver esbuild \
      --allow-build=better-sqlite3 --allow-build=sharp \
      --allow-build=unrs-resolver --allow-build=esbuild && \
    pnpm install --frozen-lockfile

# Build the application
RUN pnpm run build

# Optional: Remove dev dependencies after build
RUN pnpm prune --prod

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Create cache directory with proper permissions
RUN mkdir -p /app/.next/cache && \
    chown -R node:node /app/.next/cache

# Set environment variables
ENV NODE_ENV=production \
    PORT=9666 \
    NEXT_TELEMETRY_DISABLED=1

# Labels
LABEL org.opencontainers.image.source=https://github.com/wsj-br/duplidash
LABEL org.opencontainers.image.description="Duplidash Container Image"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Switch to non-root user
USER node

# Expose the port
EXPOSE 9666

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9666/api/health || exit 1

# Start the application
CMD ["pnpm", "start"] 
