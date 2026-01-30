# 📋 Supabase Migration Deployment Guide

This guide explains how migrations are automatically deployed to your Supabase database, and how to manually deploy if needed.

---

## ✅ Prerequisites

- Supabase account with access to your project
- GitHub repository access
- Supabase CLI (for manual deployment)

---

## 🚀 Automatic Deployment (Recommended)

### **How It Works**

- Migrations in `supabase/migrations/` are **automatically deployed** when you push to `main` branch
- The GitHub Actions workflow validates migrations before deploying
- The workflow also runs schema validation to catch errors

### **Setup: Configure GitHub Secrets (One-time)**

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

2. Add these three secrets by clicking **"New repository secret"**:

   | Secret Name | Value | Where to Get |
   |---|---|---|
   | `SUPABASE_ACCESS_TOKEN` | Your Supabase service_role API key | [Get it here →](https://app.supabase.com/project/vplgtcguxujxwrgguxqq/settings/api) |
   | `SUPABASE_PROJECT_REF` | Your project ID | Supabase Dashboard → Settings → API → Project ID |
   | `SUPABASE_PASSWORD` | Your database password | Supabase Dashboard → Settings → Database → Password |

3. **How to get each secret:**
   - **SUPABASE_ACCESS_TOKEN**: Go to Supabase → Settings → API → Under "Project API keys", find `service_role` key (⚠️ NOT the anon key)
   - **SUPABASE_PROJECT_REF**: Same page, copy the "Project ID" field
   - **SUPABASE_PASSWORD**: Go to Settings → Database → Copy the password field

### **That's it!** Now whenever you:
- Create/modify migration files in `supabase/migrations/`
- Push to `main` branch
- → The workflow automatically runs and deploys your migrations

### **Monitor Deployment**

Go to **Actions** tab in GitHub to see if deployment succeeded or failed.

---

## 🔄 Manual Deployment

If automatic deployment doesn't work or you need to manually trigger:

### **Option 1: Manual GitHub Actions Trigger**

1. Go to your GitHub repo → **Actions** → **Deploy Supabase Migrations**
2. Click **"Run workflow"** button
3. Select branch (usually `main`)
4. Click **"Run workflow"**
5. Wait for completion

---

### **Option 2: Supabase CLI (Local Machine)**

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref vplgtcguxujxwrgguxqq
   ```

3. When prompted for password, enter your Supabase database password (from Settings → Database)

4. Push migrations:
   ```bash
   supabase db push
   ```

5. Verify deployment:
   ```bash
   supabase migration list
   ```

---

## ✅ Verification: Check Deployment Status

### **Via GitHub Actions (Automatic)**

1. Go to your GitHub repo → **Actions** tab
2. Click on the latest **"Deploy Supabase Migrations"** run
3. Look for green checkmark ✅ = Success
4. Look for red X ❌ = Failed (click to see error details)

### **Via Supabase Dashboard**

1. Go to Supabase Dashboard → **Migrations** tab
2. You should see all your migration files listed
3. Status should show "Applied" with a timestamp

### **Via Supabase CLI**

```bash
supabase migration list
```

You'll see output like:
```
Migration ID              | Name                         | Timestamp
--------------------------|------------------------------|-------------------
20260128000000           | initial_schema               | 2026-01-28 00:00:00
20260130000001           | schema_audit_fix             | 2026-01-30 12:34:56
```

---

## 📁 Migration Files

Your migration files are in: `supabase/migrations/`

**Format:** `YYYYMMDDhhmmss_description.sql`

**Examples in your repo:**
- `20260128000000_initial_schema.sql`
- `20260130_schema_audit_fix.sql`
- etc.

---

## ❌ Troubleshooting

### **Problem: "Secrets not configured" error in GitHub Actions**

**Solution:**
1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Make sure you have all three secrets:
   - `SUPABASE_ACCESS_TOKEN` ✓
   - `SUPABASE_PROJECT_REF` ✓
   - `SUPABASE_PASSWORD` ✓
3. If missing, add them following the setup steps above

### **Problem: "column already exists" error**

- This is **normal** - it means the migration was already applied
- Safe to ignore
- Your database already has the changes

### **Problem: "permission denied" error**

- Your `SUPABASE_ACCESS_TOKEN` or password is incorrect
- Go to Supabase → Settings → API
- Generate a **new** `service_role` API key
- Update the `SUPABASE_ACCESS_TOKEN` secret in GitHub

### **Problem: Workflow says "Failed" but no error message**

1. Click on the failed workflow in GitHub Actions
2. Click on the "deploy-migrations" job
3. Look for the red error text
4. Common issues:
   - Invalid database password
   - Invalid API token
   - Migration syntax error in your `.sql` files

### **Problem: Anon key vs Service Role key confusion**

- **Anon key** (VITE_SUPABASE_PUBLISHABLE_KEY) = For frontend, limited permissions
- **Service role key** (SUPABASE_ACCESS_TOKEN) = For backend/CLI, full permissions
- **Always use service role key for migrations!**

---

## 📞 Need Help?

If you encounter errors, provide:

1. The error message from GitHub Actions (copy the full error text)
2. Screenshot of the failed workflow run
3. Your Supabase project ID

---

**Key Points:**
- ✅ Automatic deployment happens on every push to `main`
- ✅ Migrations are validated before deploying
- ✅ Schema drift is checked after deployment
- ✅ You can always trigger manually from GitHub Actions
- ⚠️ Billing lock may prevent deployments - contact Supabase support if needed
