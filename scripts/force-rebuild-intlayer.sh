#!/bin/bash
# Force complete rebuild of intlayer dictionaries and clear all caches

set -e

echo "=== Force Rebuilding Intlayer Dictionaries ==="

# 1. Kill any running dev servers
echo "1. Killing any processes on port 8666..."
if command -v lsof >/dev/null 2>&1; then
    PID=$(lsof -ti:8666 2>/dev/null || true)
    if [ -n "$PID" ]; then
        kill -9 $PID 2>/dev/null || true
        echo "   Killed process $PID"
    fi
fi

# 2. Clear all Next.js caches
echo "2. Clearing Next.js cache..."
rm -rf .next
echo "   ✓ Cleared .next"

# 3. Clear intlayer cache
echo "3. Clearing Intlayer cache..."
rm -rf .intlayer/cache
echo "   ✓ Cleared .intlayer/cache"

# 4. Rebuild dictionaries
echo "4. Rebuilding Intlayer dictionaries..."
pnpm intlayer build
echo "   ✓ Dictionaries rebuilt"

# 5. Verify the dictionary value
echo "5. Verifying dictionary value..."
STORAGE_VALUE=$(python3 -c "import json; d=json.load(open('.intlayer/dictionary/server-cards.json')); print(d['content']['translation']['es']['storage'])" 2>/dev/null)
if [ "$STORAGE_VALUE" = "Almacén" ]; then
    echo "   ✓ Dictionary has correct value: $STORAGE_VALUE"
else
    echo "   ✗ ERROR: Dictionary has wrong value: $STORAGE_VALUE (expected: Almacén)"
    exit 1
fi

# 6. Touch dictionaries.mjs to force webpack re-read
echo "6. Touching dictionaries.mjs..."
touch .intlayer/main/dictionaries.mjs
echo "   ✓ Touched dictionaries.mjs"

# 7. Clear any webpack chunks
echo "7. Clearing webpack chunks..."
find .next -name "*dictionaries*" -delete 2>/dev/null || true
find .next -name "*intlayer*" -delete 2>/dev/null || true
echo "   ✓ Cleared webpack chunks"

echo ""
echo "=== Rebuild Complete ==="
echo "You can now run: pnpm dev"
echo ""
