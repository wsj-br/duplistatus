#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# removing database file
echo "🧹 Clearing database..."
if rm -f $ROOT_DIR/data/backups.db; then
    echo "✅ Database cleared"
else
    echo "❌ Error clearing database"
fi

echo "✨ Clean completed!" 