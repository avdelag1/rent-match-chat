#!/bin/bash

# Script to automatically apply messaging schema fixes
# This script will help apply the database migrations needed to fix messaging errors

set -e  # Exit on any error

echo "🔧 Rent Match Chat - Messaging Fix Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo "✓ Project root directory confirmed"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
    echo -e "${GREEN}✓ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✓ Supabase CLI already installed${NC}"
fi

echo ""
echo "Next steps:"
echo "1. Login to Supabase:"
echo "   ${YELLOW}supabase login${NC}"
echo ""
echo "2. Link your project (get your project ref from Supabase dashboard):"
echo "   ${YELLOW}supabase link --project-ref your-project-ref${NC}"
echo ""
echo "3. Push the migrations to your database:"
echo "   ${YELLOW}supabase db push${NC}"
echo ""
echo "Or manually apply migrations via Supabase SQL Editor:"
echo "- supabase/migrations/20251108000000_fix_conversations_schema.sql"
echo "- supabase/migrations/20251108000001_fix_conversation_messages_schema.sql"
echo "- supabase/migrations/20251108000003_fix_message_triggers_and_policies.sql"
echo ""
echo "After applying migrations:"
echo "1. Rebuild the app:"
echo "   ${YELLOW}npm run build${NC}"
echo ""
echo "2. Sync with Capacitor (for mobile):"
echo "   ${YELLOW}npx cap sync${NC}"
echo ""
echo "3. Test messaging functionality in the app"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
