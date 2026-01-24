#!/usr/bin/env node

/**
 * Script to apply the comprehensive app access fix
 *
 * This script applies the migration that fixes ALL RLS policies blocking app access:
 * - Allows users to INSERT their profile (signup)
 * - Allows users to UPDATE their profile (editing)
 * - Allows users to SELECT their own profile and role
 * - Allows users to browse other profiles (matching/swiping)
 *
 * Usage:
 *   node apply-profile-access-fix.js
 *
 * Or with service role key:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key_here node apply-profile-access-fix.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vplgtcguxujxwrgguxqq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('');
  console.error('This script needs admin access to create RLS policies.');
  console.error('');
  console.error('To apply this fix:');
  console.error('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq');
  console.error('2. Navigate to SQL Editor');
  console.error('3. Run the following SQL:');
  console.error('');
  console.error('----------------------------------------');
  console.error(readFileSync(join(__dirname, 'supabase/migrations/20260124_fix_all_app_access_blockers.sql'), 'utf8'));
  console.error('----------------------------------------');
  console.error('');
  console.error('OR set the service role key and run this script again:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key_here node apply-profile-access-fix.js');
  process.exit(1);
}

async function applyMigration() {
  console.log('🚀 Applying comprehensive app access fix...');
  console.log('');

  try {
    // Read migration file
    const migrationSQL = readFileSync(
      join(__dirname, 'supabase/migrations/20260124_fix_all_app_access_blockers.sql'),
      'utf8'
    );

    // Execute SQL using REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to apply migration');
      console.error('Response:', errorText);
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('All app access blockers have been fixed:');
    console.log('  ✓ Users can create profiles (signup works)');
    console.log('  ✓ Users can edit profiles (profile updates work)');
    console.log('  ✓ Users can browse profiles (matching/swiping works)');
    console.log('  ✓ Users can view their role (dashboard routing works)');
    console.log('');
    console.log('Your app should now be fully accessible!');
    console.log('');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

applyMigration();
