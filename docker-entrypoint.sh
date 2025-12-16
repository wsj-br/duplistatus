#!/bin/sh
#
# docker-entrypoint.sh: Start both duplistatus-server and cron-service
# with proper signal handling for graceful shutdown

# Timestamp helpers
timestamp() {
  date "+%d/%m/%Y %H:%M:%S %Z"
}
log_ts() {
  local msg="$*"
  if [ "${msg#\[}" != "$msg" ]; then
    # Extract label up to and including the first ]
    local label="${msg%%]*}"
    label="${label}]"
    local remainder="${msg#"$label"}"
    printf "%s %s%s\n" "$label" "$(timestamp)" "$remainder"
  else
    printf "%s\n" "$msg"
  fi
}

## Show the version of the the alpine, node and pnpm 
log_ts "[Entrypoint] ----------------------------------------"
log_ts "[Entrypoint] Alpine version: $(cat /etc/alpine-release)"
log_ts "[Entrypoint] SQLite version: $(sqlite3 --version|cut -d ' ' -f 1-3)"
log_ts "[Entrypoint] Node version: $(node -v)"
log_ts "[Entrypoint] npm version: $(npm -v)"
log_ts "[Entrypoint] pnpm version: $(pnpm -v)"
log_ts "[Entrypoint] Duplistatus Version: $VERSION"
log_ts "[Entrypoint] Build Date: $(date -r "$0" '+%Y-%m-%d %H:%M:%S %Z')"
log_ts "[Entrypoint] ----------------------------------------"

# Track child process PIDs
SERVER_PID=""
CRON_PID=""

# Run final WAL checkpoint after both processes exit
run_final_checkpoint() {
  if [ -f /app/data/backups.db ]; then
    log_ts "[Entrypoint] Running final WAL checkpoint (RESET)..."
    if sqlite3 /app/data/backups.db 'PRAGMA wal_checkpoint(RESET);'; then
      log_ts "[Entrypoint] WAL checkpoint completed successfully"
    else
      log_ts "[Entrypoint] ⚠️ WAL checkpoint command failed" >&2
    fi
  else
    log_ts "[Entrypoint] No database file found, skipping final checkpoint"
  fi
}

# Signal handler function
cleanup() {
  log_ts "[Entrypoint] 🔔 Received shutdown signal, stopping processes..."
  log_ts "[Entrypoint] Stopping cron service before server to release DB connections..."

  # Stop cron service first (the loop will handle stopping its child process)
  if [ -n "$CRON_PID" ] && kill -0 "$CRON_PID" 2>/dev/null; then
    log_ts "[Entrypoint] Sending SIGTERM to cron service loop (PID: $CRON_PID)"
    kill -TERM "$CRON_PID" 2>/dev/null || true
    wait "$CRON_PID" 2>/dev/null || true
    log_ts "[Entrypoint] Cron service loop (PID: $CRON_PID) exited"
  else
    log_ts "[Entrypoint] Cron service loop (PID: $CRON_PID) not running or already stopped"
  fi

  # Now stop the server
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    log_ts "[Entrypoint] Sending SIGTERM to server (PID: $SERVER_PID)"
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    log_ts "[Entrypoint] Server process (PID: $SERVER_PID) exited"
  else
    log_ts "[Entrypoint] Server process (PID: $SERVER_PID) not running or already stopped"
  fi

  log_ts "[Entrypoint] ✅ All processes stopped"
  run_final_checkpoint
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT SIGQUIT


# Start the server in the background using tsx
log_ts "[Entrypoint] Starting duplistatus-server (tsx)..."
tsx duplistatus-server.ts &
SERVER_PID=$!

# Validate server process started successfully
if [ -z "$SERVER_PID" ] || ! kill -0 "$SERVER_PID" 2>/dev/null; then
  log_ts "[Entrypoint] ❌ Failed to start server process"
  exit 1
fi
log_ts "[Entrypoint] Server process started (PID: $SERVER_PID)"

# Wait for the server to be ready (with health check)
log_ts "[Entrypoint] Waiting for server to be ready..."
SERVER_READY=0
for i in $(seq 1 30); do
  if curl -f -s http://localhost:${PORT:-9666}/api/health >/dev/null 2>&1; then
    SERVER_READY=1
    log_ts "[Entrypoint] ✅ Server is ready (checked after ${i}s)"
    break
  fi
  # Check if process is still running
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    log_ts "[Entrypoint] ❌ Server process died before becoming ready"
    exit 1
  fi
  sleep 1
done

if [ "$SERVER_READY" -eq 0 ]; then
  log_ts "[Entrypoint] ⚠️ Server did not become ready within 30 seconds, continuing anyway..."
fi

# Start the cron service in the background
log_ts "[Entrypoint] Starting cron service..."
tsx src/cron-service/index.ts &
CRON_PID=$!

# Validate cron service process started successfully
if [ -z "$CRON_PID" ] || ! kill -0 "$CRON_PID" 2>/dev/null; then
  log_ts "[Entrypoint] ❌ Failed to start cron service process"
  # Try to stop server before exiting
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  exit 1
fi
log_ts "[Entrypoint] Cron service process started (PID: $CRON_PID)"

# Wait for both processes
# If either process exits, we'll handle it in the cleanup
wait $SERVER_PID 2>/dev/null
SERVER_EXIT=$?

wait $CRON_PID 2>/dev/null
CRON_EXIT=$?

# If we reach here, one or both processes exited
log_ts "[Entrypoint] Server exited with code: $SERVER_EXIT"
log_ts "[Entrypoint] Cron service exited with code: $CRON_EXIT"
run_final_checkpoint

# Exit with the first non-zero exit code, or 0 if both succeeded
if [ "$SERVER_EXIT" -ne 0 ]; then
  exit $SERVER_EXIT
elif [ "$CRON_EXIT" -ne 0 ]; then
  exit $CRON_EXIT
else
  exit 0
fi

