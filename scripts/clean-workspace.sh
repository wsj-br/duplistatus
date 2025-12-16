#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Directories and files to clean
ITEMS_TO_REMOVE=(
    ".next"
    "node_modules"
    "dist"
    "out"
    ".turbo"
    "pnpm-lock.yaml"
    "data/*.json"
    "public/docs"
    "docs/.docusaurus"
    "docs/.cache-loader"
    "docs/.cache"
    "docs/build"   
    "docs/node_modules"
    "docs/pnpm-lock.yaml"
    ".genkit"
)

echo "🧹 Cleaning build artifacts and dependencies..."

# Remove directories and files
for item in "${ITEMS_TO_REMOVE[@]}"; do
    if rm -rf "$ROOT_DIR"/$item; then
        echo "✅ Removed $item"
    else
        echo "❌ Error removing $item"
    fi
done

# Handle glob patterns separately
echo "🧹 Cleaning glob patterns..."

# Remove docs/.cache-* directories
if find "$ROOT_DIR/docs" -maxdepth 1 -type d -name ".cache-*" -exec rm -rf {} + 2>/dev/null; then
    echo "✅ Removed docs/.cache-* directories"
fi

# Remove *.tsbuildinfo files
if find "$ROOT_DIR" -maxdepth 3 -type f -name "*.tsbuildinfo" -exec rm -f {} + 2>/dev/null; then
    echo "✅ Removed *.tsbuildinfo files"
fi


# Clear pnpm store cache
echo "🧹 Clearing pnpm store cache..."
if pnpm store prune; then
    echo "✅ pnpm store cache cleared"
else
    echo "❌ Error clearing pnpm store cache"
fi

# clear docker compose cache
echo "🧹 Clearing docker compose cache..."
if docker builder prune --all --force; then
    echo "✅ Docker compose cache cleared"
else
    echo "❌ Error clearing docker compose cache"
fi
# clear docker system images/networks/volumes
echo "🧹 Clearing docker system images/networks/volumes not used..."
if docker system prune --all --force; then
    echo "✅ Docker system images/networks/volumes not used cleared"
else
    echo "❌ Error clearing docker system images/networks/volumes"
fi

echo "✨ Clean completed!" 

echo ""
echo ""
echo "💡"
echo "     remember to run 'pnpm install' to update the dependencies before building the application"
echo "     or before running 'pnpm docker-up'"
echo ""
