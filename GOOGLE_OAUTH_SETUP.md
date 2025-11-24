# Google OAuth Setup Guide for TindeRent

This guide will help you set up Google OAuth authentication for your TindeRent app.

## Prerequisites
- Google account
- Supabase project (already configured)
- Your app is already set up to use Google OAuth (code is ready)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "TindeRent" → Click "Create"
4. Wait for the project to be created (takes ~30 seconds)

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public users) → Click **Create**
3. Fill in the required fields:
   - **App name**: TindeRent
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **Save and Continue**
5. On "Scopes" screen → Click **Save and Continue** (default scopes are fine)
6. On "Test users" screen → Click **Save and Continue** (we'll add test users later if needed)
7. Click **Back to Dashboard**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it "TindeRent Web Client"
5. Under **Authorized JavaScript origins**, add:
   ```
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co
   http://localhost:5173
   ```
6. Under **Authorized redirect URIs**, add:
   ```
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback
   ```

   **Important**: Replace `[YOUR-SUPABASE-PROJECT-REF]` with your actual Supabase project reference ID.
   You can find this in your Supabase dashboard URL: `https://supabase.com/dashboard/project/[YOUR-PROJECT-REF]`

7. Click **Create**
8. You'll see a popup with your **Client ID** and **Client Secret**
9. **Copy both and save them securely** - you'll need them in the next step

## Step 5: Add Credentials to Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your TindeRent project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list and toggle it **ON**
5. Paste your **Client ID** and **Client Secret** from Step 4
6. Click **Save**

## Step 6: Test OAuth Login

1. Run your app locally:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Click "Sign in with Google"
4. You should be redirected to Google login
5. After logging in, you'll be redirected back to your app

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback`
- No trailing slashes!

### "Access blocked: This app's request is invalid"
- Make sure you completed the OAuth consent screen configuration (Step 3)
- Try adding yourself as a test user in OAuth consent screen

### "OAuth error: invalid_client"
- Double-check that you copied the Client ID and Client Secret correctly
- Make sure there are no extra spaces

## Production Deployment

When deploying to production:

1. Add your production domain to **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```

2. Add production callback to **Authorized redirect URIs**:
   ```
   https://yourdomain.com/auth/callback
   ```

3. Update OAuth consent screen to "In Production" status:
   - Go to **OAuth consent screen**
   - Click **Publish App**
   - Complete Google's verification process (required for >100 users)

## Notes

- Your app's code is already configured to use Google OAuth
- The authentication flow is handled by Supabase
- User profiles are automatically created on first login
- No changes to your codebase are needed after completing this setup

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Check browser console for error messages
3. Verify all URLs match exactly (no trailing slashes, correct protocol)
