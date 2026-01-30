#!/usr/bin/env node

/**
 * Diagnostic script to identify page access issues
 *
 * Usage:
 *   node diagnose-access.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosing Page Access Issues...\n');

// 1. Check if all required page files exist
console.log('📄 Checking Page Files:');
const pages = [
  'ClientDashboard', 'ClientProfileNew', 'ClientSettingsNew', 'ClientLikedProperties',
  'ClientWhoLikedYou', 'ClientSavedSearches', 'ClientSecurity', 'ClientWorkerDiscovery',
  'ClientContracts', 'ClientLawyerServices', 'ClientFilters',
  'OwnerProfileNew', 'OwnerSettingsNew', 'OwnerProperties', 'OwnerNewListing',
  'OwnerLikedClients', 'OwnerInterestedClients', 'OwnerContracts', 'OwnerSavedSearches',
  'OwnerSecurity', 'OwnerPropertyClientDiscovery', 'OwnerMotoClientDiscovery',
  'OwnerBicycleClientDiscovery', 'OwnerViewClientProfile', 'OwnerFiltersExplore',
  'OwnerLawyerServices', 'OwnerFilters',
  'MessagingDashboard', 'NotificationsPage', 'SubscriptionPackagesPage'
];

let allPagesExist = true;
pages.forEach(page => {
  const filePath = path.join(__dirname, 'src', 'pages', `${page}.tsx`);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    console.log(`   ❌ Missing: ${page}.tsx`);
    allPagesExist = false;
  }
});

if (allPagesExist) {
  console.log(`   ✅ All ${pages.length} page files exist\n`);
} else {
  console.log('');
}

// 2. Check if migration file exists
console.log('📋 Checking Migration Files:');
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20260130_fix_all_page_access_v2.sql');
if (fs.existsSync(migrationPath)) {
  console.log('   ✅ Migration file exists: 20260130_fix_all_page_access_v2.sql\n');
} else {
  console.log('   ❌ Migration file MISSING!\n');
}

// 3. Check routing configuration
console.log('🛣️  Checking Routing Configuration:');
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');

  const hasProtectedRoute = appContent.includes('<ProtectedRoute>');
  const hasPersistentLayout = appContent.includes('<PersistentDashboardLayout');
  const hasClientRoutes = appContent.includes('/client/dashboard');
  const hasOwnerRoutes = appContent.includes('/owner/dashboard');

  console.log(`   ${hasProtectedRoute ? '✅' : '❌'} ProtectedRoute wrapper`);
  console.log(`   ${hasPersistentLayout ? '✅' : '❌'} PersistentDashboardLayout`);
  console.log(`   ${hasClientRoutes ? '✅' : '❌'} Client routes configured`);
  console.log(`   ${hasOwnerRoutes ? '✅' : '❌'} Owner routes configured\n`);
} else {
  console.log('   ❌ App.tsx not found!\n');
}

// 4. Check environment variables
console.log('🔧 Checking Environment:');
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed
}

const hasSupabaseUrl = !!process.env.VITE_SUPABASE_URL;
const hasAnonKey = !!process.env.VITE_SUPABASE_ANON_KEY;

console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} VITE_SUPABASE_URL ${hasSupabaseUrl ? '(set)' : '(MISSING)'}`);
console.log(`   ${hasAnonKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY ${hasAnonKey ? '(set)' : '(MISSING)'}\n`);

// 5. Check for common issues in package.json
console.log('📦 Checking Dependencies:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'react-router-dom',
    '@supabase/supabase-js',
    '@tanstack/react-query'
  ];

  requiredDeps.forEach(dep => {
    const exists = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
    console.log(`   ${exists ? '✅' : '❌'} ${dep} ${exists ? `(${exists})` : '(MISSING)'}`);
  });
  console.log('');
}

// 6. Summary and recommendations
console.log('═══════════════════════════════════════════════════════\n');
console.log('📊 DIAGNOSTIC SUMMARY:\n');

console.log('To fix page access issues, you need to:');
console.log('');
console.log('1. Apply the database migration:');
console.log('   • Go to Supabase Dashboard → SQL Editor');
console.log('   • Copy contents of: supabase/migrations/20260130_fix_all_page_access_v2.sql');
console.log('   • Run the SQL\n');

console.log('2. Verify the migration was applied:');
console.log('   • Run this query in Supabase SQL Editor:');
console.log('');
console.log('   SELECT tablename, policyname');
console.log('   FROM pg_policies');
console.log('   WHERE schemaname = \'public\'');
console.log('   AND tablename IN (\'profiles\', \'user_roles\', \'listings\')');
console.log('   ORDER BY tablename;');
console.log('');
console.log('   You should see multiple policies for each table\n');

console.log('3. Clear browser cache:');
console.log('   • Open browser console (F12)');
console.log('   • Run: localStorage.clear(); sessionStorage.clear();');
console.log('   • Refresh the page\n');

console.log('4. Check browser console for errors:');
console.log('   • Press F12 to open DevTools');
console.log('   • Go to Console tab');
console.log('   • Look for errors (red text)');
console.log('   • Common issues:');
console.log('     - "new row violates row-level security" → RLS policies not applied');
console.log('     - "permission denied for table" → GRANT statements needed');
console.log('     - "relation does not exist" → Table missing\n');

console.log('═══════════════════════════════════════════════════════\n');

console.log('💡 Need more help?');
console.log('   Share the error message from browser console (F12)\n');
