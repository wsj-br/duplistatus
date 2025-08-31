#!/bin/sh
# update-version.sh

# Extract version from package.json using basic shell commands
VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/')

# Check if .env file exists
if [ -f .env ]; then
    # If .env exists, check if VERSION variable exists and compare versions
    if grep -q "^VERSION=" .env; then
        # Get current version from .env file
        CURRENT_VERSION=$(grep "^VERSION=" .env | cut -d'=' -f2)
        
        # Compare versions
        if [ "$CURRENT_VERSION" = "$VERSION" ]; then
            echo "Version is already up to date: $VERSION"
            exit 0
        else
            echo "Updating version from $CURRENT_VERSION to $VERSION"
            # Update VERSION variable
            sed "s/^VERSION=.*/VERSION=$VERSION/" .env > .env.tmp && mv .env.tmp .env
            echo "Updated VERSION=$VERSION in existing .env file"
        fi
    else
        # VERSION variable doesn't exist, append it
        echo "VERSION=$VERSION" >> .env
        echo "Added VERSION=$VERSION to existing .env file"
    fi
else
    # If .env doesn't exist, create it with just VERSION
    echo "VERSION=$VERSION" > .env
    echo "Created new .env file with VERSION=$VERSION"
fi
