#!/bin/bash

# Get version from .env file or fallback to package.json
if [ -f .env ]; then
    export VERSION=$(grep "^VERSION=" .env | cut -d '=' -f2)
else
    export VERSION=$(node -p "require('./package.json').version")
fi

echo "Using version: $VERSION"

# Run docker-compose with the version
docker-compose "$@"
