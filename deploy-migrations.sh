#!/bin/bash

# Supabase Migration Deployment Script
# This script deploys migrations to Supabase using curl

set -e

# Configuration
SUPABASE_URL="https://vplgtcguxujxwrgguxqq.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDI5MDIsImV4cCI6MjA2MzU3ODkwMn0.-TzSQ-nDho4J6TftVF4RNjbhr5cKbknQxxUT-AaSIJU"

echo "========================================="
echo "🚀 Supabase Migration Deployment"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run SQL query
run_sql() {
  local step=$1
  local sql_file=$2

  echo -e "${YELLOW}Step $step: Running $sql_file${NC}"

  # Read SQL file
  local sql=$(cat "$sql_file")

  # Create JSON payload
  local payload=$(cat <<EOF
{
  "query": $(echo "$sql" | jq -Rs '.')
}
EOF
)

  # Execute query via REST API
  local response=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload" 2>&1)

  echo "Response: $response"
  echo ""

  # Check for errors
  if echo "$response" | grep -q "error"; then
    echo -e "${RED}❌ Error in step $step${NC}"
    return 1
  else
    echo -e "${GREEN}✅ Step $step completed${NC}"
    echo ""
    sleep 2
    return 0
  fi
}

# Run migrations
echo "Starting migration deployment..."
echo ""

# Check if files exist
if [ ! -f "SUPABASE_MIGRATION_STEP1.sql" ]; then
  echo -e "${RED}❌ SUPABASE_MIGRATION_STEP1.sql not found${NC}"
  exit 1
fi

if [ ! -f "SUPABASE_MIGRATION_STEP2.sql" ]; then
  echo -e "${RED}❌ SUPABASE_MIGRATION_STEP2.sql not found${NC}"
  exit 1
fi

if [ ! -f "SUPABASE_MIGRATION_STEP3.sql" ]; then
  echo -e "${RED}❌ SUPABASE_MIGRATION_STEP3.sql not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓ All migration files found${NC}"
echo ""

# Run each migration
run_sql "1" "SUPABASE_MIGRATION_STEP1.sql" || exit 1
run_sql "2" "SUPABASE_MIGRATION_STEP2.sql" || exit 1
run_sql "3" "SUPABASE_MIGRATION_STEP3.sql" || exit 1

echo "========================================="
echo -e "${GREEN}✅ All migrations deployed!${NC}"
echo "========================================="
echo ""
echo "Next: Verify the migrations worked..."
echo ""
