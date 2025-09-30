#!/usr/bin/env bash
# Copy images from website to docs-site for mkdocs preview
set -euo pipefail
SRC1="$(pwd)/website/docs/img"
SRC2="$(pwd)/website/static/img"
DST="$(pwd)/docs-site/docs/img"

mkdir -p "$DST"

if [ -d "$SRC1" ]; then
  cp -av "$SRC1"/* "$DST" || true
fi

if [ -d "$SRC2" ]; then
  cp -av "$SRC2"/* "$DST" || true
fi

echo "Images copied to $DST"

