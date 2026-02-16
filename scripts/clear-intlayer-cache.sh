#!/bin/bash
# Script to clear intlayer-related caches

echo "Clearing intlayer caches..."

# Clear webpack cache for intlayer
if [ -d ".next" ]; then
    find .next -name "*dictionaries*" -delete 2>/dev/null || true
    find .next -name "*intlayer*" -delete 2>/dev/null || true
    echo "Cleared .next cache"
fi

# Clear intlayer cache
if [ -d ".intlayer/cache" ]; then
    rm -rf .intlayer/cache
    echo "Cleared .intlayer/cache"
fi

# Touch dictionaries.mjs to force webpack re-read
if [ -f ".intlayer/main/dictionaries.mjs" ]; then
    touch .intlayer/main/dictionaries.mjs
    echo "Touched dictionaries.mjs"
fi

echo "Cache cleared!"
