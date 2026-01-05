#!/bin/bash
#
# compare-versions.sh: Compare versions between development environment and Docker container
#

set -euo pipefail

# Symbols
CHECKMARK="✅"
CROSS="❌"
SEARCH="🔍"

# Container name
CONTAINER_NAME="duplistatus"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==================================================="
echo "  duplistatus - Version Comparison: Dev vs Docker"
echo "==================================================="
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Error: Container '${CONTAINER_NAME}' is not running"
    exit 1
fi

# Function to extract version from docker logs
extract_docker_version() {
    local pattern="$1"
    local result
    # Extract version from log lines like: [Entrypoint] SQLite version: 3.45.1
    # or: [Entrypoint] 01/01/2024 12:00:00 UTC SQLite version: 3.45.1
    result=$(docker logs "$CONTAINER_NAME" 2>&1 | grep -E "\[Entrypoint\].*${pattern}" | head -1 | sed -E "s/.*${pattern}[^:]*:[[:space:]]*(.+)/\1/" | tr -d '\r' | xargs)
    if [ -z "$result" ] || [ "$result" = "" ]; then
        echo "N/A"
    else
        echo "$result"
    fi
}

# Function to extract SQLite version number only (e.g., "3.51.1" from "3.51.1 2025-11-28...")
extract_sqlite_version() {
    local version_string="$1"
    echo "$version_string" | awk '{print $1}' | xargs
}

# Function to extract major version number (first digit before the first dot)
extract_major_version() {
    local version_string="$1"
    echo "$version_string" | cut -d. -f1 | xargs
}

# Function to get package.json version (works without jq)
get_package_version() {
    local pkg_file="$1"
    if command -v jq >/dev/null 2>&1; then
        jq -r '.version' "$pkg_file" 2>/dev/null || echo "N/A"
    else
        grep -E '"version"' "$pkg_file" 2>/dev/null | head -1 | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/' || echo "N/A"
    fi
}

# Get development environment versions
echo "Collecting development environment versions..."
DEV_SQLITE_VERSION=$(sqlite3 --version 2>/dev/null | awk '{print $1}' || echo "N/A")
DEV_NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' || echo "N/A")
DEV_NPM_VERSION=$(npm -v 2>/dev/null || echo "N/A")
DEV_DUPLISTATUS_VERSION=$(get_package_version "$PROJECT_ROOT/package.json")

# Get Docker container versions from logs
echo "Collecting Docker container versions from logs..."
DOCKER_SQLITE_VERSION_RAW=$(extract_docker_version "SQLite version")
DOCKER_SQLITE_VERSION=$(extract_sqlite_version "$DOCKER_SQLITE_VERSION_RAW")
DOCKER_NODE_VERSION=$(extract_docker_version "Node version" | sed 's/v//')
DOCKER_NPM_VERSION=$(extract_docker_version "npm version")
DOCKER_DUPLISTATUS_VERSION=$(extract_docker_version "Duplistatus Version")

# Function to compare and display versions
compare_versions() {
    local label="$1"
    local dev_version="$2"
    local docker_version="$3"
    local major_only="${4:-false}"
    local match=""
    
    # Normalize versions for comparison (remove extra whitespace)
    local dev_display="$dev_version"
    local docker_display="$docker_version"
    dev_version=$(echo "$dev_version" | xargs)
    docker_version=$(echo "$docker_version" | xargs)
    
    # For major-only comparison, extract and compare only the major version
    if [ "$major_only" = "true" ]; then
        local dev_major=$(extract_major_version "$dev_version")
        local docker_major=$(extract_major_version "$docker_version")
        if [ "$dev_major" = "$docker_major" ]; then
            if [ "$dev_version" = "$docker_version" ]; then
                match="$CHECKMARK"
            else
                match="$CHECKMARK (major)"
            fi
        else
            match="$CROSS"
        fi
    else
        if [ "$dev_version" = "$docker_version" ]; then
            match="$CHECKMARK"
        else
            match="$CROSS"
        fi
    fi
    
    printf "│ %-23s │ %-28s │ %-28s │ %-13s │\n" "$label" "$dev_display" "$docker_display" "$match"
}

# Display comparison table
echo ""
echo "┌─────────────────────────┬──────────────────────────────┬──────────────────────────────┬──────────────┐"
echo "│ Component               │ Development                  │ Docker                       │   Match      │"
echo "├─────────────────────────┼──────────────────────────────┼──────────────────────────────┼──────────────┤"
compare_versions "SQLite" "$DEV_SQLITE_VERSION" "$DOCKER_SQLITE_VERSION" "true"
compare_versions "Node" "$DEV_NODE_VERSION" "$DOCKER_NODE_VERSION"
compare_versions "npm" "$DEV_NPM_VERSION" "$DOCKER_NPM_VERSION"
compare_versions "Duplistatus" "$DEV_DUPLISTATUS_VERSION" "$DOCKER_DUPLISTATUS_VERSION"
echo "└─────────────────────────┴──────────────────────────────┴──────────────────────────────┴──────────────┘"
echo ""

# Summary
echo "Summary:"
TOTAL=0
MISMATCHES=0
MISMATCHED_COMPONENTS=()
SQLITE_MAJOR_MATCH=false

check_mismatch() {
    local component="$1"
    local dev="$2"
    local docker="$3"
    local major_only="${4:-false}"
    dev=$(echo "$dev" | xargs)
    docker=$(echo "$docker" | xargs)
    TOTAL=$((TOTAL + 1))
    
    # For major-only comparison, extract and compare only the major version
    if [ "$major_only" = "true" ]; then
        local dev_major=$(extract_major_version "$dev")
        local docker_major=$(extract_major_version "$docker")
        if [ "$dev_major" != "$docker_major" ]; then
            MISMATCHES=$((MISMATCHES + 1))
            MISMATCHED_COMPONENTS+=("$component")
        elif [ "$dev" != "$docker" ]; then
            # Major versions match but full versions don't - track this for SQLite
            if [ "$component" = "SQLite" ]; then
                SQLITE_MAJOR_MATCH=true
            fi
        fi
    else
        if [ "$dev" != "$docker" ]; then
            MISMATCHES=$((MISMATCHES + 1))
            MISMATCHED_COMPONENTS+=("$component")
        fi
    fi
}

check_mismatch "SQLite" "$DEV_SQLITE_VERSION" "$DOCKER_SQLITE_VERSION" "true"
check_mismatch "Node" "$DEV_NODE_VERSION" "$DOCKER_NODE_VERSION"
check_mismatch "npm" "$DEV_NPM_VERSION" "$DOCKER_NPM_VERSION"
check_mismatch "Duplistatus" "$DEV_DUPLISTATUS_VERSION" "$DOCKER_DUPLISTATUS_VERSION"

if [ $MISMATCHES -eq 0 ]; then
    echo "${CHECKMARK} All versions match!"
    if [ "$SQLITE_MAJOR_MATCH" = "true" ]; then
        echo "${SEARCH} SQLite versions are the same major version (${DEV_SQLITE_VERSION} vs ${DOCKER_SQLITE_VERSION})"
    fi
    exit 0
else
    echo "${CROSS} Found $MISMATCHES mismatch(es) out of $TOTAL components"
    if [ ${#MISMATCHED_COMPONENTS[@]} -gt 0 ]; then
        echo "Non-matching components: ${MISMATCHED_COMPONENTS[*]}"
    fi
    if [ "$SQLITE_MAJOR_MATCH" = "true" ]; then
        echo "${SEARCH} SQLite versions are the same major version (${DEV_SQLITE_VERSION} vs ${DOCKER_SQLITE_VERSION})"
    fi
    echo ""
    exit 1
fi
echo ""

