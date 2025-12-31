#!/bin/bash
# generate-release-notes-github.sh
# Generates RELEASE_NOTES_github_VERSION.md from documentation/docs/release-notes/VERSION.md
# Converts links and images to work in GitHub release descriptions

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "❌ Error: Version argument required"
    echo "Usage: $0 <version>"
    echo "Example: $0 1.1.x"
    exit 1
fi

VERSION="$1"
echo "🔧 Generating GitHub release notes for version: $VERSION"

# Check if release notes file exists
RELEASE_NOTES_FILE="documentation/docs/release-notes/${VERSION}.md"
if [ ! -f "$RELEASE_NOTES_FILE" ]; then
    echo "❌ Error: $RELEASE_NOTES_FILE not found"
    exit 1
fi

# Output file name
OUTPUT_FILE="RELEASE_NOTES_github_${VERSION}.md"

# Create temporary file for processing
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Process release notes and convert links
# Use sed with multiple passes, processing relative links before absolute URLs are touched
cat "$RELEASE_NOTES_FILE" | \
# Convert relative markdown links to absolute GitHub docs URLs
# Special case: Docusaurus routes files with same name as parent directory
# e.g., installation/installation.md -> /installation (not /installation/installation)
sed 's|(\./\([^/]*\)/\1\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
sed 's|(\([^/]*\)/\1\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Handle paths with ./ prefix
sed 's|(\./\([^)]*\)\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Convert relative paths with ../ prefix (e.g., ../user-guide/overview.md)
# Remove ../ and convert to absolute URL
sed 's|(\.\./\([^)]*\)\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Convert image paths to GitHub raw URLs
# Handle /img/ paths
sed 's|(/img/|(https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/|g' | \
# Handle documentation/static/img/ paths
sed 's|(documentation/static/img/|(https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/|g' | \
# Handle relative image paths like ./img/ or ../img/
sed 's|(\./img/|(https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/|g' | \
sed 's|(\.\./img/|(https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/|g' | \
# Fix specific development links that don't have .md extension
sed 's|(development/setup)|(https://wsj-br.github.io/duplistatus/development/setup)|g' | \
sed 's|(development/how-i-build-with-ai)|(https://wsj-br.github.io/duplistatus/development/how-i-build-with-ai)|g' > "$TEMP_FILE"

# Copy to output file
cp "$TEMP_FILE" "$OUTPUT_FILE"

echo ""
echo "✅ GitHub release notes generated successfully: $OUTPUT_FILE"

