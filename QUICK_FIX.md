# Quick Fix for Page Access Issues

## 🚨 The Problem

Your pages are not accessible because the database is missing Row-Level Security (RLS) policies. Without these policies, users can't read or write data, which makes all pages appear broken or blank.

## ✅ The Solution (5 minutes)

Follow these steps **exactly**:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on your project
3. Go to "SQL Editor" in the left sidebar
   OR visit: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### Step 2: Copy the Migration SQL

1. Open the file: supabase/migrations/20260130_fix_all_page_access_v2.sql
2. Copy ALL the contents (Ctrl+A, Ctrl+C)

### Step 3: Run the Migration

1. Paste the SQL into the SQL Editor
2. Click the "Run" button (or press Ctrl+Enter)
3. Wait for "Success" message (should appear in ~2-3 seconds)

### Step 4: Clear Browser Cache

1. Open your app in the browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Type these commands and press Enter after each:
   ```
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### Step 5: Test

1. Log in to your app
2. Try navigating to different pages
3. Check that data loads correctly

## ✨ What This Fixes

- Profile viewing and editing
- Property/listing browsing
- Messaging system
- Notifications
- Likes and matches
- All client pages (/client/*)
- All owner pages (/owner/*)
- Shared pages (/messages, /notifications)

## 🔍 Still Having Issues?

Run the diagnostic tool:
```
node diagnose-access.cjs
```

Check browser console:
- Press F12
- Go to Console tab
- Look for red errors
