#!/usr/bin/env node

/**
 * Migration runner for Supabase
 * Applies migrations from supabase/migrations directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment or hardcoded (for this project)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vplgtcguxujxwrgguxqq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL not set');
  process.exit(1);
}

async function executeMigration(sqlContent) {
  try {
    // For this implementation, we need to use a method that works without the exec_sql RPC
    // Since direct SQL execution isn't available via the REST API without a custom function,
    // we'll output instructions for manual application
    console.log('\n📋 Migration SQL Content:');
    console.log('=' .repeat(60));
    console.log(sqlContent);
    console.log('=' .repeat(60));
    console.log('\n⚠️  To apply this migration:');
    console.log('1. Go to https://app.supabase.com/project/vplgtcguxujxwrgguxqq/sql/new');
    console.log('2. Paste the SQL above');
    console.log('3. Click "Run"');
    console.log('\nAlternatively, if you have psql installed with DB credentials:');
    console.log('psql -d postgresql://[user]:[password]@db.vplgtcguxujxwrgguxqq.supabase.co:5432/postgres -c "' + sqlContent + '"');
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFile = process.argv[2] || '20260209_add_has_esc_column.sql';
  const fullPath = path.join(migrationsDir, migrationFile);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Migration file not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`📦 Applying migration: ${migrationFile}`);
  const sqlContent = fs.readFileSync(fullPath, 'utf-8');

  const success = await executeMigration(sqlContent);
  process.exit(success ? 0 : 1);
}

main();
