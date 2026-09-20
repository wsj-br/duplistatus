#!/usr/bin/env bash
#
# Switch this repo between a sibling local checkout of ai-i18n-tools and the
# published npm package. Prints the resolved version afterwards.
#
# Usage:
#   ./scripts/link-ai-i18n-tools.sh --local
#   ./scripts/link-ai-i18n-tools.sh --remote
#   pnpm i18n:tools --local
#   pnpm i18n:tools --remote
#
# Do not commit the `link:` specifier — it only works when the sibling checkout
# exists on the machine.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PACKAGE_JSON="$REPO_ROOT/package.json"
DEFAULT_LOCAL_DIR="$(cd "$REPO_ROOT/.." && pwd)/ai-i18n-tools"

MODE=""
LOCAL_DIR="${AI_I18N_TOOLS_PATH:-$DEFAULT_LOCAL_DIR}"

usage() {
  cat <<EOF
Usage: $(basename "$0") --local | --remote [--path DIR]

Switch the ai-i18n-tools dependency and print the resolved version.

  --local          Link the sibling checkout (CLI + runtime).
  --remote         Install the latest published package from npm.
  --path DIR       Local checkout for --local (default: ../ai-i18n-tools).
                   Override with AI_I18N_TOOLS_PATH.
  -h, --help       Show this help.

Examples:
  $(basename "$0") --local
  $(basename "$0") --remote
  $(basename "$0") --local --path /home/wsj/src/ai-i18n-tools
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

read_json_string() {
  local file="$1"
  local js_expr="$2"
  FILE="$file" EXPR="$js_expr" node --input-type=module -e '
    import fs from "node:fs";
    const pkg = JSON.parse(fs.readFileSync(process.env.FILE, "utf8"));
    const value = Function("pkg", "return " + process.env.EXPR)(pkg);
    if (value == null || value === "") process.exit(2);
    process.stdout.write(String(value));
  '
}

current_spec() {
  read_json_string "$PACKAGE_JSON" 'pkg.dependencies["ai-i18n-tools"]' \
    || die "package.json has no dependencies.ai-i18n-tools"
}

set_dep_spec() {
  local spec="$1"
  SPEC="$spec" FILE="$PACKAGE_JSON" node --input-type=module -e '
    import fs from "node:fs";
    const file = process.env.FILE;
    const spec = process.env.SPEC;
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!pkg.dependencies || !("ai-i18n-tools" in pkg.dependencies)) {
      console.error("package.json has no dependencies.ai-i18n-tools");
      process.exit(1);
    }
    pkg.dependencies["ai-i18n-tools"] = spec;
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
  '
}

installed_version() {
  local pkg="$REPO_ROOT/node_modules/ai-i18n-tools/package.json"
  [[ -f "$pkg" ]] || return 1
  read_json_string "$pkg" 'pkg.version'
}

print_version() {
  local source_label="$1"
  local spec
  local version
  spec="$(current_spec)"
  version="$(installed_version)" || version="(not installed)"
  echo "ai-i18n-tools ${version} (${source_label})"
  echo "spec: ${spec}"
  if [[ -x "$REPO_ROOT/node_modules/.bin/ai-i18n-tools" ]]; then
    echo "cli:  $(pnpm -C "$REPO_ROOT" exec ai-i18n-tools -V 2>/dev/null || true)"
  fi
}

relative_to_repo() {
  local target="$1"
  if command -v realpath >/dev/null 2>&1; then
    realpath --relative-to="$REPO_ROOT" "$target"
    return
  fi
  python3 -c 'import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))' \
    "$target" "$REPO_ROOT"
}

ensure_local_built() {
  local dir="$1"
  [[ -f "$dir/package.json" ]] || die "no package.json in $dir"
  local name
  name="$(read_json_string "$dir/package.json" 'pkg.name')" \
    || die "could not read package name from $dir/package.json"
  [[ "$name" == "ai-i18n-tools" ]] || die "$dir is not ai-i18n-tools (name=$name)"

  if [[ ! -f "$dir/dist/cli/index.js" ]]; then
    echo "Local dist/ is missing; building ai-i18n-tools in $dir ..."
    (cd "$dir" && pnpm install && pnpm build)
  fi
}

install_from_root() {
  (cd "$REPO_ROOT" && pnpm install)
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --local)
      [[ -z "$MODE" ]] || die "specify only one of --local or --remote"
      MODE="local"
      shift
      ;;
    --remote)
      [[ -z "$MODE" ]] || die "specify only one of --local or --remote"
      MODE="remote"
      shift
      ;;
    --path)
      [[ $# -ge 2 ]] || die "--path requires a directory"
      LOCAL_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      die "unknown argument: $1"
      ;;
  esac
done

[[ -n "$MODE" ]] || {
  usage >&2
  die "specify --local or --remote"
}

[[ -f "$PACKAGE_JSON" ]] || die "package.json not found at $PACKAGE_JSON"

case "$MODE" in
  local)
    [[ -d "$LOCAL_DIR" ]] || die "local checkout not found: $LOCAL_DIR"
    LOCAL_DIR="$(cd "$LOCAL_DIR" && pwd)"
    ensure_local_built "$LOCAL_DIR"
    rel="$(relative_to_repo "$LOCAL_DIR")"
    target_spec="link:${rel}"
    current="$(current_spec)"
    if [[ "$current" == "$target_spec" ]]; then
      echo "Already using local ai-i18n-tools (${target_spec})"
    else
      echo "Linking ai-i18n-tools -> ${LOCAL_DIR}"
      set_dep_spec "$target_spec"
      install_from_root
    fi
    print_version "local ${LOCAL_DIR}"
    ;;
  remote)
    echo "Resolving latest ai-i18n-tools on npm ..."
    latest="$(pnpm view ai-i18n-tools version)" \
      || die "could not read latest version from npm"
    [[ -n "$latest" ]] || die "npm returned an empty version"
    target_spec="^${latest}"
    current="$(current_spec)"
    installed="$(installed_version || true)"
    if [[ "$current" == "$target_spec" && "$installed" == "$latest" ]]; then
      echo "Already using npm ai-i18n-tools ${latest}"
    else
      echo "Installing ai-i18n-tools@${latest} from npm"
      set_dep_spec "$target_spec"
      install_from_root
    fi
    print_version "npm"
    ;;
esac
