#!/usr/bin/env bash
# Sourced by upgrade-tools.sh after `nvm install --lts`.
# Resolves the Node semver (no leading v) into node_ver. Do not match npm versions
# in install output (e.g. "(npm v11.11.0)").

nvm_resolve_lts_node_version() {
  local install_out=$1
  local nvm_list cur

  node_ver=

  if printf '%s\n' "$install_out" | grep -qE 'nvm use [0-9]+\.[0-9]+\.[0-9]+'; then
    node_ver=$(printf '%s\n' "$install_out" | grep -oE 'nvm use [0-9]+\.[0-9]+\.[0-9]+' | head -1 | sed 's/nvm use //')
    [ -n "$node_ver" ] && return 0
  fi

  if printf '%s\n' "$install_out" | grep -qE 'Now using node v[0-9]+\.[0-9]+\.[0-9]+'; then
    node_ver=$(printf '%s\n' "$install_out" | grep -oE 'Now using node v[0-9]+\.[0-9]+\.[0-9]+' | sed 's/Now using node v//' | head -1)
    [ -n "$node_ver" ] && return 0
  fi

  nvm_list=$(nvm list 2>&1)

  # e.g. default -> lts/* (-> v24.14.1)
  if printf '%s\n' "$nvm_list" | grep -q 'default ->'; then
    node_ver=$(printf '%s\n' "$nvm_list" | grep 'default ->' | grep -oE '\(-> v[0-9]+\.[0-9]+\.[0-9]+\)' | head -1 | sed 's/(-> v//;s/)//')
    [ -n "$node_ver" ] && return 0
  fi

  # Current pointer line: "->     v24.14.1"
  if printf '%s\n' "$nvm_list" | grep -qE '^[[:space:]]*->[[:space:]]+v[0-9]'; then
    node_ver=$(printf '%s\n' "$nvm_list" | grep -E '^[[:space:]]*->[[:space:]]+v[0-9]' | head -1 | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | sed 's/^v//' | head -1)
    [ -n "$node_ver" ] && return 0
  fi

  # nvm-windows style
  if printf '%s\n' "$nvm_list" | grep -q '[*]'; then
    node_ver=$(printf '%s\n' "$nvm_list" | grep '[*]' | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    [ -n "$node_ver" ] && return 0
  fi

  cur=$(nvm current 2>/dev/null || true)
  if [ -n "$cur" ] && [ "$cur" != "system" ] && [ "$cur" != "none" ]; then
    node_ver=${cur#v}
    [ -n "$node_ver" ] && return 0
  fi

  return 1
}
