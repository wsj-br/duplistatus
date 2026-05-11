#!/bin/sh

# run post build after a successful pnpm build

#get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

#get the root directory
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# -----  start of pos-build -----

# go to the root directory
cd "$ROOT_DIR"

# create the standalone directory
mkdir -p .next/standalone/.next 

# copy the static files
cp -r .next/static .next/standalone/.next/static 
cp -r public .next/standalone/public 
cp -r node_modules/.pnpm/@swc+helpers@0.5.21/node_modules/@swc/helpers/esm \
      .next/standalone/node_modules/.pnpm/@swc+helpers@0.5.21/node_modules/@swc/helpers/

# -----  end of pos-build ------

exit 0

