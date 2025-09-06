#!/bin/bash
# update-docs.sh
# Updates version badges in all .md files to match the version in package.json
# Also updates table of contents using doctoc

set -e  # Exit on any error

# Extract version from package.json using the provided command
VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
    echo "❌ Error: Could not extract version from package.json"
    exit 1
fi

echo "📦 Current version: $VERSION"
echo ""

# Find all .md files in the project
MD_FILES=$(find . -name "*.md" -type f)

if [ -z "$MD_FILES" ]; then
    echo "⚠️  No .md files found"
    exit 0
fi

# Counter for updated files
UPDATED_COUNT=0

# Process each .md file
for file in $MD_FILES; do
    # Check if file contains version badge pattern
    if grep -q "img\.shields\.io.*version.*blue" "$file"; then
        echo "🔍 Processing: $file"
        
        # Create backup
        cp "$file" "$file.bak"
        
        # Update version badge URL using sed
        # Pattern: https://img.shields.io/badge/version-VERSION-blue
        sed -i "s|https://img\.shields\.io/badge/version-[^-]*-blue|https://img.shields.io/badge/version-$VERSION-blue|g" "$file"
        
        # Check if file was actually modified
        if ! diff -q "$file" "$file.bak" > /dev/null; then
            echo "  ✅ Updated version badge to $VERSION"
            UPDATED_COUNT=$((UPDATED_COUNT + 1))
        else
            echo "  ℹ️  No changes needed (already up to date)"
        fi
        
        # Remove backup file
        rm "$file.bak"
    fi
done

echo ""
if [ $UPDATED_COUNT -gt 0 ]; then
    echo "🎉 Successfully updated $UPDATED_COUNT file(s) with version $VERSION"
else
    echo "ℹ️  No files needed updating"
fi

echo ""
echo "📚 Updating table of contents with doctoc..."

# Check if doctoc is installed
if ! command -v doctoc &> /dev/null; then
    echo "❌ Error: doctoc is not installed. Please install it with: npm install -g doctoc"
    exit 1
fi

# Run doctoc on all markdown files
echo "🔍 Running doctoc on all .md files..."
doctoc *.md docs/*.md

echo "✅ Table of contents updated successfully"
