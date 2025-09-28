#!/bin/bash

# Script to ensure .duplistatus.key file exists in the data directory
# If the file doesn't exist, creates it with random bytes using openssl
# Sets permissions to 0400 (r--------) - only user can read, no write/execute

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/data"
KEY_FILE="$DATA_DIR/.duplistatus.key"

# Check if data directory exists, create it if it doesn't
if [ ! -d "$DATA_DIR" ]; then
    echo "📁 Creating data directory..."
    mkdir -p "$DATA_DIR"
fi

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "🔑 Creating new .duplistatus.key file..."
    
    # Generate 16 random bytes using openssl and write to file
    openssl rand -out "$KEY_FILE" 32
    
    # Set permissions to 0400 (r--------) - only user can read
    chmod 0400 "$KEY_FILE"
    
    echo "   ✅ Key file created successfully with restricted permissions"
else
    
    # Check current permissions before setting them
    current_perms=$(stat -c "%a" "$KEY_FILE" 2>/dev/null)
    if [ "$current_perms" != "400" ]; then
        echo "   ⚠️  Current permissions: $current_perms (incorrect)"
        echo "   🔒 Setting permissions to 0400 (r--------)..."
        chmod 0400 "$KEY_FILE"
        echo "   ✅ Permissions updated to 0400"
    fi
fi

