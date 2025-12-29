#!/bin/bash
# Script to set up git credentials for Docusaurus deployment
# This stores your GitHub Personal Access Token in git credential store

echo "Setting up git credentials for Docusaurus deployment..."
echo ""
echo "You need a GitHub Personal Access Token with 'repo' scope."
echo "Create one at: https://github.com/settings/tokens"
echo ""
read -p "Enter your GitHub Personal Access Token: " -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: Token cannot be empty"
    exit 1
fi

# Store credentials in git credential store
# git credential-store expects input in key=value format
{
    echo "protocol=https"
    echo "host=github.com"
    echo "username=wsj-br"
    echo "password=${GITHUB_TOKEN}"
} | git credential-store store

echo ""
echo "✓ Credentials stored successfully!"
echo "You can now run: pnpm run deploy"
echo ""
echo "Note: Credentials are stored in ~/.git-credentials"
echo "To remove them later, you can delete that file or use:"
echo "  git credential-store erase https://github.com"

