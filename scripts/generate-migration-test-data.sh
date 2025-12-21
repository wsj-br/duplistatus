#!/bin/bash

#
# Generate test data for migration test
#
#
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATION_TEST_DATA_DIR="$ROOT_DIR/scripts/migration_test_data"
DATA_DIR="/var/lib/docker/volumes/duplistatus_data/_data"
GOOGLE_CHROME="$( find ~/.cache/puppeteer/ -name chrome -type f  -print | head -n 1 )" # /home/wsj/.cache/puppeteer/chrome/linux-142.0.7444.175/chrome-linux64/chrome"
SERVERS=3

echo "Migration test data directory: $MIGRATION_TEST_DATA_DIR"
echo "Data directory: $DATA_DIR"

# versions to generate test data for
VERSIONS="v0.4.0 v0.5.0 v0.6.1 0.7.27 0.8.21"
VERSIONS="v0.9.9"

if [ -z $GOOGLE_CHROME ]; then
  echo "Error: Google Chrome not found, check if puppeteer is installed and you already use the 'pnpm take-screenshots' script"
  echo "       it will automatically install Chrome."
  exit 1
fi


echo "----"
# stop the docker container if it is running
echo "Stop the docker container if it is running"
sudo docker stop duplistatus
echo "Remove the docker container if it exists"
sudo docker rm duplistatus


for VERSION in $VERSIONS; do
  echo "----"
  echo "Generating test data for $VERSION"

  # remove the backups.db file if it exists
  if [ -f $DATA_DIR/backups.db ]; then
    FILETD="$DATA_DIR/backups.db"
    sudo rm -f $FILETD $FILETD-shm $FILETD-wal
  fi
  
  # remove all version tags from the data folder
  sudo rm -f $DATA_DIR/version-*

  # create a new version tag file
  echo $VERSION > $DATA_DIR/version-$VERSION

  # start the docker container
  echo "----"
  echo "Starting docker..."
  sudo docker run -d --name duplistatus -p 9666:9666 -v duplistatus_data:/app/data wsjbr/duplistatus:$VERSION

  # wait for the docker container to start
  echo "----"
  echo "Wait for the docker container to start (checking API endpoint /api/health)"
  # check if the docker container is running with the API endpoint /api/health
  n=0
  while ! curl -f -s http://localhost:9666/api/health >/dev/null 2>&1; do
    sleep 1
    echo -n "."
    n=$((n+1))
    if [ $n -gt 20 ]; then
      echo "Docker container did not start in $n seconds"
      exit 1
    fi
  done
  echo ""
  echo "----"
  echo "Docker container started."

  # generate test data
  echo "----"
  echo "Generating test data..."
  pnpm generate-test-data --servers=$SERVERS --upload --port=9666

  echo "Test data generated successfully. Sleeping for 5 seconds..."
  sleep 5

  # take a screenshot of the screen with the test data
  echo "----"
  echo "take a screenshot of the screen with the test data, file $MIGRATION_TEST_DATA_DIR/duplistatus_test_data_$VERSION.png"
  $GOOGLE_CHROME --force-dark-mode --headless \
      --screenshot="$MIGRATION_TEST_DATA_DIR/duplistatus_test_data_$VERSION.png" \
      --virtual-time-budget=3000 \
      --window-size=1920,1080 http://localhost:9666/ 

  # stop the docker container
  echo "----"
  echo "Stop the docker container"
  sudo docker stop duplistatus
  echo "Remove the docker container"
  sudo docker rm duplistatus


  # flush the WAL file to the backups.db file
  echo "----"
  echo "Flush the WAL file to the backups.db file"
  sudo sqlite3 $DATA_DIR/backups.db 'PRAGMA wal_checkpoint(TRUNCATE);'
  sudo sqlite3 $DATA_DIR/backups.db '.schema' > $MIGRATION_TEST_DATA_DIR/backups_$VERSION.schema

  # copy the backups.db file to the migration_test_data directory
  echo "----"
  echo "Copy the backups.db file to the migration_test_data directory"
  sudo cp $DATA_DIR/backups.db $MIGRATION_TEST_DATA_DIR/backups_$VERSION.db
  sudo sudo chown $USER: $MIGRATION_TEST_DATA_DIR/backups_$VERSION.db  
  echo ""
  echo ""
done

echo "Migration test data generated successfully."