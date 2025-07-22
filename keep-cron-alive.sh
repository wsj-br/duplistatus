#!/bin/sh

# keep-cron-alive.sh: Restart cron-service if it crashes

while true; do
  echo "[keep-cron-alive] Starting cron-service at $(date)"
  pnpm cron:start
  EXIT_CODE=$?
  echo "[keep-cron-alive] cron-service exited with code $EXIT_CODE at $(date). Restarting in 5 seconds..."
  sleep 5
done 