#!/usr/bin/env node

/**
 * Helper script to apply the comprehensive RLS fix for page access
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key_here node apply-access-fix.js
 *
 * Or if you have the key in .env:
 *   node apply-access-fix.js
 */

const fs = require('fs');
const path = require('path');

// Try to load from .env if available
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, that's ok
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  if (!SUPABASE_URL) console.error('   - VITE_SUPABASE_URL or SUPABASE_URL');
  if (!SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nUsage:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key node apply-access-fix.js');
  process.exit(1);
}

async function applyMigration() {
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260130_fix_all_app_access_blockers.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🔄 Applying comprehensive RLS fix...');
  console.log('📍 URL:', SUPABASE_URL);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative approach using the SQL REST endpoint
      const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql })
      });

      if (!altResponse.ok) {
        const error = await altResponse.text();
        throw new Error(`HTTP ${altResponse.status}: ${error}`);
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📋 What was fixed:');
    console.log('   ✓ Profile creation and editing');
    console.log('   ✓ Profile browsing for matching');
    console.log('   ✓ User role detection');
    console.log('   ✓ Client/Owner profile access');
    console.log('   ✓ Listings management');
    console.log('   ✓ Conversations and messages');
    console.log('   ✓ Notifications');
    console.log('   ✓ Likes and matches');
    console.log('   ✓ Saved searches');
    console.log('   ✓ Subscriptions');
    console.log('\n🎉 All pages should now be accessible!');
    console.log('\nNext steps:');
    console.log('   1. Test login and navigation');
    console.log('   2. Check that all dashboard pages load');
    console.log('   3. Verify browsing and matching works');

  } catch (error) {
    console.error('❌ Failed to apply migration:', error.message);
    console.error('\n💡 Alternative: Apply manually via Supabase Dashboard:');
    console.error('   1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.error('   2. Copy the contents of:');
    console.error('      supabase/migrations/20260130_fix_all_app_access_blockers.sql');
    console.error('   3. Paste and run in SQL Editor');
    process.exit(1);
  }
}

applyMigration();
