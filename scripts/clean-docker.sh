#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

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
fi
echo "✅ Docker compose cache cleared"

echo "✨ Clean completed!" 