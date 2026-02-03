# Netlify Environment Variables Setup Guide

## Problem
The app won't load on Netlify because the Supabase environment variables are missing from the deployment configuration.

## Solution
Add your Supabase credentials to Netlify's environment variables.

## Steps to Configure Netlify

### 1. Log in to Netlify Dashboard
- Go to [netlify.com](https://netlify.com)
- Select your site (rent-match-chat or similar)

### 2. Navigate to Environment Variables
- Click on **Site settings** in the top menu
- Scroll down to find **Build & Deploy** section
- Click on **Environment** (or **Build environment variables**)

### 3. Add Environment Variables
Add the following three variables:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://vplgtcguxujxwrgguxqq.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDI5MDIsImV4cCI6MjA2MzU3ODkwMn0.-TzSQ-nDho4J6TftVF4RNjbhr5cKbknQxxUT-AaSIJU` |
| `VITE_SUPABASE_PROJECT_ID` | `vplgtcguxujxwrgguxqq` |

**Note:** These values are your **public/anon key** - they are safe to expose in the frontend. They are not sensitive secrets.

### 4. Deploy
- After adding the variables, Netlify will automatically redeploy your site
- Or manually trigger a redeploy from **Deploys** → **Trigger deploy**

## Verification

Once deployed, check:
1. Open your site on Netlify
2. If you see the loading spinner, open **DevTools** (F12) → **Console**
3. You should see no errors about missing Supabase variables
4. The app should now load correctly

## Troubleshooting

### Still shows "loading loading loading"?
1. Clear browser cache: `Ctrl+Shift+Del` (or Cmd+Shift+Del on Mac)
2. Try the cache clear URL: `https://yoursite.netlify.app/?clear-cache=1`
3. Check browser console for other errors

### Build still failing?
1. Go to Netlify **Deploys** tab
2. Click on the latest deploy
3. Look for errors in the **Deploy log**
4. Common issues:
   - Variables not saved (refresh and check again)
   - Typos in variable names
   - Trailing spaces in values (copy carefully!)

## What Each Variable Does

- **VITE_SUPABASE_URL**: Your Supabase project's base URL (used for all API calls)
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Your public authentication key (allows frontend to connect)
- **VITE_SUPABASE_PROJECT_ID**: Your project ID (mainly for reference/identification)

## Security Notes

✅ These variables ARE safe in frontend code:
- Public/anon key only allows read-only access based on RLS policies
- Supabase RLS (Row Level Security) protects your data
- Users can only access/modify their own data

❌ Never expose these in frontend:
- `service_role` key (admin-only operations)
- Database passwords
- API secrets

Your `.env` file is protected by `.gitignore` and won't be committed to Git.

## Need Help?

If deployment still doesn't work:
1. Double-check the variable names (they're case-sensitive!)
2. Make sure there are no extra spaces before/after values
3. Try a hard refresh: `Ctrl+F5` (or Cmd+Shift+R on Mac)
4. Check Netlify deploy logs for specific errors
