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

# Copy SWC helpers for all installed versions
for helpers_dir in node_modules/.pnpm/@swc+helpers@*/; do
    helpers_dir=${helpers_dir%/}  # Remove trailing slash
    mkdir -p ".next/standalone/${helpers_dir}/node_modules/@swc/helpers"
    cp -r "${helpers_dir}/node_modules/@swc/helpers/esm" ".next/standalone/${helpers_dir}/node_modules/@swc/helpers/"
done

# -----  end of pos-build ------

exit 0

