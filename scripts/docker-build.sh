#!/bin/bash

# Get version from .env file
if [ -f .env ]; then
    VERSION=$(grep "^VERSION=" .env | cut -d '=' -f2)
else
    # Fallback to package.json version
    VERSION=$(node -p "require('./package.json').version")
fi

echo "Building Docker image with version: $VERSION"

# Build the Docker image with the version as build argument
docker build --build-arg VERSION="$VERSION" -t duplistatus:$VERSION .

echo "Docker image built successfully with version: $VERSION"
