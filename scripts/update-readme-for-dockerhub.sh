#!/bin/bash

# Script to copy README.md to README.tmp and update references for Docker Hub compatibility
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

# Copy README.md to README.tmp
echo "Copying README.md to README.tmp..."
cp README.md README.tmp

# Update image references from relative paths to GitHub raw URLs
echo "Updating image references..."
sed -i 's|docs/img/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/docs/img/|g' README.tmp

# Update document references from relative paths to GitHub blob URLs
# Only replace docs/ that are NOT already part of a full URL
echo "Updating document references..."
sed -i 's|\[\([^]]*\)\](docs/\([^)]*\))|[\1](https://github.com/wsj-br/duplistatus/blob/master/docs/\2)|g' README.tmp

# Handle standalone docs/ references (not in markdown links)
sed -i 's|docs/\([^/]*\.md\)|https://github.com/wsj-br/duplistatus/blob/master/docs/\1|g' README.tmp

# Clean up any double replacements that might have occurred
echo "Cleaning up any double replacements..."
sed -i 's|https://raw.githubusercontent.com/wsj-br/duplistatus/master/https://raw.githubusercontent.com/wsj-br/duplistatus/master/|https://raw.githubusercontent.com/wsj-br/duplistatus/master/|g' README.tmp
sed -i 's|https://github.com/wsj-br/duplistatus/blob/master/https://github.com/wsj-br/duplistatus/blob/master/|https://github.com/wsj-br/duplistatus/blob/master/|g' README.tmp

echo "Conversion completed successfully!"
echo "Updated file: README.tmp"
echo ""
echo "Summary of changes:"
echo "- Image references: docs/img/ → https://raw.githubusercontent.com/wsj-br/duplistatus/master/docs/img/"
echo "- Document references: docs/ → https://github.com/wsj-br/duplistatus/blob/master/docs/"
echo ""
echo "The README.tmp file is now ready for use on Docker Hub or other external platforms."
