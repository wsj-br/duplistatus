#!/bin/bash
# generate-readme-from-intro.sh
# Generates README.md from documentation/docs/intro.md for GitHub
# Adds version badge, banner, TOC, and converts links to absolute GitHub docs URLs

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

echo "🔧 Generating README.md from intro.md..."

# Extract version from package.json
VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
    echo "❌ Error: Could not extract version from package.json"
    exit 1
fi

echo "📦 Current version: $VERSION"

# Check if intro.md exists
INTRO_FILE="documentation/docs/intro.md"
if [ ! -f "$INTRO_FILE" ]; then
    echo "❌ Error: $INTRO_FILE not found"
    exit 1
fi

# Create temporary file for processing
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Start building README.md with header
cat > "$TEMP_FILE" <<EOF

![duplistatus](documentation/static/img/duplistatus_banner.png)

# **duplistatus** - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard

![version](https://img.shields.io/badge/version-$VERSION-blue)

<br/>

This web application monitors and visualises backup operations from [Duplicati](https://github.com/duplicati/duplicati). **duplistatus** provides a comprehensive dashboard to track backup statuses, execution, metrics, and performance across multiple servers.

It also provides API endpoints that can be integrated with third-party tools such as [Homepage](https://gethomepage.dev/).

<br/>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br/>

EOF

# Process intro.md and convert links
# First, skip header lines: empty lines (1-2), "# Welcome to duplistatus" (3), empty line (4), subtitle line (5)
sed '1,5d' "$INTRO_FILE" | \
sed '/^>\[!IMPORTANT\]/,/^$/d' | \
# Convert relative markdown links to absolute GitHub docs URLs
# Special case: Docusaurus routes files with same name as parent directory to just the directory
# e.g., installation/installation.md -> /installation (not /installation/installation)
sed 's|(\./\([^/]*\)/\1\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
sed 's|(\([^/]*\)/\1\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Handle paths with or without ./ prefix, normalize them, convert to absolute URL, and remove .md extension
sed 's|(\./\([^)]*\)\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
sed 's|(\([^/][^)]*\)\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Convert image paths from /img/ to documentation/static/img/
sed 's|(/img/|(documentation/static/img/|g' | \
# Fix specific development links that don't have .md extension
sed 's|(development/setup)|(https://wsj-br.github.io/duplistatus/development/setup)|g' | \
sed 's|(development/how-i-build-with-ai)|(https://wsj-br.github.io/duplistatus/development/how-i-build-with-ai)|g' >> "$TEMP_FILE"

# Add migration section with link to Docusaurus docs (before License section)
# We'll insert it before the License section
sed -i '/^## License/i\
\
<br/>\
\
## Migration Information\
\
If you are upgrading from an earlier version, your database will be automatically migrated to the new schema during the upgrade process.\
\
For detailed migration information, including migration steps, monitoring, and rollback procedures, please refer to the [Migration Documentation](https://wsj-br.github.io/duplistatus/migration/version_upgrade) in the Docusaurus documentation.\
\
<br/>\
\
' "$TEMP_FILE"

# Copy to README.md
cp "$TEMP_FILE" README.md

# Run doctoc to generate table of contents
echo "📚 Generating table of contents with doctoc..."

if ! command -v doctoc &> /dev/null; then
    echo "⚠️  Warning: doctoc is not installed. TOC will not be generated."
    echo "   Install it with: npm install -g doctoc"
else
    doctoc README.md
fi

# Run update-readme-for-dockerhub.sh
echo ""
echo "🔍 Updating README.md for Docker Hub..."
./scripts/update-readme-for-dockerhub.sh

echo ""
echo "✅ README.md generated successfully from intro.md"

