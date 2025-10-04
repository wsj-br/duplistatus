#!/bin/sh
# update-version.sh
#
# This script updates the VERSION variable in the .env file to the version in package.json


# Extract version from package.json using basic shell commands
VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')

# Check if .env file exists
if [ -f .env ]; then
    # If .env exists, check if VERSION variable exists and compare versions
    if grep -q "^VERSION=" .env; then
        # Get current version from .env file
        CURRENT_VERSION=$(awk -F'[= ]' '/VERSION/ {for(i=1;i<=NF;i++) if($i=="VERSION") break; print $(i+1);}'  .env)
        
        # Compare versions
        if [ "$CURRENT_VERSION" != "$VERSION" ]; then
            # Update VERSION variable
            sed "s/^VERSION=[.0-9*]*/VERSION=$VERSION/" .env > .env.tmp && mv .env.tmp .env
            echo "✅ Updated VERSION=$VERSION in existing .env file"
            echo ""
        fi
    else
        # VERSION variable doesn't exist, append it
        echo "VERSION=$VERSION" >> .env
        echo "➕ Added VERSION=$VERSION to existing .env file"
        echo ""
    fi
else
    # If .env doesn't exist, create it with just VERSION
    echo "VERSION=$VERSION" > .env
    echo "📄 Created new .env file with VERSION=$VERSION"
    echo ""
fi


# If Dockerfile  exists, check if VERSION variable exists and compare versions
if grep -q "VERSION=" Dockerfile; then
    # Get current version from .env file
    CURRENT_VERSION=$(awk -F'[= ]' '/VERSION/ {for(i=1;i<=NF;i++) if($i=="VERSION") break; print $(i+1);}' Dockerfile)

    # Compare versions
    if [ "$CURRENT_VERSION" != "$VERSION" ]; then

        # Update VERSION variable
        sed "s/VERSION=[.0-9*]*/VERSION=$VERSION/" Dockerfile > Dockerfile.tmp && mv Dockerfile.tmp Dockerfile
        echo "✅ Updated VERSION=$VERSION in existing Dockerfile file"
        echo ""
    fi
fi
