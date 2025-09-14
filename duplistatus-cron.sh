#!/bin/sh
#
# duplistatus-cron.sh: Start cron-service and restart it if it crashes
#

# wait for the server to be ready
sleep 30
echo ""

while true; do
  echo "[duplistatus] Starting cron-service at $(date)"
  pnpm cron:start
  EXIT_CODE=$?
  echo "[duplistatus] cron-service exited with code $EXIT_CODE at $(date). Restarting in 30 seconds..."
  sleep 30
done 