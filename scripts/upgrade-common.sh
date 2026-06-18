#!/usr/bin/env bash
# upgrade-common.sh
#
# Shared, project-agnostic helpers for upgrade-tools.sh and upgrade-dependencies.sh.
# Nothing here is specific to any project: the package manager, the workspace
# package directories, and each package's verify command are all auto-detected
# from the lockfile, pnpm-workspace.yaml / package.json "workspaces", and the
# package's own "scripts". This lets the same pair of scripts drop into any
# project (duplistatus, transrewrt, ai-i18n-tools, ...) with no edits.
#
# Callers must set REPO_ROOT before sourcing-dependent functions are used.

# --- output helpers -----------------------------------------------------------
UPGRADE_BLUE='\033[0;34m'
UPGRADE_GREEN='\033[0;32m'
UPGRADE_YELLOW='\033[0;33m'
UPGRADE_RED='\033[0;31m'
UPGRADE_RESET='\033[0m'

upgrade_log() { echo -e "${UPGRADE_BLUE}$*${UPGRADE_RESET}"; }
upgrade_ok() { echo -e "${UPGRADE_GREEN}$*${UPGRADE_RESET}"; }
upgrade_warn() { echo -e "${UPGRADE_YELLOW}$*${UPGRADE_RESET}"; }
upgrade_err() { echo -e "${UPGRADE_RED}$*${UPGRADE_RESET}" >&2; }

# run_step COMMAND [ARGS...]
# Runs a command, indents its combined output, and returns the command's REAL
# exit status (not pr's). This avoids the classic `set -e` + `... | pr` bug
# where a failing command is masked because the pipeline's status is pr's.
run_step() {
  "$@" 2>&1 | pr -o 4 -T
  return "${PIPESTATUS[0]}"
}

# --- auto-detection -----------------------------------------------------------

# detect_pkg_mgr: echo the package manager implied by the root lockfile.
# Defaults to pnpm when nothing is found (pnpm is the primary supported PM).
detect_pkg_mgr() {
  if [ -f "$REPO_ROOT/pnpm-lock.yaml" ]; then
    echo pnpm
  elif [ -f "$REPO_ROOT/package-lock.json" ] || [ -f "$REPO_ROOT/npm-shrinkwrap.json" ]; then
    echo npm
  elif [ -f "$REPO_ROOT/yarn.lock" ]; then
    echo yarn
  elif [ -f "$REPO_ROOT/bun.lockb" ] || [ -f "$REPO_ROOT/bun.lock" ]; then
    echo bun
  else
    echo pnpm
  fi
}

# detect_workspace_dirs: print absolute directories of every workspace package,
# repo root first, one per line. Handles pnpm-workspace.yaml globs (including
# ".") via pnpm's own listing, and falls back to package.json "workspaces"
# (with simple glob expansion), then to the repo root only.
detect_workspace_dirs() {
  local paths=""

  if [ "${PKG_MGR:-}" = "pnpm" ] && command -v pnpm >/dev/null 2>&1; then
    local json
    json=$(cd "$REPO_ROOT" && pnpm ls -r --depth -1 --json 2>/dev/null) || json=""
    if [ -n "$json" ]; then
      paths=$(printf '%s' "$json" | node -e '
        let s = "";
        process.stdin.on("data", d => (s += d));
        process.stdin.on("end", () => {
          try {
            const a = JSON.parse(s);
            const out = [];
            for (const p of (Array.isArray(a) ? a : [a])) {
              if (p && p.path) out.push(p.path);
            }
            process.stdout.write(out.join("\n"));
          } catch (e) {
            process.exit(1);
          }
        });' 2>/dev/null) || paths=""
    fi
  fi

  if [ -z "$paths" ]; then
    paths=$(REPO_ROOT="$REPO_ROOT" node -e '
      const fs = require("fs");
      const path = require("path");
      const root = process.env.REPO_ROOT;
      const dirs = new Set();
      const hasPkg = d => { try { return fs.existsSync(path.join(d, "package.json")); } catch (e) { return false; } };
      if (hasPkg(root)) dirs.add(root);
      let globs = [];
      try {
        const pj = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
        if (Array.isArray(pj.workspaces)) globs = pj.workspaces;
        else if (pj.workspaces && Array.isArray(pj.workspaces.packages)) globs = pj.workspaces.packages;
      } catch (e) {}
      const add = d => { if (hasPkg(d)) dirs.add(d); };
      for (const g of globs) {
        if (g.endsWith("/*")) {
          const base = path.join(root, g.slice(0, -2));
          try {
            for (const e of fs.readdirSync(base, { withFileTypes: true })) {
              if (e.isDirectory()) add(path.join(base, e.name));
            }
          } catch (e) {}
        } else {
          add(path.join(root, g));
        }
      }
      process.stdout.write(Array.from(dirs).join("\n"));
    ' 2>/dev/null) || paths=""
  fi

  if [ -z "$paths" ]; then
    paths="$REPO_ROOT"
  fi

  # Emit repo root first, then the rest, de-duplicated and order-preserving.
  printf '%s\n' "$paths" | awk -v root="$REPO_ROOT" '
    $0 == "" { next }
    seen[$0]++ { next }
    { if ($0 == root) { rootline = $0 } else { rest[++n] = $0 } }
    END { if (rootline != "") print rootline; for (i = 1; i <= n; i++) print rest[i] }
  '
}

# detect_verify_cmd DIR: echo the build-safety verify command for a package
# directory, chaining whichever of typecheck/lint/build scripts exist. Prefers
# the fast typecheck+lint pair; falls back to build only. Empty if none exist.
detect_verify_cmd() {
  local dir=$1 scripts
  scripts=$(node -e '
    const fs = require("fs");
    try {
      const p = JSON.parse(fs.readFileSync(process.argv[1] + "/package.json", "utf8"));
      const s = p.scripts || {};
      const have = ["typecheck", "lint", "build"].filter(x => typeof s[x] === "string" && s[x].length);
      let chosen = have.filter(x => x !== "build");
      if (chosen.length === 0 && have.includes("build")) chosen = ["build"];
      process.stdout.write(chosen.join(","));
    } catch (e) {}
  ' "$dir" 2>/dev/null) || scripts=""

  [ -z "$scripts" ] && return 0

  local cmd="" s
  local IFS=','
  for s in $scripts; do
    if [ -z "$cmd" ]; then
      cmd="${PKG_MGR:-pnpm} run $s"
    else
      cmd="$cmd && ${PKG_MGR:-pnpm} run $s"
    fi
  done
  echo "$cmd"
}

# dir_label DIR: a short human label for a workspace dir.
dir_label() {
  if [ "$1" = "$REPO_ROOT" ]; then
    echo "repo root"
  else
    echo "${1#"$REPO_ROOT"/}"
  fi
}
