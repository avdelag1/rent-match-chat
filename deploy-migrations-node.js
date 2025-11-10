#!/usr/bin/env node

/**
 * Supabase Migration Deployment Script
 * This script deploys migrations using Node.js
 *
 * Usage: node deploy-migrations-node.js
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Configuration
const SUPABASE_URL = 'https://vplgtcguxujxwrgguxqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDI5MDIsImV4cCI6MjA2MzU3ODkwMn0.-TzSQ-nDho4J6TftVF4RNjbhr5cKbknQxxUT-AaSIJU';

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  step: (num, msg) => console.log(`\n${colors.yellow}Step ${num}: ${msg}${colors.reset}`),
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMigrations() {
  try {
    log.info('='.repeat(50));
    log.info('Supabase Migration Deployment');
    log.info('='.repeat(50));
    log.info('');

    // Step 1: Check if migration files exist
    log.step(1, 'Checking migration files');
    const files = [
      'SUPABASE_MIGRATION_STEP1.sql',
      'SUPABASE_MIGRATION_STEP2.sql',
      'SUPABASE_MIGRATION_STEP3.sql'
    ];

    for (const file of files) {
      if (!fs.existsSync(file)) {
        log.error(`Missing file: ${file}`);
        process.exit(1);
      }
      log.success(`Found: ${file}`);
    }
    log.info('');

    // Step 2: Try to import and use Supabase client
    log.step(2, 'Checking Supabase dependencies');

    let supabase;
    try {
      // Try to use installed version
      const { createClient } = require('@supabase/supabase-js');
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      log.success('Supabase client loaded');
    } catch (e) {
      log.error('Could not load Supabase client');
      log.warning('Alternative: Use the web dashboard instructions below');
      printWebDashboardInstructions();
      process.exit(1);
    }
    log.info('');

    // Step 3: Read migration files
    log.step(3, 'Reading migration files');
    const migrations = [];

    for (const file of files) {
      const sql = fs.readFileSync(file, 'utf-8');
      migrations.push({ file, sql });
      log.success(`Read: ${file}`);
    }
    log.info('');

    // Step 4: Execute migrations
    log.step(4, 'Deploying migrations to Supabase');

    for (let i = 0; i < migrations.length; i++) {
      const { file, sql } = migrations[i];
      log.info(`Executing ${file}...`);

      try {
        // Use RPC to execute raw SQL (requires proper setup)
        // For now, we'll show the user instructions to do it manually
        log.warning(`Cannot execute SQL directly via client library`);
        throw new Error('SQL execution via JS client not supported');
      } catch (e) {
        log.warning('Web dashboard method required');
        printWebDashboardInstructions();
        process.exit(1);
      }
    }

  } catch (error) {
    log.error(`Deployment failed: ${error.message}`);
    log.warning('Using web dashboard instead...');
    printWebDashboardInstructions();
    process.exit(1);
  }
}

function printWebDashboardInstructions() {
  console.log(`
${colors.yellow}${'='.repeat(60)}${colors.reset}
${colors.yellow}📋 Using Supabase Web Dashboard Instead${colors.reset}
${colors.yellow}${'='.repeat(60)}${colors.reset}

Since CLI installation is restricted, please use the web dashboard:

${colors.blue}1. Go to Supabase Dashboard:${colors.reset}
   https://app.supabase.com/project/vplgtcguxujxwrgguxqq/sql/new

${colors.blue}2. Run each migration file in order:${colors.reset}
   a) SUPABASE_MIGRATION_STEP1.sql
   b) SUPABASE_MIGRATION_STEP2.sql
   c) SUPABASE_MIGRATION_STEP3.sql

${colors.blue}3. For each file:${colors.reset}
   - Click "New Query"
   - Copy content from file
   - Paste into SQL editor
   - Click "Run" button
   - Wait for green checkmark ✓

${colors.blue}4. Verify with:${colors.reset}
   - Run SUPABASE_VERIFY_STEP1.sql
   - Run SUPABASE_VERIFY_STEP2.sql

${colors.green}See SUPABASE_DEPLOYMENT_GUIDE.md for full instructions${colors.reset}

${colors.yellow}${'='.repeat(60)}${colors.reset}
`);
}

// Run if executed directly
if (require.main === module) {
  runMigrations().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runMigrations };
