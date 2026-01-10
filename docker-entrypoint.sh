#!/bin/sh
#
# docker-entrypoint.sh: Start Next.js standalone + cron service
# with proper signal handling for graceful shutdown

# ========================================
# Configuration
# ========================================
APP_LOG_NAME="application.log"
LOG_DIR_NAME="data/logs"
LOG_ROTATION_VERSIONS=5
# ========================================

# override npm log level to error
# this is to prevent npm from logging to the console
export NPM_CONFIG_LOGLEVEL=error

# Get script directory and construct base path
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="${SCRIPT_DIR}/${LOG_DIR_NAME}"
APP_LOG="${LOG_DIR}/${APP_LOG_NAME}"

# Track child process PIDs
SERVER_PID=""
CRON_PID=""

# Track process group for killing all descendants
MAIN_PID=$$

# Run final WAL checkpoint after both processes exit
run_final_checkpoint() {
  if [ -f "${SCRIPT_DIR}/data/backups.db" ]; then
    echo "[Entrypoint] Running final WAL checkpoint (RESET)..."
    if sqlite3 "${SCRIPT_DIR}/data/backups.db" 'PRAGMA wal_checkpoint(RESET);'; then
      echo "[Entrypoint] WAL checkpoint completed successfully"
    else
      echo "[Entrypoint] ⚠️ WAL checkpoint command failed" >&2
    fi
  else
    echo "[Entrypoint] No database file found, skipping final checkpoint"
  fi
}

# Signal handler function
cleanup() {
  # Prevent multiple cleanup calls
  trap - 2 3 15
  echo "[Entrypoint] 🔔 Received shutdown signal, stopping processes..."
  echo "[Entrypoint] Stopping cron service before server to release DB connections..."

  # Stop cron service first
  if [ -n "$CRON_PID" ] && kill -0 "$CRON_PID" 2>/dev/null; then
    echo "[Entrypoint] Sending SIGTERM to cron service (PID: $CRON_PID)"
    kill -TERM "$CRON_PID" 2>/dev/null || true
    # Wait with timeout
    for i in $(seq 1 5); do
      if ! kill -0 "$CRON_PID" 2>/dev/null; then
        break
      fi
      sleep 0.5
    done
    # Force kill if still running
    if kill -0 "$CRON_PID" 2>/dev/null; then
      echo "[Entrypoint] Force killing cron service (PID: $CRON_PID)"
      kill -KILL "$CRON_PID" 2>/dev/null || true
    fi
    wait "$CRON_PID" 2>/dev/null || true
    echo "[Entrypoint] Cron service (PID: $CRON_PID) exited"
  fi

  # Now stop the server
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[Entrypoint] Sending SIGTERM to server (PID: $SERVER_PID)"
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    # Wait with timeout
    for i in $(seq 1 5); do
      if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        break
      fi
      sleep 0.5
    done
    # Force kill if still running
    if kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "[Entrypoint] Force killing server (PID: $SERVER_PID)"
      kill -KILL "$SERVER_PID" 2>/dev/null || true
    fi
    wait "$SERVER_PID" 2>/dev/null || true
    echo "[Entrypoint] Server process (PID: $SERVER_PID) exited"
  fi

  # Kill any remaining child processes in our process group
  echo "[Entrypoint] Cleaning up any remaining child processes..."
  pkill -P "$MAIN_PID" 2>/dev/null || true
  sleep 0.5
  pkill -9 -P "$MAIN_PID" 2>/dev/null || true

  echo "[Entrypoint] ✅ All processes stopped"
  
  # Clean up tee pipe and background process
  if [ -n "$TEE_PID" ] && kill -0 "$TEE_PID" 2>/dev/null; then
    echo "[Entrypoint] Stopping tee process (PID: $TEE_PID)"
    kill "$TEE_PID" 2>/dev/null || true
    wait "$TEE_PID" 2>/dev/null || true
  fi
  [ -p "$TEE_PIPE" ] && rm -f "$TEE_PIPE" 2>/dev/null || true
  
  # Flush log file to disk to ensure no buffered data is lost
  echo "[Entrypoint] Flushing log file to disk..."
  sync "$APP_LOG" 2>/dev/null || sync
  # Brief pause to allow output to finish writing
  sleep 0.5
  
  run_final_checkpoint
  exit 0
}

# Trap signals for graceful shutdown
# Using signal numbers for POSIX compatibility: 2=SIGINT, 3=SIGQUIT, 15=SIGTERM
trap cleanup 2 3 15

# Function to rotate log file on container startup
# Rotates existing log file, keeping configured number of versions
rotate_log() {
  local logfile="$1"
  if [ -f "$logfile" ]; then
    # Remove oldest rotated file if it exists
    [ -f "${logfile}.${LOG_ROTATION_VERSIONS}" ] && rm -f "${logfile}.${LOG_ROTATION_VERSIONS}"
    # Shift existing rotated files: .N-1 -> .N, .N-2 -> .N-1, ..., .1 -> .2
    i=$((LOG_ROTATION_VERSIONS - 1))
    while [ "$i" -ge 1 ]; do
      [ -f "${logfile}.${i}" ] && mv "${logfile}.${i}" "${logfile}.$((i+1))"
      i=$((i - 1))
    done
    # Move current file to .1 (most recent rotation)
    mv "$logfile" "${logfile}.1"
  fi
}

# Ensure data directory exists
mkdir -p "${SCRIPT_DIR}/data"

# Create logs directory
mkdir -p "$LOG_DIR"

# Rotate log on startup (before starting services)
# This happens on every container startup, keeping the configured number of versions
rotate_log "$APP_LOG"

# Redirect stdout and stderr to both the application log file and Docker logs
# Use a simple pipe with tee to duplicate output
# Save original stdout for Docker logs
exec 3>&1
# Create a pipe for tee
TEE_PIPE="${LOG_DIR}/.tee_pipe"
rm -f "$TEE_PIPE"
mkfifo "$TEE_PIPE"
# Background process to read from pipe and tee to both destinations
tee -a "$APP_LOG" < "$TEE_PIPE" >&3 &
TEE_PID=$!
# Redirect stdout and stderr to the pipe
exec > "$TEE_PIPE" 2>&1

## Show the version of the the alpine and node
echo "[Entrypoint] ----------------------------------------"
echo "[Entrypoint] Alpine version: $(cat /etc/alpine-release 2>/dev/null || echo "N/A")"
echo "[Entrypoint] SQLite version: $(sqlite3 --version|cut -d ' ' -f 1-3)"
echo "[Entrypoint] Node version: $(node -v)"
echo "[Entrypoint] npm version: $(npm -v)"
echo "[Entrypoint] Duplistatus Version: $VERSION"
echo "[Entrypoint] Build Date: $(date -r "$0" '+%Y-%m-%d %H:%M:%S %Z')"
echo "[Entrypoint] ----------------------------------------"

# Ensure key file exists and is locked down (0400)
KEY_FILE="${SCRIPT_DIR}/data/.duplistatus.key"
if [ ! -f "$KEY_FILE" ]; then
  echo "[Entrypoint] 🔑 Creating new .duplistatus.key file..."
  # 32 random bytes
  head -c 32 /dev/urandom > "$KEY_FILE"
  chmod 0400 "$KEY_FILE"
  echo "[Entrypoint] ✅ Key file created successfully with restricted permissions (0400)"
else
  # Validate permissions match 0400 (security requirement)
  current_perms="$(stat -c "%a" "$KEY_FILE" 2>/dev/null || echo "")"
  if [ "$current_perms" != "400" ]; then
    echo "[Entrypoint] ❌ SECURITY ERROR: .duplistatus.key has incorrect permissions ($current_perms), expected 400"
    echo "[Entrypoint]    Fix with: chmod 0400 ${SCRIPT_DIR}/data/.duplistatus.key"
    exit 1
  fi
fi

# Start the Next.js standalone server in the background
# Best practice for `output: 'standalone'` is to run the generated server.js
# Set HOSTNAME=0.0.0.0 to ensure Next.js binds to all interfaces (important for Podman pods)
# Output will be captured by the exec redirection to APP_LOG
echo "[Entrypoint] Starting duplistatus (Next standalone)..."
HOSTNAME=0.0.0.0 node server.js &
SERVER_PID=$!

# Validate server process started successfully
if [ -z "$SERVER_PID" ] || ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "[Entrypoint] ❌ Failed to start server process"
  exit 1
fi
echo "[Entrypoint] Server process started (PID: $SERVER_PID)"

# Wait for the server to be ready (with health check)
echo "[Entrypoint] Waiting for server to be ready..."
SERVER_READY=0
for i in $(seq 1 30); do
  if curl -f -s http://localhost:${PORT:-9666}/api/health >/dev/null 2>&1; then
    SERVER_READY=1
    echo "[Entrypoint] ✅ Server is ready (checked after ${i}s)"
    break
  fi
  # Check if process is still running
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[Entrypoint] ❌ Server process died before becoming ready"
    exit 1
  fi
  sleep 1
done

if [ "$SERVER_READY" -eq 0 ]; then
  echo "[Entrypoint] ⚠️ Server did not become ready within 30 seconds, continuing anyway..."
fi

# Start the cron service in the background
# Output will be captured by the exec redirection to APP_LOG
echo "[Entrypoint] Starting cron service..."
node dist/cron-service.cjs &
CRON_PID=$!

# Validate cron service process started successfully
if [ -z "$CRON_PID" ] || ! kill -0 "$CRON_PID" 2>/dev/null; then
  echo "[Entrypoint] ❌ Failed to start cron service process"
  # Try to stop server before exiting
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  exit 1
fi
echo "[Entrypoint] Cron service process started (PID: $CRON_PID)"

# Wait for both processes
# Use a loop to check process status and handle signals properly
# If either process exits, we'll handle it in the cleanup
SERVER_EXIT=0
CRON_EXIT=0

while true; do
  # Check if server is still running
  if [ -n "$SERVER_PID" ] && ! kill -0 "$SERVER_PID" 2>/dev/null; then
    wait "$SERVER_PID" 2>/dev/null
    SERVER_EXIT=$?
    echo "[Entrypoint] Server process exited with code: $SERVER_EXIT"
    SERVER_PID=""
  fi
  
  # Check if cron is still running
  if [ -n "$CRON_PID" ] && ! kill -0 "$CRON_PID" 2>/dev/null; then
    wait "$CRON_PID" 2>/dev/null
    CRON_EXIT=$?
    echo "[Entrypoint] Cron service exited with code: $CRON_EXIT"
    CRON_PID=""
  fi
  
  # If both processes have exited, break
  if [ -z "$SERVER_PID" ] && [ -z "$CRON_PID" ]; then
    break
  fi
  
  # Sleep briefly to avoid busy-waiting (interruptible by signals)
  # When interrupted by a signal, the trap will call cleanup and exit
  sleep 1 || true
done

# If we reach here, one or both processes exited
echo "[Entrypoint] Server exited with code: $SERVER_EXIT"
echo "[Entrypoint] Cron service exited with code: $CRON_EXIT"
run_final_checkpoint

# Exit with the first non-zero exit code, or 0 if both succeeded
if [ "$SERVER_EXIT" -ne 0 ]; then
  exit $SERVER_EXIT
elif [ "$CRON_EXIT" -ne 0 ]; then
  exit $CRON_EXIT
else
  exit 0
fi

