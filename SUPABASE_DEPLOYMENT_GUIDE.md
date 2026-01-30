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

2. Add these two secrets by clicking **"New repository secret"** (then add them to the **production environment**):

   | Secret Name | Value | Where to Get |
   |---|---|---|
   | `SUPABASE_ACCESS_TOKEN` | Your Supabase personal access token | [Get it here →](https://app.supabase.com/account/tokens) |
   | `SUPABASE_PROJECT_REF` | Your project ID | Supabase Dashboard → Settings → API → Project ID |

3. **Important:** Add these secrets to the **production environment**, not repository:
   - Go to **Settings** → **Environments** → **production**
   - Click **"Add secret"** for each one
   - Or add to **Repository** secrets if you prefer (both work)

4. **How to get each secret:**
   - **SUPABASE_ACCESS_TOKEN**: Go to your Supabase profile → [Account → Tokens](https://app.supabase.com/account/tokens) → Copy the personal access token you see
   - **SUPABASE_PROJECT_REF**: Go to Supabase Dashboard → Settings → API → Copy the "Project ID"

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

2. Create a personal access token:
   - Go to [Supabase Account → Tokens](https://app.supabase.com/account/tokens)
   - Copy your personal access token

3. Link your project:
   ```bash
   supabase link --project-ref vplgtcguxujxwrgguxqq
   ```
   When prompted, paste your personal access token (from step 2)

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
1. Go to GitHub repo → **Settings** → **Environments** → **production**
2. Make sure you have both secrets in the **production environment**:
   - `SUPABASE_ACCESS_TOKEN` ✓
   - `SUPABASE_PROJECT_REF` ✓
3. If missing, add them following the setup steps above

### **Problem: "column already exists" error**

- This is **normal** - it means the migration was already applied
- Safe to ignore
- Your database already has the changes

### **Problem: "permission denied" error**

- Your `SUPABASE_ACCESS_TOKEN` is incorrect or expired
- Go to Supabase → [Account → Tokens](https://app.supabase.com/account/tokens)
- Create a **new** personal access token
- Update the `SUPABASE_ACCESS_TOKEN` secret in GitHub or production environment

### **Problem: Workflow says "Failed" but no error message**

1. Click on the failed workflow in GitHub Actions
2. Click on the "deploy-migrations" job
3. Look for the red error text
4. Common issues:
   - Invalid API token (expired or wrong)
   - Missing secrets in production environment
   - Migration syntax error in your `.sql` files

### **Problem: Different keys confusion**

- **Anon key** (VITE_SUPABASE_PUBLISHABLE_KEY) = For frontend, limited permissions ✗ Don't use for migrations
- **Personal access token** (SUPABASE_ACCESS_TOKEN) = For CLI and GitHub Actions ✓ Use this for migrations
- **API keys** = Old method, not recommended
- **Always use personal access token for migrations!**

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
