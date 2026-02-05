#!/bin/bash
# Generate glossary from intlayer dictionaries
# This script extracts terminology and updates the documentation glossary

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$DOC_DIR/.." && pwd)"
DICT_DIR="$ROOT_DIR/.intlayer/dictionary"

echo "=== Generating Glossary from Intlayer Dictionaries ==="
echo ""

echo "1. Running pnpm intlayer build to generate dictionaries..."
cd "$ROOT_DIR"
pnpm intlayer build

echo ""
echo "2. Checking if dictionary directory exists..."
# Check if dictionary directory exists
if [ ! -d "$DICT_DIR" ]; then
  echo "Error: Dictionary directory not found: $DICT_DIR"
  echo "Please run 'pnpm intlayer build' first to generate dictionaries."
  exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required but not found."
  exit 1
fi

# Output files
CSV_OUTPUT="$DOC_DIR/glossary-ui.csv"

echo "2. Extracting terms from intlayer dictionaries..."
node "$SCRIPT_DIR/extract-glossary-from-intlayer.js" "$CSV_OUTPUT" "$DICT_DIR"

echo ""
echo "=== Glossary Generation Complete ==="
echo ""
echo "Generated: $CSV_OUTPUT"
echo ""
