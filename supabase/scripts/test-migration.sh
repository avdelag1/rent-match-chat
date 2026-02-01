#!/bin/bash

# Migration Testing Script
#
# This script tests migration files for common issues before deployment.
# It checks for:
# - SQL syntax errors
# - Missing idempotency (IF EXISTS/IF NOT EXISTS)
# - Column name consistency with TypeScript types
# - Common constraint issues
#
# Usage: ./supabase/scripts/test-migration.sh [migration_file]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print functions
print_header() {
  echo ""
  echo -e "${BLUE}============================================================${NC}"
  echo -e "${BOLD}  $1${NC}"
  echo -e "${BLUE}============================================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Check if migration file is provided
MIGRATION_FILE=${1:-""}
MIGRATIONS_DIR="supabase/migrations"

if [ -n "$MIGRATION_FILE" ]; then
  if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    exit 1
  fi
  FILES_TO_TEST=("$MIGRATION_FILE")
else
  # Test all migration files
  FILES_TO_TEST=($(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort))
fi

print_header "Migration Testing"
echo "Testing ${#FILES_TO_TEST[@]} migration file(s)..."
echo ""

# Counters
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TOTAL_TESTS=0

# Test each migration file
for file in "${FILES_TO_TEST[@]}"; do
  filename=$(basename "$file")
  print_info "Testing: $filename"

  # Test 1: Check for SQL syntax errors (basic)
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -q ";\s*$" "$file" || grep -q "END\s*\$\$" "$file"; then
    print_success "SQL syntax appears valid"
  else
    print_warning "No semicolons or DO blocks found - might be incomplete"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
  fi

  # Test 2: Check for idempotency in CREATE TABLE statements
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -qi "CREATE TABLE" "$file"; then
    if grep -qi "CREATE TABLE IF NOT EXISTS" "$file"; then
      print_success "CREATE TABLE uses IF NOT EXISTS"
    else
      print_error "CREATE TABLE without IF NOT EXISTS - not idempotent!"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
  fi

  # Test 3: Check for idempotency in ALTER TABLE ADD COLUMN
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -qi "ADD COLUMN" "$file"; then
    if grep -qi "ADD COLUMN IF NOT EXISTS" "$file"; then
      print_success "ADD COLUMN uses IF NOT EXISTS"
    else
      print_warning "ADD COLUMN without IF NOT EXISTS - might fail on re-run"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi
  fi

  # Test 4: Check for problematic column name abbreviations
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  PROBLEMATIC_NAMES=("beds" "baths" "desc" "addr" "lat" "lng" "lon" "img" "imgs" "pic" "pics")
  FOUND_ISSUES=()

  for name in "${PROBLEMATIC_NAMES[@]}"; do
    if grep -qiE "(ADD COLUMN|CREATE TABLE.*$name\s)" "$file"; then
      FOUND_ISSUES+=("$name")
    fi
  done

  if [ ${#FOUND_ISSUES[@]} -gt 0 ]; then
    print_warning "Found abbreviated column names: ${FOUND_ISSUES[*]} - may cause type mismatches"
    print_info "  Consider using full names: beds→bedrooms, baths→bathrooms, etc."
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
  else
    print_success "No problematic column abbreviations found"
  fi

  # Test 5: Check for case-sensitive string comparisons
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -qE "CHECK.*IN\s*\(" "$file"; then
    if grep -qE "LOWER\(|UPPER\(" "$file"; then
      print_success "CHECK constraints use case-insensitive comparison"
    else
      print_warning "CHECK constraints might be case-sensitive"
      print_info "  Consider using LOWER() in CHECK constraints"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi
  fi

  # Test 6: Check for RLS enablement on new tables
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -qi "CREATE TABLE" "$file"; then
    if grep -qi "ENABLE ROW LEVEL SECURITY" "$file"; then
      print_success "Row Level Security is enabled"
    else
      print_warning "New table created without RLS - might be intentional"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi
  fi

  # Test 7: Check for indexes on foreign keys
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -qi "REFERENCES" "$file"; then
    if grep -qi "CREATE INDEX" "$file"; then
      print_success "Indexes found (might be for foreign keys)"
    else
      print_warning "Foreign keys found but no indexes - might impact performance"
      TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi
  fi

  # Test 8: Check for NOT NULL constraints without defaults
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  if grep -qE "NOT NULL" "$file" && ! grep -qE "DEFAULT" "$file"; then
    if grep -qi "ALTER TABLE.*ADD COLUMN" "$file"; then
      print_error "Adding NOT NULL column without DEFAULT - will fail on existing rows!"
      TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
  fi

  echo ""
done

# Run Node.js validation script if available
print_header "Column Name Validation"
if [ -f "supabase/scripts/validate-migration.js" ]; then
  print_info "Running comprehensive validation..."
  if node supabase/scripts/validate-migration.js; then
    print_success "Column name validation passed"
  else
    print_error "Column name validation failed"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
  fi
else
  print_warning "validate-migration.js not found - skipping detailed validation"
fi

# Summary
print_header "Test Summary"
echo "Files tested: ${#FILES_TO_TEST[@]}"
echo "Total tests run: $TOTAL_TESTS"
echo ""

if [ $TOTAL_ERRORS -gt 0 ]; then
  print_error "Found $TOTAL_ERRORS error(s)"
fi

if [ $TOTAL_WARNINGS -gt 0 ]; then
  print_warning "Found $TOTAL_WARNINGS warning(s)"
fi

if [ $TOTAL_ERRORS -eq 0 ] && [ $TOTAL_WARNINGS -eq 0 ]; then
  print_success "All tests passed!"
  echo ""
  print_info "Migration files look good! You can safely deploy."
  exit 0
elif [ $TOTAL_ERRORS -eq 0 ]; then
  print_warning "Tests passed with warnings"
  echo ""
  print_info "Review warnings above. You can deploy but might want to fix warnings first."
  exit 0
else
  print_error "Tests failed!"
  echo ""
  print_info "Fix errors above before deploying."
  exit 1
fi
