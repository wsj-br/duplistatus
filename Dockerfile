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

# Create data directory 
RUN mkdir -p /app/data

# Build the application and clean up
RUN pnpm run build 

RUN pnpm prune --prod && \
    apk del python3 make g++ && \
    chown -R node:node /app && \
    rm -f /app/data/backups.* 

# Set environment variables
ENV NODE_ENV=production \
    PORT=9666 \
    CRON_PORT=9667 \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=UTC

# Labels
LABEL org.opencontainers.image.source=https://github.com/wsj-br/duplistatus
LABEL org.opencontainers.image.description="duplistatus Container Image"
LABEL org.opencontainers.image.licenses=Apache-2.0

# Expose the port
EXPOSE 9666

# Define the health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl -f -s http://localhost:9666/api/health || exit 1

# Switch to the node user	
USER node

# Start the application and cron-service in parallel
COPY keep-cron-alive.sh /app/keep-cron-alive.sh
RUN chmod +x /app/keep-cron-alive.sh

CMD ["sh", "-c", "pnpm start & /app/keep-cron-alive.sh"] 
