# duplistatus Dockerfile

# Production image
FROM node:lts-alpine

# Install necessary build tools for better-sqlite3
RUN apk add --no-cache \
    curl \
    python3 \
    make \
    g++ \
    && npm install -g pnpm@latest-10

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install ALL dependencies first
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

# Create cache directory with proper permissions
RUN mkdir -p /app/.next/cache && \
    chown -R node:node /app/.next/cache

# Build the application
RUN pnpm run build

# Optional: Remove dev dependencies after build
RUN pnpm prune --prod

# Clean up build tools to reduce image size
RUN apk del python3 make g++

# Set environment variables
ENV NODE_ENV=production \
    PORT=9666 \
    NEXT_TELEMETRY_DISABLED=1

# Labels
LABEL org.opencontainers.image.source=https://github.com/wsj-br/duplistatus
LABEL org.opencontainers.image.description="duplistatus Container Image"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Switch to non-root user
USER node

# Expose the port
EXPOSE 9666

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f -s http://localhost:9666/api/health || exit 1

# Start the application
CMD ["pnpm", "start"] 
