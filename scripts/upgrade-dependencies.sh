#!/bin/bash
# upgrade-dependencies.sh
#
# Upgrades dependencies and runs pnpm audit for:
#   - Repository root (Next.js app: dependencies + devDependencies)
#   - documentation/ (Docusaurus; workspace package — shares root pnpm lockfile)
#
# Shells cannot export environment changes to a parent process; nvm must run in your
# interactive shell (see https://github.com/nvm-sh/nvm/issues/2124). Run:
#   source ./scripts/upgrade-dependencies.sh
# This file aborts if executed as ./scripts/upgrade-dependencies.sh unless CI=1 or
# DUPLISTATUS_UPGRADE_ALLOW_EXEC=1 (for automation).
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  if [ -z "${DUPLISTATUS_UPGRADE_ALLOW_EXEC:-}" ] && [ -z "${CI:-}" ]; then
    echo "Abort: run this script with source so nvm applies to your current shell." >&2
    echo "  source ${SCRIPT_DIR}/upgrade-dependencies.sh" >&2
    echo "(Automation: set CI=1 or DUPLISTATUS_UPGRADE_ALLOW_EXEC=1 to allow execution without source.)" >&2
    exit 1
  fi
fi

_duplistatus_upgrade_dependencies() {
  set -e

  REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  cd "$REPO_ROOT"

  BLUE='\033[0;34m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  RESET='\033[0m'

  echo ""
  echo "--------------------------------"
  echo "🔄 Upgrading dependencies "
  echo "--------------------------------"

  _suppress_done_was_set=0
  _suppress_done_prev=
  if [ -n "${DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE+x}" ]; then
    _suppress_done_prev=$DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE
    _suppress_done_was_set=1
  fi
  DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE=1
  export DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE
  DUPLISTATUS_UPGRADE_TOOLS_DEFINE_ONLY=1
  export DUPLISTATUS_UPGRADE_TOOLS_DEFINE_ONLY
  # shellcheck source=scripts/upgrade-tools.sh
  . "${SCRIPT_DIR}/upgrade-tools.sh"
  _duplistatus_upgrade_tools
  if [ "$_suppress_done_was_set" -eq 1 ]; then
    DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE=$_suppress_done_prev
    export DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE
  else
    unset DUPLISTATUS_UPGRADE_TOOLS_SUPPRESS_DONE
  fi
  unset _suppress_done_prev _suppress_done_was_set

  cd "$REPO_ROOT"

  # npm-check-updates: optionally pin eslint stack until React ESLint plugins allow ESLint 10
  # (see scripts/eslint-react-peers-allow-eslint10.js).
  _eslint_ncu_reject='eslint,@eslint/js,eslint-plugin-react,eslint-plugin-react-hooks'
  echo -e "${BLUE}📦  [repo root] Checking registry: do latest react ESLint plugins allow ESLint 10?${RESET}"
  set +e
  _eslint10_peer_out=$(node "${SCRIPT_DIR}/eslint-react-peers-allow-eslint10.js" 2>&1)
  _eslint10_peer_ok=$?
  set -e
  printf '%s\n' "$_eslint10_peer_out" | pr -o 4 -T
  echo -e "${BLUE}📦  [repo root] npm-check-updates (app: dependencies + devDependencies)...${RESET}"
  if [ "$_eslint10_peer_ok" -eq 0 ]; then
    echo -e "${GREEN}Peer ranges include ESLint 10; upgrading the ESLint stack with everything else.${RESET}"
    ncu --upgrade 2>&1 | pr -o 4 -T
  elif [ "$_eslint10_peer_ok" -eq 1 ]; then
    echo -e "${YELLOW}Peer ranges still exclude ESLint 10; excluding ${_eslint_ncu_reject} from bump${RESET}"
    ncu --upgrade -x "$_eslint_ncu_reject" 2>&1 | pr -o 4 -T
  else
    echo -e "${YELLOW}Could not verify peer ranges (offline or error). Excluding ${_eslint_ncu_reject} from bump${RESET}"
    ncu --upgrade -x "$_eslint_ncu_reject" 2>&1 | pr -o 4 -T
  fi

  echo -e "${BLUE}📦  [documentation] npm-check-updates (Docusaurus: dependencies + devDependencies)...${RESET}"
  if [ -f "${REPO_ROOT}/documentation/package.json" ]; then
    # Same ESLint peer decision as root (registry-wide); keep eslint stack aligned with Next/Docusaurus.
    if [ "$_eslint10_peer_ok" -eq 0 ]; then
      ( cd "${REPO_ROOT}/documentation" && ncu --upgrade 2>&1 | pr -o 4 -T )
    elif [ "$_eslint10_peer_ok" -eq 1 ]; then
      ( cd "${REPO_ROOT}/documentation" && ncu --upgrade -x "$_eslint_ncu_reject" 2>&1 | pr -o 4 -T )
    else
      ( cd "${REPO_ROOT}/documentation" && ncu --upgrade -x "$_eslint_ncu_reject" 2>&1 | pr -o 4 -T )
    fi
  else
    echo -e "${YELLOW}Skipping documentation: ${REPO_ROOT}/documentation/package.json not found.${RESET}"
  fi

  echo -e "${BLUE}⬆️  [repo root] pnpm install (workspace lockfile)...${RESET}"
  pnpm install 2>&1 | pr -o 4 -T

  echo -e "${BLUE}🌐  Updating browserslist database...${RESET}"
  npx --yes update-browserslist-db@latest 2>&1 | pr -o 4 -T

  echo -e "${BLUE}✅  Dependency upgrade completed${RESET}"
  echo ""

  echo -e "${BLUE}🔍  Checking for vulnerabilities...${RESET}"
  pnpm audit 2>&1 | pr -o 4 -T

  echo -e "${BLUE}🔧  Fixing vulnerabilities...${RESET}"
  pnpm audit fix 2>&1 | pr -o 4 -T

  echo -e "${BLUE}🔍  Checking for vulnerabilities again...${RESET}"
  pnpm audit 2>&1 | pr -o 4 -T
}

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  _duplistatus_upgrade_dependencies "$@"
  return 0
fi

_duplistatus_upgrade_dependencies "$@"
exit $?
