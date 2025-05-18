# Production image
FROM node:lts-alpine

# Install runtime dependencies and pnpm
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

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies only
RUN pnpm add better-sqlite3 sqlite3 --allow-build=sqlite3 --allow-build=better-sqlite3 && \
    pnpm install --prod --frozen-lockfile

# Copy built application files
COPY .next ./.next
COPY public ./public
COPY next.config.ts ./

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R node:node /app/data

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
