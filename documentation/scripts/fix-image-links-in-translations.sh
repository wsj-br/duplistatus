#!/bin/bash
# Fix image links in translated markdown files
# Replaces /img/ with /assets/ only for images that exist in docs/assets/
# Keeps /img/ links for images that only exist in static/img/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
I18N_DIR="$DOC_DIR/i18n"
ASSETS_DIR="$DOC_DIR/docs/assets"
STATIC_IMG_DIR="$DOC_DIR/static/img"

echo "=== Fixing Image Links in Translated Files ==="
echo ""

# Check if directories exist
if [ ! -d "$I18N_DIR" ]; then
  echo "Error: i18n directory not found at $I18N_DIR"
  exit 1
fi

if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: docs/assets directory not found at $ASSETS_DIR"
  exit 1
fi

if [ ! -d "$STATIC_IMG_DIR" ]; then
  echo "Error: static/img directory not found at $STATIC_IMG_DIR"
  exit 1
fi

# Counters
changed_count=0
kept_count=0
files_modified=0

# Find all markdown files in i18n directory
while IFS= read -r -d '' file; do
  file_changed=false
  file_relative="${file#$I18N_DIR/}"
  
  # Extract all unique image filenames from /img/ links in this file
  # Using grep to find all /img/ links, then extract filenames
  # Note: grep returns exit code 1 if no matches found, so we handle that with || true
  set +e  # Temporarily disable exit on error for grep
  img_links=$(grep -oE '\]\(/img/([^)]+)\)' "$file" 2>/dev/null | sed 's|](/img/||; s|)||' | sort -u)
  grep_exit=$?
  set -e  # Re-enable exit on error
  
  # If grep found nothing (exit code 1) or result is empty, skip this file
  if [ $grep_exit -ne 0 ] || [ -z "$img_links" ]; then
    continue
  fi
  
  echo "Processing: $file_relative"
  
  # Process each unique image filename
  while IFS= read -r image_filename; do
    [ -z "$image_filename" ] && continue
    
    # Check if this image exists in docs/assets/
    if [ -f "$ASSETS_DIR/$image_filename" ]; then
      # Replace all occurrences of /img/$image_filename with /assets/$image_filename
      if grep -q "/img/$image_filename" "$file"; then
        # Escape special characters for sed
        escaped_filename=$(printf '%s\n' "$image_filename" | sed 's/[[\.*^$()+?{|]/\\&/g')
        sed -i "s|/img/$escaped_filename|/assets/$image_filename|g" "$file"
        echo "  ✓ Changed: /img/$image_filename → /assets/$image_filename"
        changed_count=$((changed_count + 1))
        file_changed=true
      fi
    elif [ -f "$STATIC_IMG_DIR/$image_filename" ]; then
      # Image exists in static/img/, keep /img/ link
      echo "  ⊙ Kept: /img/$image_filename (exists in static/img/)"
      kept_count=$((kept_count + 1))
    else
      # Image not found in either location - warn but don't change
      echo "  ⚠ Warning: /img/$image_filename not found in docs/assets/ or static/img/"
    fi
  done <<< "$img_links"
  
  if [ "$file_changed" = true ]; then
    files_modified=$((files_modified + 1))
    echo ""
  fi
done < <(find "$I18N_DIR" -type f -name "*.md" -print0)

echo ""
echo "=== Summary ==="
echo "Files modified: $files_modified"
echo "Links changed (/img/ → /assets/): $changed_count"
echo "Links kept (/img/ for static images): $kept_count"
echo ""
echo "Done! Fixed image links in translated files."
echo "Next step: Run 'crowdin upload translations' to update Crowdin with the fixes."
