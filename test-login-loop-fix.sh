#!/bin/bash

# Test script to verify the login loop fix after database restore

echo "========================================="
echo "Testing Database Restore Login Loop Fix"
echo "========================================="
echo ""

# Check current sessions in database
echo "Current sessions in database:"
sqlite3 /home/wsj/src/duplistatus/data/backups.db "SELECT id, user_id, created_at FROM sessions ORDER BY created_at DESC LIMIT 5;"
echo ""

# Count sessions with user_id
session_with_user=$(sqlite3 /home/wsj/src/duplistatus/data/backups.db "SELECT COUNT(*) FROM sessions WHERE user_id IS NOT NULL;")
session_without_user=$(sqlite3 /home/wsj/src/duplistatus/data/backups.db "SELECT COUNT(*) FROM sessions WHERE user_id IS NULL;")

echo "Sessions with user_id: $session_with_user"
echo "Sessions without user_id (anonymous): $session_without_user"
echo ""

if [ "$session_with_user" -eq 0 ]; then
    echo "⚠️  WARNING: No authenticated sessions found in database!"
    echo "This indicates the login loop issue may still exist."
    echo ""
    echo "To test:"
    echo "1. Open http://localhost:8666 in your browser"
    echo "2. Perform a database restore (Settings → Database Maintenance)"
    echo "3. Login with admin/password"
    echo "4. Check if you're redirected to the dashboard without loop"
    echo ""
    echo "After successful login, re-run this script to verify sessions are created with user_id."
else
    echo "✅ Found $session_with_user authenticated session(s) in database"
    echo "Login is working correctly!"
fi

echo ""
echo "Latest authenticated sessions:"
sqlite3 /home/wsj/src/duplistatus/data/backups.db "SELECT s.id, s.user_id, u.username, s.created_at FROM sessions s LEFT JOIN users u ON s.user_id = u.id WHERE s.user_id IS NOT NULL ORDER BY s.created_at DESC LIMIT 3;"
