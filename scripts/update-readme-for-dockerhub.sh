#!/bin/bash

# Script to copy README.md to README_dockerhub.md and update references for Docker Hub compatibility
# This script converts relative paths to absolute GitHub URLs
# Run this script from the project root directory

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project root directory
cd "$PROJECT_ROOT"

echo "Starting README.md conversion for Docker Hub..."
echo "Working from project root: $PROJECT_ROOT"

# Copy README.md to README_dockerhub.md
echo "Copying README.md to README_dockerhub.md..."
cp README.md README_dockerhub.md

# Update image references from relative paths to GitHub raw URLs
echo "Updating image references..."
sed -i 's|docs/img/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/docs/img/|g' README_dockerhub.md

# Update document references from relative paths to GitHub blob URLs
# Only replace docs/ that are NOT already part of a full URL
echo "Updating document references..."
sed -i 's|\[\([^]]*\)\](docs/\([^)]*\))|[\1](https://github.com/wsj-br/duplistatus/blob/master/docs/\2)|g' README_dockerhub.md

# Handle standalone docs/ references (not in markdown links)
sed -i 's|docs/\([^/]*\.md\)|https://github.com/wsj-br/duplistatus/blob/master/docs/\1|g' README_dockerhub.md

# Convert GitHub special notation to Docker Hub compatible format with emojis
echo "Converting GitHub special notation blocks..."
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

# Clean up any double replacements that might have occurred
echo "Cleaning up any double replacements..."
sed -i 's|https://raw.githubusercontent.com/wsj-br/duplistatus/master/https://raw.githubusercontent.com/wsj-br/duplistatus/master/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/|g' README_dockerhub.md
sed -i 's|https://github.com/wsj-br/duplistatus/blob/master/https://github.com/wsj-br/duplistatus/blob/master/|https://github.com/wsj-br/duplistatus/blob/master/|g' README_dockerhub.md

echo "Conversion completed successfully!"
echo "Updated file: README_dockerhub.md"
echo ""
echo "Summary of changes:"
echo "- Image references: docs/img/ → https://raw.githubusercontent.com/wsj-br/duplistatus/master/docs/img/"
echo "- Document references: docs/ → https://github.com/wsj-br/duplistatus/blob/master/docs/"
echo "- GitHub special notation: > [!NOTE] → > ℹ️ **NOTE**, etc."
echo ""
echo "The README_dockerhub.md file is now ready for use on Docker Hub or other external platforms."
