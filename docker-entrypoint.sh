#!/bin/sh
#
# docker-entrypoint.sh: Start both duplistatus-server and cron-service
# with proper signal handling for graceful shutdown
#

# Timestamp helpers
timestamp() {
  date "+%d/%m/%Y %H:%M:%S %Z"
}

log_ts() {
  local msg="$*"
  if [ "${msg#\[}" != "$msg" ]; then
    local label="${msg%%]*}]"
    local remainder="${msg#"$label"}"
    printf "%s %s%s\n" "$label" "$(timestamp)" "$remainder"
  else
    printf "%s\n" "$msg"
  fi
}

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

  # Stop cron service first
  if [ -n "$CRON_PID" ] && kill -0 "$CRON_PID" 2>/dev/null; then
    log_ts "[Entrypoint] Sending SIGTERM to cron service (PID: $CRON_PID)"
    kill -TERM "$CRON_PID" 2>/dev/null || true
    wait "$CRON_PID" 2>/dev/null || true
    log_ts "[Entrypoint] Cron service (PID: $CRON_PID) exited"
  else
    log_ts "[Entrypoint] Cron service (PID: $CRON_PID) not running or already stopped"
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

# Start the server in the background using node with the tsx loader
log_ts "[Entrypoint] Starting duplistatus-server (node --import tsx)..."
node --import tsx duplistatus-server.ts &
SERVER_PID=$!

# Start the cron service script
log_ts "[Entrypoint] Starting cron service..."
/app/duplistatus-cron.sh &
CRON_PID=$!

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

