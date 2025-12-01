#!/bin/bash

#
# Test database migrations from old versions to current version 4.0
#
# This script tests migrations for each version by:
# 1. Creating a temporary copy of the test database
# 2. Running the migration process
# 3. Validating the migrated database structure
# 4. Cleaning up temporary files
#

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATION_TEST_DATA_DIR="$ROOT_DIR/scripts/migration_test_data"
TEMP_DIR="$MIGRATION_TEST_DATA_DIR/.tmp"

# Versions to test
VERSIONS="v0.4.0 v0.5.0 v0.6.1 0.7.27 0.8.21"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Arrays to track results
PASSED_VERSIONS=()
FAILED_VERSIONS=()

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Cleanup function
cleanup() {
  echo ""
  echo "Cleaning up temporary files..."
  rm -rf "$TEMP_DIR"
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo "=========================================="
echo "Database Migration Test Suite"
echo "=========================================="
echo ""
echo "Testing migrations from old versions to version 4.0"
echo "Test data directory: $MIGRATION_TEST_DATA_DIR"
echo "Temporary directory: $TEMP_DIR"
echo ""

# Check if test data directory exists
if [ ! -d "$MIGRATION_TEST_DATA_DIR" ]; then
  echo -e "${RED}Error: Test data directory not found: $MIGRATION_TEST_DATA_DIR${NC}"
  exit 1
fi

# Test each version
for VERSION in $VERSIONS; do
  echo "----------------------------------------"
  echo "Testing version: $VERSION"
  echo "----------------------------------------"
  
  # Construct source file path
  SOURCE_FILE="$MIGRATION_TEST_DATA_DIR/backups_$VERSION.db"
  
  # Check if source file exists
  if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${YELLOW}⚠️  Warning: Source file not found: $SOURCE_FILE${NC}"
    echo -e "${RED}❌ Skipping version $VERSION${NC}"
    FAILED_VERSIONS+=("$VERSION (file not found)")
    echo ""
    continue
  fi
  
  # Create temporary copy
  TEMP_FILE="$TEMP_DIR/backups_${VERSION}_test.db"
  echo "  Copying database file to temporary location..."
  cp "$SOURCE_FILE" "$TEMP_FILE"
  
  # Also copy WAL and SHM files if they exist
  if [ -f "${SOURCE_FILE}-wal" ]; then
    cp "${SOURCE_FILE}-wal" "${TEMP_FILE}-wal"
  fi
  if [ -f "${SOURCE_FILE}-shm" ]; then
    cp "${SOURCE_FILE}-shm" "${TEMP_FILE}-shm"
  fi
  
  # Run migration test
  echo "  Running migration test..."
  if pnpm tsx "$SCRIPT_DIR/test-migration.ts" "$TEMP_FILE" > /tmp/migration_test_${VERSION}.log 2>&1; then
    echo -e "${GREEN}✅ Version $VERSION: Migration test PASSED${NC}"
    PASSED_VERSIONS+=("$VERSION")
  else
    echo -e "${RED}❌ Version $VERSION: Migration test FAILED${NC}"
    echo "  Error output:"
    cat /tmp/migration_test_${VERSION}.log | sed 's/^/    /'
    FAILED_VERSIONS+=("$VERSION")
  fi
  
  # Clean up temporary file
  rm -f "$TEMP_FILE" "${TEMP_FILE}-wal" "${TEMP_FILE}-shm"
  
  echo ""
done

# Print summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""

if [ ${#PASSED_VERSIONS[@]} -gt 0 ]; then
  echo -e "${GREEN}✅ Passed versions (${#PASSED_VERSIONS[@]}):${NC}"
  for version in "${PASSED_VERSIONS[@]}"; do
    echo -e "  ${GREEN}✓${NC} $version"
  done
  echo ""
fi

if [ ${#FAILED_VERSIONS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Failed versions (${#FAILED_VERSIONS[@]}):${NC}"
  for version in "${FAILED_VERSIONS[@]}"; do
    echo -e "  ${RED}✗${NC} $version"
  done
  echo ""
fi

# Exit with appropriate code
if [ ${#FAILED_VERSIONS[@]} -eq 0 ]; then
  echo -e "${GREEN}All migration tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some migration tests failed.${NC}"
  exit 1
fi

