#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Directories and files to clean
ITEMS_TO_REMOVE=(
    ".next"
    "node_modules"
    "dist"
    ".turbo"
    "pnpm-lock.yaml"
)

echo "🧹 Cleaning build artifacts and dependencies..."

# Remove directories and files
for item in "${ITEMS_TO_REMOVE[@]}"; do
    path="$ROOT_DIR/$item"
    if [ -e "$path" ]; then
        if rm -rf "$path"; then
            echo "✅ Removed $item"
        else
            echo "❌ Error removing $item"
        fi
    else
        echo "ℹ️ $item not found, skipping..."
    fi
done

# Clear pnpm store cache
echo "🧹 Clearing pnpm store cache..."
if pnpm store prune; then
    echo "✅ pnpm store cache cleared"
else
    echo "❌ Error clearing pnpm store cache"
fi

# clear docker compose cache
echo "🧹 Clearing docker compose cache..."
if docker builder prune --all; then
    echo "✅ Docker compose cache cleared"
else
    echo "❌ Error clearing docker compose cache"
fi
# clear docker system images/networks/volumes
echo "🧹 Clearing docker system images/networks/volumes not used..."
if docker system prune --all; then
    echo "✅ Docker system images/networks/volumes not used cleared"
fi
echo "✅ Docker compose cache cleared"

echo "✨ Clean completed!" 