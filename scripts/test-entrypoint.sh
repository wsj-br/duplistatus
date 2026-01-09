#!/bin/sh
#
# test-entrypoint.sh: Test wrapper for docker-entrypoint.sh in local development
# This script sets up the environment to test the entrypoint logging functionality
# Logs will be written to data/logs/ so the application can access them
#
# This script assumes it's run from the repository root directory

set -e

# Get repository root directory (where pnpm runs from)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Always build fresh version
echo "🔨 Building fresh version with 'pnpm build-local'..."
pnpm build-local || {
  echo "❌ Failed to build with 'pnpm build-local'"
  exit 1
}

# Check if cron service is built
if [ ! -f "dist/cron-service.cjs" ]; then
  echo "⚠️  Warning: dist/cron-service.cjs not found"
  echo "   Building cron service..."
  pnpm exec tsx scripts/bundle-cron-service.cjs || {
    echo "❌ Failed to build cron service"
    exit 1
  }
fi

# Create temporary symlinks/copies in project root to mimic Docker structure
# These will be cleaned up after testing
CLEANUP_FILES=""

# Create server.js symlink (or copy if symlinks don't work)
if [ ! -f "server.js" ]; then
  ln -s .next/standalone/server.js server.js 2>/dev/null || cp .next/standalone/server.js server.js
  CLEANUP_FILES="$CLEANUP_FILES server.js"
fi

# Ensure .next directory exists for standalone
if [ ! -d ".next/standalone/.next" ]; then
  mkdir -p .next/standalone/.next
  cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
fi

# Ensure public directory is accessible (standalone needs it)
if [ ! -d ".next/standalone/public" ] && [ -d "public" ]; then
  cp -r public .next/standalone/public 2>/dev/null || true
fi

# Track entrypoint PID for cleanup
ENTRYPOINT_PID=""

# Setup cleanup trap
cleanup() {
  echo ""
  echo "🧹 Cleaning up..."
  
  # Forward signal to entrypoint if it's still running
  if [ -n "$ENTRYPOINT_PID" ] && kill -0 "$ENTRYPOINT_PID" 2>/dev/null; then
    echo "   Sending signal to entrypoint process (PID: $ENTRYPOINT_PID)..."
    kill -TERM "$ENTRYPOINT_PID" 2>/dev/null || true
    # Wait a bit for graceful shutdown
    sleep 2
    # Force kill if still running
    if kill -0 "$ENTRYPOINT_PID" 2>/dev/null; then
      echo "   Force killing entrypoint process..."
      kill -KILL "$ENTRYPOINT_PID" 2>/dev/null || true
    fi
    wait "$ENTRYPOINT_PID" 2>/dev/null || true
  fi
  
  # Clean up temporary files
  echo "   Cleaning up temporary files..."
  for file in $CLEANUP_FILES; do
    [ -L "$file" ] && rm -f "$file" || [ -f "$file" ] && rm -f "$file"
  done
  echo "✅ Cleanup complete"
}

trap cleanup EXIT INT TERM

echo "🧪 Testing entrypoint script"
echo "   Working directory: $(pwd)"
echo "   Logs will be written to: $(pwd)/data/logs/"
echo "   (These logs will be accessible by the application)"
echo ""
echo "Press Ctrl+C to stop and test log flushing..."
echo ""

# Set PORT for local testing (matches start-local)
export PORT=8666
export CRON_PORT=8667
export NODE_ENV=production
export VERSION="test-$(date +%Y%m%d-%H%M%S)"

# Run the entrypoint script from project root (don't use exec so we can track PID)
./docker-entrypoint.sh &
ENTRYPOINT_PID=$!

# Wait for entrypoint to exit
wait "$ENTRYPOINT_PID" 2>/dev/null || true
