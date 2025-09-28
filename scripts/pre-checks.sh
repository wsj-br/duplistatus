#!/bin/sh

# run pre-checks before running the pnpm dev or pnpm build or start

#get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

#get the root directory
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# -----  start of pre-checks  -----

#check if the key file exists
$SCRIPT_DIR/ensure-key-file.sh

# update the version
$SCRIPT_DIR/update-version.sh

# -----  end of pre-checks  -----
exit 0

