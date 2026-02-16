#!/bin/bash
# generate-readme-from-intro.sh
# Generates README.md from documentation/docs/intro.md for GitHub
# Adds version badge, banner, TOC, and converts links to absolute GitHub docs URLs
# Also generates GitHub release notes from documentation/docs/release-notes/VERSION.md
# Also generates README_dockerhub.md with Docker Hub compatible formatting

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
RELEASE_TEMP_FILE=""
trap "rm -f $TEMP_FILE $RELEASE_TEMP_FILE" EXIT

# Start building README.md with header (from documentation/docs/readme-header.md)
cat "$PROJECT_ROOT/documentation/docs/_readme-header.md" > "$TEMP_FILE"

# Add version badge
sed -i "s/[{]VERSION[}]/$VERSION/g" "$TEMP_FILE"

# Process intro.md and convert links
# First, skip header lines: empty lines (1-2), "# Welcome to duplistatus" (3), empty line (4), subtitle line (5)
# Convert Docusaurus Admonitions to GitHub-style Alerts, then process links
sed '1,5d' "$INTRO_FILE" | \
# Convert Docusaurus Admonitions (:::note, :::tip, :::warning, etc.) to GitHub-style Alerts
awk '
BEGIN { in_admonition = 0; admonition_type = ""; }
# Closing: ::: or "    :::" or "::: " (optional leading/trailing whitespace)
$0 ~ /^[[:space:]]*:::[[:space:]]*$/ {
    if (in_admonition) {
        in_admonition = 0;
        admonition_type = "";
    }
    next;
}
# Opening: :::type or :::type Title or :::type[Title] (optional leading whitespace)
$0 ~ /^[[:space:]]*:::[a-zA-Z]/ {
    in_admonition = 1;
    if ($0 ~ /^[[:space:]]*:::info/) { admonition_type = "NOTE"; }
    else if ($0 ~ /^[[:space:]]*:::note/) { admonition_type = "NOTE"; }
    else if ($0 ~ /^[[:space:]]*:::tip/) { admonition_type = "TIP"; }
    else if ($0 ~ /^[[:space:]]*:::warning/) { admonition_type = "WARNING"; }
    else if ($0 ~ /^[[:space:]]*:::danger/) { admonition_type = "DANGER"; }
    else if ($0 ~ /^[[:space:]]*:::important/) { admonition_type = "IMPORTANT"; }
    else if ($0 ~ /^[[:space:]]*:::caution/) { admonition_type = "CAUTION"; }
    else {
        in_admonition = 0;
        print;
        next;
    }
    print "> [!" admonition_type "]";
    next;
}
# Content
{
    if (in_admonition) {
        if (length($0) == 0) {
            print ">";
        } else {
            print "> " $0;
        }
    } else {
        print;
    }
}
' | \
sed '/^>\[!IMPORTANT\]/,/^$/d' | \
# Remove Docusaurus section ID tags {#xxxxx} - GitHub auto-generates IDs from heading text
sed 's/ {#[^}]*}//g' | \
# Convert relative markdown links to absolute GitHub docs URLs
# Special case: Docusaurus routes files with same name as parent directory to just the directory
# e.g., installation/installation.md -> /installation (not /installation/installation)
sed 's|(\./\([^/]*\)/\1\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
sed 's|(\([^/]*\)/\1\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Handle paths with or without ./ prefix, normalize them, convert to absolute URL, and remove .md extension
sed 's|(\./\([^)]*\)\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
sed 's|(\([^/][^)]*\)\.md)|(https://wsj-br.github.io/duplistatus/\1)|g' | \
# Convert image paths: /img/ -> documentation/static/img/, assets/ -> documentation/docs/assets/
sed 's|(/img/|(documentation/static/img/|g' | \
sed 's|(assets/|(documentation/static/assets/|g' | \
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

# Generate README_dockerhub.md for Docker Hub
echo ""
echo "🔍 Generating README_dockerhub.md for Docker Hub..."

# Copy README.md to README_dockerhub.md
cp README.md README_dockerhub.md

# Update image references from relative paths to GitHub raw URLs
sed -i 's|documentation/img/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/img/|g' README_dockerhub.md
sed -i 's|documentation/static/img/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/static/img/|g' README_dockerhub.md
sed -i 's|documentation/docs/assets/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/docs/assets/|g' README_dockerhub.md

# Update document references from relative paths to GitHub blob URLs
# Only replace docs/ that are NOT already part of a full URL
sed -i 's|\[\([^]]*\)\](documentation/\([^)]*\))|[\1](https://github.com/wsj-br/duplistatus/blob/master/documentation/\2)|g' README_dockerhub.md

# Handle standalone documentation/ references (not in markdown links)
sed -i 's|documentation/\([^/]*\.md\)|https://github.com/wsj-br/duplistatus/blob/master/documentation/\1|g' README_dockerhub.md

# Convert GitHub special notation to Docker Hub compatible format with emojis
# Convert [!NOTE] blocks (case-insensitive, with optional space between > and [)
sed -i 's|> *\[!NOTE\]|> ℹ️ **NOTE**<br/>|ig' README_dockerhub.md
# Convert [!TIP] blocks (case-insensitive, with optional space between > and [)
sed -i 's|> *\[!TIP\]|> 💡 **TIP**<br/>|ig' README_dockerhub.md
# Convert [!IMPORTANT] blocks (case-insensitive, with optional space between > and [)
sed -i 's|> *\[!IMPORTANT\]|> ⚠️ **IMPORTANT**<br/>|ig' README_dockerhub.md
# Convert [!WARNING] blocks (case-insensitive, with optional space between > and [)
sed -i 's|> *\[!WARNING\]|> 🚨 **WARNING**<br/>|ig' README_dockerhub.md
# Convert [!CAUTION] blocks (case-insensitive, with optional space between > and [)
sed -i 's|> *\[!CAUTION\]|> ⛔ **CAUTION**<br/>|ig' README_dockerhub.md
# Convert [!DANGER] blocks (case-insensitive, with optional space between > and [)
sed -i 's|> *\[!DANGER\]|> 🔴 **DANGER**<br/>|ig' README_dockerhub.md

# Clean up any double replacements that might have occurred
sed -i 's|https://raw.githubusercontent.com/wsj-br/duplistatus/master/https://raw.githubusercontent.com/wsj-br/duplistatus/master/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/|g' README_dockerhub.md
sed -i 's|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/static/img/https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/static/img/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/static/img/|g' README_dockerhub.md
sed -i 's|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/docs/assets/https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/docs/assets/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/documentation/docs/assets/|g' README_dockerhub.md
sed -i 's|https://github.com/wsj-br/duplistatus/blob/master/https://github.com/wsj-br/duplistatus/blob/master/|https://github.com/wsj-br/duplistatus/blob/master/|g' README_dockerhub.md

echo "✅ README_dockerhub.md generated successfully"

# Generate GitHub release notes
echo ""
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
RELEASE_TEMP_FILE=$(mktemp)

# Process release notes and convert links
# Use sed with multiple passes, processing relative links before absolute URLs are touched
cat "$RELEASE_NOTES_FILE" | \
# Change title from "# Version xxxx" to "# Release Notes - Version xxxxx"
sed 's|^# Version |# Release Notes - Version |' | \
# Remove Docusaurus section ID tags {#xxxxx}
sed 's/ {#[^}]*}//g' | \
# Convert Docusaurus Admonitions to GitHub-style Alerts
awk '
BEGIN { in_admonition = 0; admonition_type = ""; }
$0 ~ /^[[:space:]]*:::[[:space:]]*$/ {
    if (in_admonition) { in_admonition = 0; admonition_type = ""; }
    next;
}
$0 ~ /^[[:space:]]*:::[a-zA-Z]/ {
    in_admonition = 1;
    if ($0 ~ /^[[:space:]]*:::info/) { admonition_type = "NOTE"; }
    else if ($0 ~ /^[[:space:]]*:::note/) { admonition_type = "NOTE"; }
    else if ($0 ~ /^[[:space:]]*:::tip/) { admonition_type = "TIP"; }
    else if ($0 ~ /^[[:space:]]*:::warning/) { admonition_type = "WARNING"; }
    else if ($0 ~ /^[[:space:]]*:::danger/) { admonition_type = "DANGER"; }
    else if ($0 ~ /^[[:space:]]*:::important/) { admonition_type = "IMPORTANT"; }
    else if ($0 ~ /^[[:space:]]*:::caution/) { admonition_type = "CAUTION"; }
    else { in_admonition = 0; print; next; }
    print "> [!" admonition_type "]";
    next;
}
{
    if (in_admonition) {
        if (length($0) == 0) { print ">"; }
        else { print "> " $0; }
    } else { print; }
}
' | \
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
sed 's|(development/how-i-build-with-ai)|(https://wsj-br.github.io/duplistatus/development/how-i-build-with-ai)|g' > "$RELEASE_TEMP_FILE"

# Copy to output file
cp "$RELEASE_TEMP_FILE" "$OUTPUT_FILE"
echo "✅ Release notes generated: $OUTPUT_FILE"

echo ""
echo "✅ README.md generated successfully from intro.md"

