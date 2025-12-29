#!/bin/sh
# update-version.sh
#
# This script updates the VERSION variable in the .env file to the version in package.json


# Extract version from package.json using basic shell commands
VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/' | head -1)

# Check if .env file exists
if [ -f .env ]; then
    # If .env exists, check if VERSION variable exists and compare versions
    if grep -q "^VERSION=" .env; then
        # Get current version from .env file
        CURRENT_VERSION=$(awk -F'[= ]' '/VERSION/ {for(i=1;i<=NF;i++) if($i=="VERSION") break; print $(i+1);}'  .env|head -1)
        # Compare versions
        if [ "$CURRENT_VERSION" != "$VERSION" ]; then
            # Update VERSION variable
            sed "s|^VERSION=[.0-9]*|VERSION=$VERSION|" .env > .env.tmp && mv .env.tmp .env
            echo "✅ Updated VERSION=$VERSION in existing .env file"
        fi
    else
        # VERSION variable doesn't exist, append it
        echo "VERSION=$VERSION" >> .env
        echo "➕ Added VERSION=$VERSION to existing .env file"
    fi
else
    # If .env doesn't exist, create it with just VERSION
    echo "VERSION=$VERSION" > .env
    echo "📄 Created new .env file with VERSION=$VERSION"
fi


# If Dockerfile  exists, check if VERSION variable exists and compare versions
if [ -f Dockerfile ]; then
    if grep -q "VERSION=" Dockerfile; then
        # Get current version from .env file
        CURRENT_VERSION=$(awk -F'[= ]' '/VERSION/ {for(i=1;i<=NF;i++) if($i=="VERSION") break; print $(i+1);}' Dockerfile)

        # Compare versions
        if [ "$CURRENT_VERSION" != "$VERSION" ]; then

            # Update VERSION variable
            sed "s|VERSION=[.0-9]*|VERSION=$VERSION|" Dockerfile > Dockerfile.tmp && mv Dockerfile.tmp Dockerfile
            echo "✅ Updated VERSION=$VERSION in existing Dockerfile file"
        fi
    fi
fi

# If documentation/package.json exists, check if version exists and compare versions
if [ -f documentation/package.json ]; then
    if grep -q '"version"' documentation/package.json; then
        # Get current version from documentation/package.json
        CURRENT_VERSION=$(grep '"version"' documentation/package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/' | head -1)

        # Compare versions
        if [ "$CURRENT_VERSION" != "$VERSION" ]; then
            # Update version in documentation/package.json
            sed "s|\"version\": *\"[^\"]*\"|\"version\": \"$VERSION\"|" documentation/package.json > documentation/package.json.tmp && mv documentation/package.json.tmp documentation/package.json
            echo "✅ Updated version=$VERSION in documentation/package.json"
        fi
    fi
fi
