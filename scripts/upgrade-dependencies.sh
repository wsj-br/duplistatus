#!/usr/bin/env bash
# upgrade-dependencies.sh
#
# Project-agnostic dependency upgrader. Works in any project (duplistatus,
# transrewrt, ai-i18n-tools, ...) with no edits: the package manager, the
# workspace packages, and each package's verify command are auto-detected.
#
#   1. Upgrades dev tools (Node/npm/PM/ncu) via upgrade-tools.sh.
#   2. Build-safe upgrades: ncu --doctor per workspace package. Doctor upgrades
#      everything, runs the package's verify command, and bisects on failure -
#      keeping upgrades that pass and reverting only the ones that break it.
#   3. Security: audit + audit fix. For a vulnerable DIRECT dependency that
#      doctor had to revert (the safe version breaks the build), it force-applies
#      the safe version anyway and reports the build errors so the code can be
#      made compatible (a shell script cannot fix the code itself).
#
# Shells cannot export environment changes to a parent process; nvm must run in
# your interactive shell (see https://github.com/nvm-sh/nvm/issues/2124). Run:
#   source ./scripts/upgrade-dependencies.sh
# This file aborts if executed as ./scripts/upgrade-dependencies.sh unless CI=1
# or UPGRADE_ALLOW_EXEC=1 (for automation).
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=scripts/upgrade-common.sh
. "$SCRIPT_DIR/upgrade-common.sh"

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  if [ -z "${UPGRADE_ALLOW_EXEC:-}" ] && [ -z "${CI:-}" ]; then
    echo "Abort: run this script with source so nvm applies to your current shell." >&2
    echo "  source ${SCRIPT_DIR}/upgrade-dependencies.sh" >&2
    echo "(Automation: set CI=1 or UPGRADE_ALLOW_EXEC=1 to allow execution without source.)" >&2
    exit 1
  fi
fi

# --- tools phase --------------------------------------------------------------
# Source upgrade-tools.sh for its function only, then run it. Restore any caller
# value of UPGRADE_TOOLS_SUPPRESS_DONE afterwards.
_run_tools_phase() {
  local had_prev=0 prev=
  if [ -n "${UPGRADE_TOOLS_SUPPRESS_DONE+x}" ]; then
    prev=$UPGRADE_TOOLS_SUPPRESS_DONE
    had_prev=1
  fi
  export UPGRADE_TOOLS_SUPPRESS_DONE=1
  export UPGRADE_TOOLS_DEFINE_ONLY=1
  # shellcheck source=scripts/upgrade-tools.sh
  . "${SCRIPT_DIR}/upgrade-tools.sh"
  unset UPGRADE_TOOLS_DEFINE_ONLY
  _upgrade_tools
  if [ "$had_prev" -eq 1 ]; then
    export UPGRADE_TOOLS_SUPPRESS_DONE=$prev
  else
    unset UPGRADE_TOOLS_SUPPRESS_DONE
  fi
}

# --- snapshot (safety net) ----------------------------------------------------
_snapshot_manifests() {
  SNAPSHOT_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t upgrade-deps)
  upgrade_log "🧷  Snapshotting manifests to ${SNAPSHOT_DIR} (restore manually if needed)..."
  local i=0 d
  : > "$SNAPSHOT_DIR/dirs.txt"
  for d in "${WORKSPACE_DIRS[@]}"; do
    if [ -f "$d/package.json" ]; then
      cp "$d/package.json" "$SNAPSHOT_DIR/package.${i}.json"
      printf '%s\n' "$d" >> "$SNAPSHOT_DIR/dirs.txt"
      i=$((i + 1))
    fi
  done
  local lf
  for lf in pnpm-lock.yaml package-lock.json npm-shrinkwrap.json yarn.lock bun.lockb bun.lock; do
    [ -f "$REPO_ROOT/$lf" ] && cp "$REPO_ROOT/$lf" "$SNAPSHOT_DIR/$lf"
  done
}

# --- ESLint peer-range gate (embedded; no external helper) --------------------
# Decide whether the latest React ESLint plugins admit the latest ESLint major.
# Exit: 0 = both plugins allow it, 1 = at least one does not, 2 = error/offline.
_eslint_peer_allows_latest() {
  PKG_MGR="$PKG_MGR" node <<'NODE'
'use strict';
const { execSync } = require('child_process');
const pm = process.env.PKG_MGR || 'pnpm';

let semver = null;
try { semver = require('semver'); } catch (e) { /* fall back to a crude check */ }

const PLUGINS = ['eslint-plugin-react', 'eslint-plugin-react-hooks'];

function jsonView(spec) {
  let raw;
  try { raw = execSync(`${pm} view ${JSON.stringify(spec)} --json`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { raw = execSync(`${pm} info ${JSON.stringify(spec)} --json`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  return JSON.parse(raw);
}

function latestEslintMajor() {
  const data = jsonView('eslint');
  const v = (data && (data['dist-tags']?.latest || data.version)) ||
    (data && Array.isArray(data.versions) ? data.versions[data.versions.length - 1] : null);
  if (!v) throw new Error('cannot resolve eslint latest version');
  return parseInt(String(v).split('.')[0], 10);
}

function peerEslintRange(pkg) {
  const data = jsonView(pkg);
  const peer = data && data.peerDependencies;
  return peer && peer.eslint;
}

try {
  const major = latestEslintMajor();
  const probe = `${major}.0.0`;
  let ok = true;
  for (const pkg of PLUGINS) {
    const range = peerEslintRange(pkg);
    if (!range || typeof range !== 'string') {
      console.error(`${pkg}: missing peerDependencies.eslint`);
      ok = false;
      continue;
    }
    let allowed;
    if (semver) {
      allowed = semver.satisfies(probe, range, { includePrerelease: true });
    } else {
      allowed = new RegExp(`(^|[^0-9])${major}([^0-9]|$)`).test(range) || /[*]|>=/.test(range);
    }
    console.error(`${pkg} peer eslint "${range}" -> ESLint ${probe} ${allowed ? 'ok' : 'no'}`);
    if (!allowed) ok = false;
  }
  process.exit(ok ? 0 : 1);
} catch (e) {
  console.error('eslint-peer-check: ' + e.message);
  process.exit(2);
}
NODE
}

# True if any workspace package depends on eslint directly. The React ESLint
# plugins are usually pulled in transitively (e.g. via eslint-config-next), so
# gating on a direct eslint dependency - not on direct plugin deps - is what
# matches real projects and keeps eslint pinned until the plugins catch up.
_uses_eslint() {
  local d
  for d in "${WORKSPACE_DIRS[@]}"; do
    if node -e '
      const fs = require("fs");
      try {
        const p = JSON.parse(fs.readFileSync(process.argv[1] + "/package.json", "utf8"));
        const all = Object.assign({}, p.dependencies, p.devDependencies);
        process.exit(all["eslint"] ? 0 : 1);
      } catch (e) { process.exit(1); }' "$d"; then
      return 0
    fi
  done
  return 1
}

_compute_eslint_reject() {
  ESLINT_REJECT=""
  if ! _uses_eslint; then
    return 0
  fi
  upgrade_log "📦  Checking registry: do the latest React ESLint plugins allow the latest ESLint major?"
  local out rc
  out=$(_eslint_peer_allows_latest 2>&1)
  rc=$?
  printf '%s\n' "$out" | pr -o 4 -T
  if [ "$rc" -eq 0 ]; then
    upgrade_ok "Peer ranges include the latest ESLint major; upgrading the ESLint stack with everything else."
    ESLINT_REJECT=""
  else
    upgrade_warn "Peer ranges exclude the latest ESLint major (or the check failed); excluding the ESLint stack from the bump."
    ESLINT_REJECT="eslint,@eslint/js,eslint-plugin-react,eslint-plugin-react-hooks"
  fi
}

# --- build-safe doctor upgrade per package ------------------------------------
_doctor_upgrade_dir() {
  local dir=$1
  local label
  label=$(dir_label "$dir")

  if [ ! -f "$dir/package.json" ]; then
    upgrade_warn "Skipping ${label}: no package.json."
    return 0
  fi

  local verify
  verify=$(detect_verify_cmd "$dir")

  if [ -z "$verify" ]; then
    upgrade_warn "📦  [${label}] No typecheck/lint/build script; upgrading without build verification."
    (cd "$dir" && run_step ncu --upgrade --packageManager "$PKG_MGR" ${ESLINT_REJECT:+-x "$ESLINT_REJECT"}) || true
    return 0
  fi

  upgrade_log "📦  [${label}] ncu --doctor (verify: ${verify})"
  # ncu runs --doctorTest as an argv (no shell), so a "cmd1 && cmd2" string would
  # be passed as arguments to cmd1. Write the verify command to an executable
  # script and hand ncu that single path instead, so the real shell evaluates it.
  local logf rc safe_label verify_script
  safe_label=$(printf '%s' "$label" | tr '/ .' '___')
  logf="$SNAPSHOT_DIR/doctor.${safe_label}.log"
  verify_script="$SNAPSHOT_DIR/verify.${safe_label}.sh"
  printf '#!/bin/sh\ncd %q || exit 1\n%s\n' "$dir" "$verify" > "$verify_script"
  chmod +x "$verify_script"
  (
    cd "$dir" || exit 1
    ncu --doctor --upgrade \
      --packageManager "$PKG_MGR" \
      --doctorInstall "$PKG_MGR install" \
      --doctorTest "$verify_script" \
      ${ESLINT_REJECT:+-x "$ESLINT_REJECT"} 2>&1
  ) | tee "$logf" | pr -o 4 -T
  rc=${PIPESTATUS[0]}

  # doctor aborts (without upgrading) if the verify command already fails on the
  # current tree. Detect that case and tell the user to fix the build first.
  if [ "$rc" -ne 0 ] && ! grep -qE '✓|✗|→|Upgrading' "$logf"; then
    upgrade_warn "   ↳ [${label}] ncu doctor could not run - the verify command likely fails on the current tree. Fix the existing build, then re-run."
    return 0
  fi

  # Capture build-breaking upgrades doctor reverted (lines marked with ✗).
  local reverted
  reverted=$(grep -F '✗' "$logf" 2>/dev/null | sed -E 's/.*✗[[:space:]]*//; s/[[:space:]].*$//' | grep -v '^$' || true)
  if [ -n "$reverted" ]; then
    upgrade_warn "   ↳ build-breaking upgrades reverted in ${label}: $(printf '%s ' $reverted)"
    REVERTED_PKGS="${REVERTED_PKGS}"$'\n'"${reverted}"
  fi
  return 0
}

# --- package-manager audit wrappers -------------------------------------------
_pm_audit() {
  case "$PKG_MGR" in
    pnpm) (cd "$REPO_ROOT" && pnpm audit) ;;
    npm) (cd "$REPO_ROOT" && npm audit) ;;
    yarn) (cd "$REPO_ROOT" && (yarn npm audit 2>/dev/null || yarn audit)) ;;
    bun) (cd "$REPO_ROOT" && (bun audit 2>/dev/null || true)) ;;
    *) : ;;
  esac
}

_pm_audit_json() {
  case "$PKG_MGR" in
    pnpm) (cd "$REPO_ROOT" && pnpm audit --json 2>/dev/null) ;;
    npm) (cd "$REPO_ROOT" && npm audit --json 2>/dev/null) ;;
    yarn) (cd "$REPO_ROOT" && yarn npm audit --json 2>/dev/null) ;;
    bun) (cd "$REPO_ROOT" && bun audit --json 2>/dev/null) ;;
    *) echo "" ;;
  esac
}

_pm_audit_fix() {
  case "$PKG_MGR" in
    pnpm) (cd "$REPO_ROOT" && pnpm audit --fix override) ;;
    npm) (cd "$REPO_ROOT" && npm audit fix) ;;
    yarn) (cd "$REPO_ROOT" && (yarn npm audit --fix 2>/dev/null || true)) ;;
    bun) upgrade_warn "bun has no automatic audit fix; skipping." ;;
    *) : ;;
  esac
}

_audit_count() {
  printf '%s' "$1" | node -e '
    let s = "";
    process.stdin.on("data", d => (s += d));
    process.stdin.on("end", () => {
      try {
        const a = JSON.parse(s);
        let t = 0;
        if (a.metadata && a.metadata.vulnerabilities) {
          const v = a.metadata.vulnerabilities;
          t = (v.total != null) ? v.total : Object.values(v).reduce((x, y) => x + (typeof y === "number" ? y : 0), 0);
        } else if (a.advisories) {
          t = Object.keys(a.advisories).length;
        } else if (a.vulnerabilities) {
          t = Object.keys(a.vulnerabilities).length;
        }
        process.stdout.write(String(t));
      } catch (e) { process.stdout.write("0"); }
    });' 2>/dev/null || echo 0
}

_audit_modules() {
  printf '%s' "$1" | node -e '
    let s = "";
    process.stdin.on("data", d => (s += d));
    process.stdin.on("end", () => {
      try {
        const a = JSON.parse(s);
        const set = new Set();
        if (a.advisories) { for (const k in a.advisories) { const m = a.advisories[k].module_name; if (m) set.add(m); } }
        if (a.vulnerabilities) { for (const k in a.vulnerabilities) { set.add(k); } }
        process.stdout.write(Array.from(set).join("\n"));
      } catch (e) {}
    });' 2>/dev/null || true
}

_direct_deps() {
  local d
  for d in "${WORKSPACE_DIRS[@]}"; do
    [ -f "$d/package.json" ] || continue
    node -e '
      const fs = require("fs");
      try {
        const p = JSON.parse(fs.readFileSync(process.argv[1] + "/package.json", "utf8"));
        const all = Object.assign({}, p.dependencies, p.devDependencies, p.optionalDependencies);
        for (const k of Object.keys(all)) console.log(k);
      } catch (e) {}' "$d"
  done
}

# _diff_pkg OLD_JSON NEW_PKG_JSON: print "name<TAB>old<TAB>new" for every
# dependency whose version range changed/was added/removed between the snapshot
# and the current package.json.
_diff_pkg() {
  node -e '
    const fs = require("fs");
    const read = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return {}; } };
    const oldp = read(process.argv[1]), newp = read(process.argv[2]);
    const fields = ["dependencies", "devDependencies", "optionalDependencies"];
    const collect = p => { const o = {}; for (const f of fields) Object.assign(o, p[f] || {}); return o; };
    const a = collect(oldp), b = collect(newp);
    const out = [];
    for (const k of Object.keys(b)) { if (a[k] !== b[k]) out.push(k + "\t" + (a[k] || "(absent)") + "\t" + b[k]); }
    for (const k of Object.keys(a)) { if (!(k in b)) out.push(k + "\t" + a[k] + "\t(removed)"); }
    process.stdout.write(out.join("\n"));
  ' "$1" "$2"
}

_is_direct_dep() {
  node -e '
    const fs = require("fs");
    try {
      const p = JSON.parse(fs.readFileSync(process.argv[1] + "/package.json", "utf8"));
      const all = Object.assign({}, p.dependencies, p.devDependencies, p.optionalDependencies);
      process.exit(all[process.argv[2]] ? 0 : 1);
    } catch (e) { process.exit(1); }' "$1" "$2"
}

# --- security phase -----------------------------------------------------------
_security_phase() {
  echo ""
  upgrade_log "🔍  Checking for vulnerabilities..."
  local before_json
  before_json=$(_pm_audit_json)
  VULN_BEFORE=$(_audit_count "$before_json")
  _pm_audit 2>&1 | pr -o 4 -T || true

  upgrade_log "🔧  Applying non-breaking security fixes (${PKG_MGR} audit fix)..."
  _pm_audit_fix 2>&1 | pr -o 4 -T || true
  run_step "$PKG_MGR" install || upgrade_warn "Install after audit fix returned non-zero."

  upgrade_log "🔍  Re-checking for vulnerabilities..."
  local after_json
  after_json=$(_pm_audit_json)
  VULN_AFTER=$(_audit_count "$after_json")
  _pm_audit 2>&1 | pr -o 4 -T || true

  local vuln_mods
  vuln_mods=$(_audit_modules "$after_json")
  SEC_REMAINING="$vuln_mods"
  if [ -z "$vuln_mods" ]; then
    return 0
  fi

  # Force set = remaining-vulnerable  ∩  reverted-by-doctor  ∩  direct-dependency.
  local reverted_sorted vuln_sorted direct_sorted force
  reverted_sorted=$(printf '%s\n' $REVERTED_PKGS | grep -v '^$' | sort -u)
  vuln_sorted=$(printf '%s\n' $vuln_mods | grep -v '^$' | sort -u)
  direct_sorted=$(_direct_deps | grep -v '^$' | sort -u)

  if [ -z "$reverted_sorted" ]; then
    upgrade_warn "Remaining vulnerabilities are not in any build-breaking direct dependency; not force-upgrading."
    return 0
  fi

  force=$(comm -12 <(printf '%s\n' "$vuln_sorted") <(printf '%s\n' "$reverted_sorted"))
  force=$(comm -12 <(printf '%s\n' "$force" | grep -v '^$' | sort -u) <(printf '%s\n' "$direct_sorted"))
  force=$(printf '%s\n' "$force" | grep -v '^$')

  if [ -z "$force" ]; then
    upgrade_warn "Remaining vulnerabilities are transitive or not in a build-breaking direct dependency; not force-upgrading."
    return 0
  fi

  upgrade_warn "⚠  Force-upgrading vulnerable direct dependencies that previously broke the build (code may need fixing):"
  printf '    - %s\n' $force
  FORCED_PKGS="$force"

  local pkg d
  for pkg in $force; do
    for d in "${WORKSPACE_DIRS[@]}"; do
      if _is_direct_dep "$d" "$pkg"; then
        upgrade_log "   ↳ forcing ${pkg} to latest in $(dir_label "$d")"
        (cd "$d" && run_step ncu --upgrade --packageManager "$PKG_MGR" --filter "$pkg") || true
      fi
    done
  done
  run_step "$PKG_MGR" install || upgrade_warn "Install after forced upgrades returned non-zero."

  upgrade_log "🔍  Verifying the build after forced security upgrades..."
  SEC_VERIFY_FAILED=0
  SEC_VERIFY_LOG="$SNAPSHOT_DIR/security-verify.log"
  : > "$SEC_VERIFY_LOG"
  for d in "${WORKSPACE_DIRS[@]}"; do
    local v label
    v=$(detect_verify_cmd "$d")
    [ -z "$v" ] && continue
    label=$(dir_label "$d")
    echo "=== verify: ${label} (${v}) ===" >> "$SEC_VERIFY_LOG"
    (cd "$d" && eval "$v") >> "$SEC_VERIFY_LOG" 2>&1 || SEC_VERIFY_FAILED=1
  done

  if [ "$SEC_VERIFY_FAILED" -eq 1 ]; then
    upgrade_err "❌  The build is broken after forced security upgrades. The fixed versions are LEFT IN PLACE so the code can be updated for compatibility."
    upgrade_err "    Forced packages: $(printf '%s ' $force)"
    upgrade_err "    Full verify output: ${SEC_VERIFY_LOG}"
    echo ""
    tail -n 80 "$SEC_VERIFY_LOG" | pr -o 4 -T || true
  else
    upgrade_ok "✔  The build still passes after the forced security upgrades."
  fi
}

# --- summary ------------------------------------------------------------------
_print_summary() {
  echo ""
  echo "================================"
  echo "📋  Upgrade summary"
  echo "================================"

  # Packages actually upgraded: compare each snapshot package.json to the current
  # one (captures doctor-kept upgrades and forced security upgrades alike).
  upgrade_log "Packages upgraded (package.json changes):"
  local any=0 idx=0 d snap changes
  if [ -f "$SNAPSHOT_DIR/dirs.txt" ]; then
    while IFS= read -r d; do
      snap="$SNAPSHOT_DIR/package.${idx}.json"
      idx=$((idx + 1))
      [ -f "$snap" ] || continue
      [ -f "$d/package.json" ] || continue
      changes=$(_diff_pkg "$snap" "$d/package.json")
      if [ -n "$changes" ]; then
        any=1
        echo "    [$(dir_label "$d")]"
        printf '%s\n' "$changes" | while IFS=$'\t' read -r name oldv newv; do
          [ -n "$name" ] && printf '      - %s: %s -> %s\n' "$name" "$oldv" "$newv"
        done
      fi
    done < "$SNAPSHOT_DIR/dirs.txt"
  fi
  if [ "$any" -eq 0 ]; then
    upgrade_ok "    None - no package.json versions changed."
  fi

  echo ""
  local reverted
  reverted=$(printf '%s\n' $REVERTED_PKGS | grep -v '^$' | sort -u)
  if [ -n "$reverted" ]; then
    upgrade_warn "Build-breaking upgrades skipped (kept at the highest version that passes verification):"
    printf '    - %s\n' $reverted
  else
    upgrade_ok "No build-breaking upgrades: every available upgrade passed verification."
  fi

  echo ""
  upgrade_log "Vulnerabilities: ${VULN_BEFORE:-?} before -> ${VULN_AFTER:-?} after audit fix."
  if [ -n "${FORCED_PKGS:-}" ]; then
    upgrade_warn "Security: force-upgraded these direct deps - review the code for compatibility:"
    printf '    - %s\n' $FORCED_PKGS
    if [ "${SEC_VERIFY_FAILED:-0}" -eq 1 ]; then
      upgrade_err "    Build currently FAILS - see ${SEC_VERIFY_LOG}"
    fi
  fi
  local remaining
  remaining=$(printf '%s\n' ${SEC_REMAINING:-} | grep -v '^$' | sort -u)
  if [ -n "$remaining" ]; then
    upgrade_warn "Vulnerabilities still present (transitive or unresolved):"
    printf '    - %s\n' $remaining
  fi

  echo ""
  upgrade_log "Manifest snapshot (restore if needed): ${SNAPSHOT_DIR}"
  echo ""
}

# --- main ---------------------------------------------------------------------
_upgrade_dependencies() {
  local orig_pwd=$PWD
  cd "$REPO_ROOT" || return 1

  local PKG_MGR ESLINT_REJECT SNAPSHOT_DIR
  local REVERTED_PKGS="" FORCED_PKGS="" SEC_REMAINING="" SEC_VERIFY_LOG=""
  local VULN_BEFORE="" VULN_AFTER="" SEC_VERIFY_FAILED=0
  local -a WORKSPACE_DIRS=()

  echo ""
  echo "--------------------------------"
  echo "🔄 Upgrading dependencies "
  echo "--------------------------------"

  PKG_MGR=$(detect_pkg_mgr)
  upgrade_log "📦  Detected package manager: ${PKG_MGR}"

  _run_tools_phase
  cd "$REPO_ROOT" || return 1

  local dirs line
  dirs=$(detect_workspace_dirs)
  while IFS= read -r line; do
    [ -n "$line" ] && WORKSPACE_DIRS+=("$line")
  done <<< "$dirs"
  upgrade_log "📦  Workspace packages to upgrade:"
  printf '    - %s\n' "${WORKSPACE_DIRS[@]}"

  _snapshot_manifests
  _compute_eslint_reject

  local d
  for d in "${WORKSPACE_DIRS[@]}"; do
    _doctor_upgrade_dir "$d"
  done

  upgrade_log "⬆️  Reconciling the workspace lockfile (${PKG_MGR} install)..."
  run_step "$PKG_MGR" install || upgrade_warn "Reconciling install returned non-zero."

  upgrade_log "🌐  Updating browserslist database..."
  run_step npx --yes update-browserslist-db@latest || true

  upgrade_ok "✅  Build-safe dependency upgrade completed"

  _security_phase
  _print_summary

  cd "$orig_pwd" 2>/dev/null || true

  if [ "${SEC_VERIFY_FAILED:-0}" -eq 1 ]; then
    return 1
  fi
  return 0
}

if [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  _upgrade_dependencies "$@"
  return $?
fi

_upgrade_dependencies "$@"
exit $?
