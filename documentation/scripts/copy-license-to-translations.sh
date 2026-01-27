#!/bin/bash
# Copy English LICENSE.md to all translation directories
# This ensures LICENSE.md remains in English for all locales

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_LICENSE="$DOC_DIR/docs/LICENSE.md"
I18N_DIR="$DOC_DIR/i18n"

echo "=== Copying LICENSE.md to Translation Directories ==="
echo ""

# Check if source LICENSE.md exists
if [ ! -f "$SOURCE_LICENSE" ]; then
  echo "Error: Source LICENSE.md not found at $SOURCE_LICENSE"
  exit 1
fi

# Check if i18n directory exists
if [ ! -d "$I18N_DIR" ]; then
  echo "Error: i18n directory not found at $I18N_DIR"
  exit 1
fi

# Find all translation directories that should have LICENSE.md
# Pattern: i18n/{locale}/docusaurus-plugin-content-docs/current/LICENSE.md
copied_count=0

for locale_dir in "$I18N_DIR"/*/; do
  locale=$(basename "$locale_dir")
  
  # Skip 'en' directory if it exists
  if [ "$locale" = "en" ]; then
    continue
  fi
  
  target_license="$locale_dir/docusaurus-plugin-content-docs/current/LICENSE.md"
  target_dir=$(dirname "$target_license")
  
  # Create target directory if it doesn't exist
  if [ ! -d "$target_dir" ]; then
    echo "Creating directory: $target_dir"
    mkdir -p "$target_dir"
  fi
  
  # Copy LICENSE.md
  cp "$SOURCE_LICENSE" "$target_license"
  echo "✓ Copied LICENSE.md to $locale"
  copied_count=$((copied_count + 1))
done

echo ""
echo "=== Summary ==="
echo "LICENSE.md copied to $copied_count translation directories"
echo ""
echo "Done! All translation directories now have the English LICENSE.md"
echo "Note: After running 'crowdin download translations', you may need to run this script again"
echo "      if Crowdin overwrites the LICENSE.md files."
