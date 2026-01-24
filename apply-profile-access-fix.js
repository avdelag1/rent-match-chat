#!/usr/bin/env node

/**
 * Script to apply the profile browsing access fix
 *
 * This script applies the migration that restores profile browsing functionality
 * by adding an RLS policy that allows authenticated users to view active profiles.
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
  console.error(readFileSync(join(__dirname, 'supabase/migrations/20260124_fix_profile_browsing_access.sql'), 'utf8'));
  console.error('----------------------------------------');
  console.error('');
  console.error('OR set the service role key and run this script again:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key_here node apply-profile-access-fix.js');
  process.exit(1);
}

async function applyMigration() {
  console.log('🚀 Applying profile browsing access fix...');
  console.log('');

  try {
    // Read migration file
    const migrationSQL = readFileSync(
      join(__dirname, 'supabase/migrations/20260124_fix_profile_browsing_access.sql'),
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
    console.log('Profile browsing access has been restored.');
    console.log('Users can now browse and swipe on profiles again.');
    console.log('');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    process.exit(1);
  }
}

applyMigration();
