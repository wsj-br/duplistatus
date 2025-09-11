#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="$ROOT_DIR/data/backups.db"

# Check if sqlite3 is available
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ Error: sqlite3 command not found. Please install sqlite3."
    exit 1
fi

# Check if database file exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Error: Database file not found at $DB_PATH"
    exit 1
fi

echo "🧹 Clearing database data (preserving schema)..."

# Clear all data from tables while preserving schema
# We'll use a transaction to ensure atomicity
sqlite3 "$DB_PATH" << 'EOF'
BEGIN TRANSACTION;

-- Clear all data from main tables
DELETE FROM backups;
DELETE FROM servers;
DELETE FROM configurations;

-- Reset auto-increment sequences if any (though we use TEXT primary keys)
-- Keep db_version table intact to preserve schema version info

COMMIT;

-- Show remaining data counts to verify cleanup
SELECT 'servers' as table_name, COUNT(*) as remaining_rows FROM servers
UNION ALL
SELECT 'backups' as table_name, COUNT(*) as remaining_rows FROM backups
UNION ALL
SELECT 'configurations' as table_name, COUNT(*) as remaining_rows FROM configurations
UNION ALL
SELECT 'db_version' as table_name, COUNT(*) as remaining_rows FROM db_version;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database data cleared successfully"
    echo "📊 Schema and structure preserved"
else
    echo "❌ Error clearing database data"
    exit 1
fi

echo "✨ Clean completed!" 