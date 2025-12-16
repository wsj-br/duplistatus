#!/bin/bash

set -e  # Exit on error

# Get the script's directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source directory
SOURCE_DIR="$PROJECT_ROOT/docs/static/img"


# copy favicon.ico
echo -e "copying favicon.ico..."
\cp -f -a "$SOURCE_DIR/favicon.ico" "$PROJECT_ROOT/src/app/"
echo ""

# copy duplistatus_logo.png
echo -e "copying duplistatus_logo.png..."
\cp -f -a "$SOURCE_DIR/duplistatus_logo.png" "$PROJECT_ROOT/public/images/"
echo ""

# copy duplistatus_banner.png
echo -e "copying duplistatus_banner.png..."
# Note: The banner is primarily used in documentation
# If it needs to be copied to other locations, add them here
\cp -f -a "$SOURCE_DIR/duplistatus_banner.png" "$PROJECT_ROOT/public/images/"
echo ""

