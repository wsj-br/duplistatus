#!/usr/bin/env bash
# upgrade-tools.sh
#
# Upgrades the development tools (Node.js via nvm, npm, the project's package
# manager, npm-check-updates, and doctoc) to their latest versions. Project
# agnostic: the package manager is auto-detected from the root lockfile.
#
# Shells cannot export environment changes to a parent process; nvm must run in
# your interactive shell (see https://github.com/nvm-sh/nvm/issues/2124). Run:
#   source ./scripts/upgrade-tools.sh
# This file aborts if executed as ./scripts/upgrade-tools.sh unless CI=1 or
# UPGRADE_ALLOW_EXEC=1 (for automation).
#
# Env vars (used when sourced from upgrade-dependencies.sh):
#   UPGRADE_TOOLS_DEFINE_ONLY=1    Define _upgrade_tools but do not run it.
#   UPGRADE_TOOLS_SUPPRESS_DONE=1  Suppress the trailing "Done." line.
#

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

# shellcheck source=scripts/upgrade-common.sh
. "$SCRIPT_DIR/upgrade-common.sh"

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  if [ -z "${UPGRADE_ALLOW_EXEC:-}" ] && [ -z "${CI:-}" ]; then
    echo "Abort: run this script with source so nvm applies to your current shell." >&2
    echo "  source ${SCRIPT_DIR}/upgrade-tools.sh" >&2
    echo "(Automation: set CI=1 or UPGRADE_ALLOW_EXEC=1 to allow execution without source.)" >&2
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

_upgrade_tools() {
  echo ""
  echo "--------------------------------"
  echo "🔄 Upgrading tools "
  echo "--------------------------------"

  local PKG_MGR
  PKG_MGR=$(detect_pkg_mgr)

  # Upgrade nvm itself to the latest tagged release (nvm-sh is installed as a git clone).
  if [ -d "$NVM_DIR/.git" ]; then
    upgrade_log "Upgrading nvm to the latest release..."
    (
      cd "$NVM_DIR" || exit 1
      git fetch -q --tags origin
      git checkout -q "$(git describe --abbrev=0 --tags --match "v[0-9]*" "$(git rev-list --tags --max-count=1)")"
    )
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  fi

  # Upgrade Node.js to the latest LTS: capture install output, parse the version, and use it.
  if declare -F nvm >/dev/null 2>&1; then
    upgrade_log "Upgrading Node.js to the latest LTS version..."
    local install_out resolved_node_ver
    install_out=$(nvm install --lts 2>&1)
    printf '%s\n' "$install_out"
    nvm_resolve_lts_node_version "$install_out" || true
    if [ -n "$node_ver" ]; then
      upgrade_ok "Using Node.js version ${node_ver}"
      nvm use "$node_ver"
    else
      upgrade_warn "Could not parse installed LTS version; using nvm use --lts"
      nvm use --lts
    fi
    resolved_node_ver=$(nvm current 2>/dev/null)
    resolved_node_ver=${resolved_node_ver#v}
    if [ -z "$resolved_node_ver" ] || [ "$resolved_node_ver" = "system" ]; then
      resolved_node_ver=$node_ver
    fi
    if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ] && [ -n "$resolved_node_ver" ] && [ "$resolved_node_ver" != "system" ]; then
      echo ""
      upgrade_warn "Tip: This run was a separate process; use 'source ${SCRIPT_DIR}/upgrade-tools.sh' so nvm applies to this shell."
    fi
  else
    upgrade_warn "nvm not found. Install nvm (https://github.com/nvm-sh/nvm) to upgrade Node.js, or skip this step."
  fi

  # Upgrade npm to the latest version
  upgrade_log "📦  Upgrading npm to the latest version..."
  npm install -g npm@latest

  # Ensure the package manager, npm-check-updates and doctoc are installed and current.
  upgrade_log "📦  Upgrading ${PKG_MGR}, npm-check-updates and doctoc..."
  if [ "$PKG_MGR" = "npm" ]; then
    npm install -g npm-check-updates doctoc
  else
    npm install -g "$PKG_MGR" npm-check-updates doctoc
  fi

  # Get the installed package-manager version and update the packageManager field
  # so corepack picks up the new version instead of the old pinned one.
  local pm_new_ver
  pm_new_ver=$(npm ls -g "$PKG_MGR" --depth=0 --json 2>/dev/null | node -e "
    try {
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      const v = d.dependencies?.['${PKG_MGR}']?.version;
      if (v) process.stdout.write(v);
    } catch(e) {}" 2>/dev/null || true)

  if [ -n "$pm_new_ver" ]; then
    upgrade_log "✏️  Updating packageManager field to ${PKG_MGR}@${pm_new_ver}..."
    PKG_MGR="$PKG_MGR" PM_VER="$pm_new_ver" PKG_FILE="${REPO_ROOT}/package.json" node -e "
      const fs = require('fs');
      const f = process.env.PKG_FILE;
      const pkg = JSON.parse(fs.readFileSync(f, 'utf8'));
      pkg.packageManager = process.env.PKG_MGR + '@' + process.env.PM_VER;
      fs.writeFileSync(f, JSON.stringify(pkg, null, 2) + '\n');
    "
    upgrade_ok "✔  packageManager updated to ${PKG_MGR}@${pm_new_ver}"

    if command -v corepack >/dev/null 2>&1; then
      case "$PKG_MGR" in
        pnpm | yarn | npm)
          upgrade_log "📦  Activating ${PKG_MGR}@${pm_new_ver} via corepack..."
          corepack prepare "${PKG_MGR}@${pm_new_ver}" --activate || true
          ;;
        *) : ;;
      esac
    fi
  else
    upgrade_warn "⚠  Could not determine installed ${PKG_MGR} version; skipping packageManager update"
  fi

  if [ -z "${UPGRADE_TOOLS_SUPPRESS_DONE:-}" ]; then
    echo ""
    echo "Done."
  fi
}

# When sourced solely to obtain the function (by upgrade-dependencies.sh),
# define it and return without running.
if [ -n "${UPGRADE_TOOLS_DEFINE_ONLY:-}" ] && [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  return 0
fi

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  _upgrade_tools "$@"
  return 0
fi

_upgrade_tools "$@"
exit $?
