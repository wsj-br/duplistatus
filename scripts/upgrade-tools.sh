#!/bin/bash
# upgrade-tools.sh
#
# This script upgrades the development tools (Node.js via nvm, and global npm packages)
# to the latest versions.
#
# When sourced from upgrade-dependencies.sh, TRANSREWRT_UPGRADE_TOOLS_SUPPRESS_DONE=1
# avoids printing "Done." before the dependency steps finish.
#
# Shells cannot export environment changes to a parent process; nvm must run in your
# interactive shell (see https://github.com/nvm-sh/nvm/issues/2124). Run:
#   source ./scripts/upgrade-tools.sh
# This file aborts if executed as ./scripts/upgrade-tools.sh unless CI=1 or
# TRANSREWRT_UPGRADE_ALLOW_EXEC=1 (for automation).
#

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  if [ -z "${TRANSREWRT_UPGRADE_ALLOW_EXEC:-}" ] && [ -z "${CI:-}" ]; then
    echo "Abort: run this script with source so nvm applies to your current shell." >&2
    echo "  source ${SCRIPT_DIR}/upgrade-tools.sh" >&2
    echo "(Automation: set CI=1 or TRANSREWRT_UPGRADE_ALLOW_EXEC=1 to allow execution without source.)" >&2
    exit 1
  fi
fi

# Load nvm (it's a shell function, not available in script subshells by default)
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

# shellcheck source=scripts/nvm-lts-resolve-version.sh
. "$SCRIPT_DIR/nvm-lts-resolve-version.sh"

_transrewrt_upgrade_tools() {
  set -e

  # Color codes
  BLUE='\033[0;34m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  RESET='\033[0m'

  echo ""
  echo "--------------------------------"
  echo "🔄 Upgrading tools "
  echo "--------------------------------"

  # Upgrade nvm itself to the latest tagged release (nvm-sh is installed as a git clone).
  if [ -d "$NVM_DIR/.git" ]; then
    echo -e "${BLUE}Upgrading nvm to the latest release...${RESET}"
    (
      cd "$NVM_DIR" || exit 1
      git fetch -q --tags origin
      git checkout -q "$(git describe --abbrev=0 --tags --match "v[0-9]*" "$(git rev-list --tags --max-count=1)")"
    )
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  fi

  # Upgrade Node.js to the latest LTS (same idea as upgrade-tools.ps1 / nvm-windows: capture
  # install output, parse the version, and nvm use that version.)
  if declare -F nvm >/dev/null 2>&1; then
    echo -e "${BLUE}Upgrading Node.js to the latest LTS version...${RESET}"
    install_out=$(nvm install --lts 2>&1)
    printf '%s\n' "$install_out"
    nvm_resolve_lts_node_version "$install_out" || true
    if [ -n "$node_ver" ]; then
      echo -e "${GREEN}Using Node.js version ${node_ver}${RESET}"
      nvm use "$node_ver"
    else
      echo -e "${YELLOW}Could not parse installed LTS version; using nvm use --lts${RESET}"
      nvm use --lts
    fi
    resolved_node_ver=$(nvm current 2>/dev/null)
    resolved_node_ver=${resolved_node_ver#v}
    if [ -z "$resolved_node_ver" ] || [ "$resolved_node_ver" = "system" ]; then
      resolved_node_ver=$node_ver
    fi
    if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ] && [ -n "$resolved_node_ver" ] && [ "$resolved_node_ver" != "system" ]; then
      echo ""
      echo -e "${YELLOW}Tip:${RESET} This run was a separate process; use ${GREEN}source ${SCRIPT_DIR}/upgrade-tools.sh${RESET} so nvm applies to this shell."
    fi
  else
    echo -e "${YELLOW}nvm not found. Install nvm (https://github.com/nvm-sh/nvm) to upgrade Node.js, or skip this step.${RESET}"
  fi

  # Upgrade npm to the latest version
  echo -e "${BLUE}📦  Upgrading npm to the latest version...${RESET}"
  npm install -g npm@latest

  # Ensure pnpm, npm-check-updates and doctoc are installed and in the latest version
  echo -e "${BLUE}📦  Upgrading pnpm, npm-check-updates and doctoc...${RESET}"
  npm install -g pnpm npm-check-updates doctoc

  # Get the installed pnpm version and update the packageManager field so corepack
  # picks up the new version instead of the old pinned one.
  pnpm_new_ver=$(npm ls -g pnpm --depth=0 --json 2>/dev/null | node -e "
    try {
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      const v = d.dependencies?.pnpm?.version;
      if (v) process.stdout.write(v);
    } catch(e) {}" 2>/dev/null || true)

  if [ -n "$pnpm_new_ver" ]; then
    echo -e "${BLUE}✏️  Updating packageManager field to pnpm@${pnpm_new_ver}...${RESET}"
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('${SCRIPT_DIR}/../package.json', 'utf8'));
      pkg.packageManager = 'pnpm@${pnpm_new_ver}';
      fs.writeFileSync('${SCRIPT_DIR}/../package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    echo -e "${GREEN}✔  packageManager updated to pnpm@${pnpm_new_ver}${RESET}"

    if command -v corepack >/dev/null 2>&1; then
      echo -e "${BLUE}📦  Activating pnpm@${pnpm_new_ver} via corepack...${RESET}"
      corepack prepare pnpm@"${pnpm_new_ver}" --activate
    fi
  else
    echo -e "${YELLOW}⚠  Could not determine installed pnpm version; skipping packageManager update${RESET}"
  fi

  if [ -z "${TRANSREWRT_UPGRADE_TOOLS_SUPPRESS_DONE:-}" ]; then
    echo ""
    echo "Done."
  fi
}

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  _transrewrt_upgrade_tools "$@"
  return 0
fi

_transrewrt_upgrade_tools "$@"
exit $?
