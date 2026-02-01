#!/usr/bin/env node

/**
 * Migration Validation Script
 *
 * This script validates migration files before they're deployed to prevent:
 * 1. Column name mismatches between database schema and TypeScript types
 * 2. Reference to non-existent columns
 * 3. Silent data loss from incorrect column names
 * 4. Out-of-sync types
 *
 * Run this script before deploying migrations:
 *   node supabase/scripts/validate-migration.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log(`${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'bold');
  log(`${'='.repeat(60)}`, 'blue');
  console.log('');
}

// Extract column definitions from SQL migration files
function extractColumnDefinitions(sqlContent) {
  const columns = new Map();

  // Match CREATE TABLE statements
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi;
  const matches = [...sqlContent.matchAll(createTableRegex)];

  for (const match of matches) {
    const tableName = match[1];
    const tableContent = match[2];

    // Extract column definitions (skip constraints)
    const columnRegex = /^\s*(\w+)\s+(INTEGER|TEXT|BOOLEAN|DECIMAL|TIMESTAMP|UUID|JSONB|BIGINT|SERIAL|BIGSERIAL)(?:\([^)]+\))?/gim;
    const columnMatches = [...tableContent.matchAll(columnRegex)];

    const tableColumns = columnMatches.map(m => ({
      name: m[1].toLowerCase(),
      type: m[2].toUpperCase()
    })).filter(col => {
      // Filter out constraint keywords that might be matched
      const keywords = ['constraint', 'primary', 'foreign', 'check', 'unique', 'references'];
      return !keywords.includes(col.name.toLowerCase());
    });

    if (tableColumns.length > 0) {
      columns.set(tableName, tableColumns);
    }
  }

  // Also match ALTER TABLE ADD COLUMN statements
  const alterTableRegex = /ALTER\s+TABLE\s+(?:public\.)?(\w+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+(INTEGER|TEXT|BOOLEAN|DECIMAL|TIMESTAMP|UUID|JSONB|BIGINT)/gi;
  const alterMatches = [...sqlContent.matchAll(alterTableRegex)];

  for (const match of alterMatches) {
    const tableName = match[1];
    const columnName = match[2].toLowerCase();
    const columnType = match[3].toUpperCase();

    if (!columns.has(tableName)) {
      columns.set(tableName, []);
    }

    // Check if column doesn't already exist in our map
    const existingColumns = columns.get(tableName);
    if (!existingColumns.find(c => c.name === columnName)) {
      existingColumns.push({ name: columnName, type: columnType });
    }
  }

  return columns;
}

// Extract TypeScript interface column names
function extractTypescriptTypes(typesContent) {
  const tables = new Map();

  // Match table interfaces with Row definitions
  const tableRegex = /(\w+):\s*\{\s*Row:\s*\{([^}]+)\}/gs;
  const matches = [...typesContent.matchAll(tableRegex)];

  for (const match of matches) {
    const tableName = match[1];
    const rowContent = match[2];

    // Extract field names from the Row interface
    const fieldRegex = /(\w+)(?:\?)?:\s*(?:string|number|boolean|null|Database\["public"\]\["Enums"\]\["\w+"\]|\{[^}]*\}|\[[^\]]*\])+/g;
    const fieldMatches = [...rowContent.matchAll(fieldRegex)];

    const fields = fieldMatches.map(m => m[1]);

    if (fields.length > 0) {
      tables.set(tableName, fields);
    }
  }

  return tables;
}

// Check for common problematic column name patterns
function checkProblematicNames(schemaColumns, tsTypes) {
  const issues = [];

  // Common abbreviations that cause mismatches
  const commonMismatches = [
    { short: 'beds', long: 'bedrooms' },
    { short: 'baths', long: 'bathrooms' },
    { short: 'desc', long: 'description' },
    { short: 'addr', long: 'address' },
    { short: 'lat', long: 'latitude' },
    { short: 'lng', long: 'longitude' },
    { short: 'lon', long: 'longitude' },
    { short: 'img', long: 'image' },
    { short: 'imgs', long: 'images' },
    { short: 'pic', long: 'picture' },
    { short: 'pics', long: 'pictures' },
    { short: 'cat', long: 'category' },
    { short: 'cats', long: 'categories' }
  ];

  for (const [tableName, columns] of schemaColumns.entries()) {
    const tsFields = tsTypes.get(tableName);
    if (!tsFields) continue;

    const schemaNames = columns.map(c => c.name);

    for (const { short, long } of commonMismatches) {
      const hasShortInTS = tsFields.includes(short);
      const hasLongInSchema = schemaNames.includes(long);
      const hasShortInSchema = schemaNames.includes(short);
      const hasLongInTS = tsFields.includes(long);

      if (hasShortInTS && hasLongInSchema) {
        issues.push({
          table: tableName,
          severity: 'ERROR',
          message: `TypeScript has '${short}' but database has '${long}'`
        });
      }

      if (hasLongInTS && hasShortInSchema) {
        issues.push({
          table: tableName,
          severity: 'ERROR',
          message: `TypeScript has '${long}' but database has '${short}'`
        });
      }
    }
  }

  return issues;
}

// Main validation function
function validateMigrations() {
  logSection('Migration Validation');

  const migrationsDir = path.join(__dirname, '../migrations');
  const typesFile = path.join(__dirname, '../../src/integrations/supabase/types.ts');

  // Check if types file exists
  if (!fs.existsSync(typesFile)) {
    log('ERROR: TypeScript types file not found!', 'red');
    log(`Expected at: ${typesFile}`, 'yellow');
    return false;
  }

  // Read all migration files
  log('Reading migration files...', 'blue');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  log(`Found ${migrationFiles.length} migration files`, 'green');

  // Combine all migrations to get final schema state
  let combinedSQL = '';
  for (const file of migrationFiles) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    combinedSQL += '\n' + content;
  }

  // Extract schema from migrations
  log('Extracting database schema from migrations...', 'blue');
  const schemaColumns = extractColumnDefinitions(combinedSQL);

  log(`Found ${schemaColumns.size} tables in migrations:`, 'green');
  for (const [tableName, columns] of schemaColumns.entries()) {
    log(`  - ${tableName}: ${columns.length} columns`, 'reset');
  }

  // Extract TypeScript types
  log('\nReading TypeScript types...', 'blue');
  const typesContent = fs.readFileSync(typesFile, 'utf8');
  const tsTypes = extractTypescriptTypes(typesContent);

  log(`Found ${tsTypes.size} table types in TypeScript`, 'green');

  // Validate alignment
  logSection('Validation Results');

  let hasErrors = false;
  let hasWarnings = false;

  // Check for problematic abbreviations
  log('Checking for common column name mismatches...', 'blue');
  const nameIssues = checkProblematicNames(schemaColumns, tsTypes);

  if (nameIssues.length > 0) {
    hasErrors = true;
    log(`\n❌ Found ${nameIssues.length} column name mismatch(es):`, 'red');
    for (const issue of nameIssues) {
      log(`  [${issue.table}] ${issue.message}`, 'red');
    }
  } else {
    log('✓ No common column name mismatches found', 'green');
  }

  // Check for missing tables
  log('\nChecking for missing tables in TypeScript types...', 'blue');
  const missingTables = [];
  for (const tableName of schemaColumns.keys()) {
    if (!tsTypes.has(tableName)) {
      missingTables.push(tableName);
    }
  }

  if (missingTables.length > 0) {
    hasWarnings = true;
    log(`\n⚠️  Found ${missingTables.length} table(s) in database but not in TypeScript:`, 'yellow');
    for (const table of missingTables) {
      log(`  - ${table}`, 'yellow');
    }
    log('\nThis may be normal if the table is internal or recently added.', 'yellow');
  }

  // Check for column mismatches in key tables
  log('\nChecking column alignment for critical tables...', 'blue');
  const criticalTables = ['listings', 'profiles', 'matches', 'conversations'];
  const columnMismatches = [];

  for (const tableName of criticalTables) {
    if (!schemaColumns.has(tableName) || !tsTypes.has(tableName)) {
      continue;
    }

    const schemaNames = new Set(schemaColumns.get(tableName).map(c => c.name));
    const tsNames = new Set(tsTypes.get(tableName));

    // Find columns in TS but not in schema
    const onlyInTS = [...tsNames].filter(name => !schemaNames.has(name));
    // Find columns in schema but not in TS
    const onlyInSchema = [...schemaNames].filter(name => !tsNames.has(name));

    if (onlyInTS.length > 0 || onlyInSchema.length > 0) {
      columnMismatches.push({ tableName, onlyInTS, onlyInSchema });
    }
  }

  if (columnMismatches.length > 0) {
    hasErrors = true;
    log(`\n❌ Found column mismatches in ${columnMismatches.length} critical table(s):`, 'red');
    for (const { tableName, onlyInTS, onlyInSchema } of columnMismatches) {
      log(`\n  Table: ${tableName}`, 'bold');
      if (onlyInTS.length > 0) {
        log(`    In TypeScript but NOT in database:`, 'red');
        for (const col of onlyInTS) {
          log(`      - ${col}`, 'red');
        }
      }
      if (onlyInSchema.length > 0) {
        log(`    In database but NOT in TypeScript:`, 'yellow');
        for (const col of onlyInSchema) {
          log(`      - ${col}`, 'yellow');
        }
      }
    }
  } else {
    log('✓ All critical tables have matching columns', 'green');
  }

  // Final summary
  logSection('Summary');

  if (hasErrors) {
    log('❌ VALIDATION FAILED', 'red');
    log('\nErrors detected that will cause runtime failures!', 'red');
    log('\nTo fix:', 'yellow');
    log('  1. Regenerate TypeScript types from database:', 'reset');
    log('     supabase gen types typescript --project-id vplgtcguxujxwrgguxqq > src/integrations/supabase/types.ts', 'reset');
    log('  2. Or update migrations to match current TypeScript types', 'reset');
    log('  3. Re-run this validation script', 'reset');
    return false;
  } else if (hasWarnings) {
    log('⚠️  VALIDATION PASSED WITH WARNINGS', 'yellow');
    log('\nNo critical errors, but some inconsistencies were found.', 'yellow');
    log('Review warnings above and regenerate types if needed.', 'yellow');
    return true;
  } else {
    log('✅ VALIDATION PASSED', 'green');
    log('\nAll checks passed! Migrations and types are aligned.', 'green');
    return true;
  }
}

// Run validation
const success = validateMigrations();
process.exit(success ? 0 : 1);
