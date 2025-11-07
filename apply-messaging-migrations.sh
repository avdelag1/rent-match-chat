#!/bin/bash

# Script to apply messaging schema migrations to fix client/owner messaging
# Run this script to apply the necessary database migrations

echo "=================================================="
echo "Applying Messaging Schema Migrations"
echo "=================================================="
echo ""

# Check if SUPABASE_DB_URL is set
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL environment variable is not set"
  echo ""
  echo "To run this script, you need to set your Supabase database URL:"
  echo "export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
  echo ""
  echo "You can find this in your Supabase project settings under Database > Connection string > URI"
  exit 1
fi

echo "✅ Database URL configured"
echo ""

# Apply migrations in order
echo "📦 Applying migration 1/3: Fix conversations schema..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251108000000_fix_conversations_schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Conversations schema migration applied successfully"
else
  echo "❌ Failed to apply conversations schema migration"
  exit 1
fi

echo ""
echo "📦 Applying migration 2/3: Fix conversation messages schema..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251108000001_fix_conversation_messages_schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Conversation messages schema migration applied successfully"
else
  echo "❌ Failed to apply conversation messages schema migration"
  exit 1
fi

echo ""
echo "📦 Applying migration 3/3: Cleanup old participant columns..."
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251108000002_cleanup_old_participant_columns.sql

if [ $? -eq 0 ]; then
  echo "✅ Cleanup migration applied successfully"
else
  echo "❌ Failed to apply cleanup migration"
  exit 1
fi

echo ""
echo "=================================================="
echo "✅ All messaging migrations applied successfully!"
echo "=================================================="
echo ""
echo "Your messaging system should now work correctly."
echo "Please test the messaging functionality to verify."
