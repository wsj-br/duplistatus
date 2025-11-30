#!/bin/bash
# upgrade-dependencies.sh
#
# This script upgrades the dependencies in the project to the latest versions.
#



set -e  # Exit on error

# Color codes
BLUE='\033[0;34m'
RESET='\033[0m'

echo ""
echo "--------------------------------"
echo "🔄 Upgrading dependencies "
echo "--------------------------------"


# Update package.json with latest versions using npm-check-updates
echo -e "${BLUE}📦  Running npm-check-updates...${RESET}"
ncu --upgrade 2>&1 | pr -o 4 -T

# Update pnpm lockfile and install updated dependencies
echo -e "${BLUE}⬆️  Running pnpm install...${RESET}"
pnpm install 2>&1 | pr -o 4 -T

# Update browserslist database

echo -e "${BLUE}🌐  Updating browserslist database...${RESET}"
npx --yes update-browserslist-db@latest 2>&1 | pr -o 4 -T

echo -e "${BLUE}✅  Dependency upgrade completed${RESET}"
echo ""

