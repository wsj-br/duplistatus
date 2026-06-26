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

# Ensure the @swc/helpers ESM build is present in the standalone output.
# next.config.ts (outputFileTracingIncludes) normally copies this, but keep a
# fallback for the hoisted (nodeLinker: hoisted) layout where the package lives
# at top-level node_modules. Guard every step so a missing source never aborts.
SWC_ESM_SRC="node_modules/@swc/helpers/esm"
SWC_ESM_DEST=".next/standalone/node_modules/@swc/helpers/esm"
if [ -d "$SWC_ESM_SRC" ] && [ ! -d "$SWC_ESM_DEST" ]; then
    mkdir -p ".next/standalone/node_modules/@swc/helpers"
    cp -r "$SWC_ESM_SRC" ".next/standalone/node_modules/@swc/helpers/"
fi

# -----  end of pos-build ------

exit 0

