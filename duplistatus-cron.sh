#!/bin/sh
#
# duplistatus-cron.sh: Start cron-service and restart it if it crashes
#

# wait for the server to be ready
sleep 15
echo ""

STOPPED=false
CHILD_PID=""

stop_cron() {
  if [ "$STOPPED" = true ]; then
    return
  fi
  STOPPED=true
  echo "[duplistatus] Received stop signal, shutting down cron-service at $(date)"
  if [ -n "$CHILD_PID" ] && kill -0 "$CHILD_PID" 2>/dev/null; then
    kill -TERM "$CHILD_PID" 2>/dev/null || true
    wait "$CHILD_PID" 2>/dev/null || true
  fi
}

trap stop_cron TERM INT

while [ "$STOPPED" = false ]; do
  echo "[duplistatus] Starting cron-service at $(date)"
  node --import tsx src/cron-service/index.ts &
  CHILD_PID=$!
  wait "$CHILD_PID"
  EXIT_CODE=$?
  if [ "$STOPPED" = true ]; then
    break
  fi
  echo "[duplistatus] cron-service exited with code $EXIT_CODE at $(date). Restarting in 30 seconds..."
  sleep 30
done

echo "[duplistatus] cron-service stopped"