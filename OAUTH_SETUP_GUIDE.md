# OAuth Setup Guide for Facebook & Google Authentication

## Overview
This guide will help you configure Facebook and Google OAuth authentication for your SWiPESS application. You'll need to set up external service credentials and configure them in Supabase.

## ⚠️ IMPORTANT: Update URLs for Your Website

When you deploy to a new domain, you MUST update the OAuth configuration in **THREE places**:
1. Google Cloud Console
2. Facebook Developers Console (if using Facebook)
3. Supabase Dashboard

Replace all occurrences of the old domain with your new website URL.

## 🔵 Google OAuth Setup

### Step 1: Google Cloud Console Setup
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**:
   - Create a new project or select an existing one
   - Name it something like "SWiPESS-OAuth"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - **App name**: SWiPESS
     - **User support email**: Your email
     - **Developer contact email**: Your email
   - Under "Authorized domains", add:
     - `vplgtcguxujxwrgguxqq.supabase.co`
     - **YOUR NEW WEBSITE DOMAIN** (e.g., `your-app.com` or `your-app.vercel.app`)
   - Configure scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - **Name**: SWiPESS Web Client
   - **Authorized JavaScript origins** (add ALL of these):
     - `https://YOUR-WEBSITE-URL.com` ← **REPLACE WITH YOUR ACTUAL URL**
     - `https://vplgtcguxujxwrgguxqq.supabase.co`
     - `http://localhost:5173` (for local development)
     - `http://localhost:3000` (for local development)
   - **Authorized redirect URIs**:
     - `https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback`

6. **Save Client ID and Secret**: You'll need these for Supabase configuration.

## 🔵 Facebook OAuth Setup

### Step 1: Facebook Developers Setup
1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create App**:
   - Click "Create App"
   - Choose "Consumer" app type
   - **App Name**: SWiPESS
   - **Contact Email**: Your email

3. **Add Facebook Login Product**:
   - In left sidebar, click "Add Product"
   - Find "Facebook Login" and click "Set Up"

4. **Configure Facebook Login Settings**:
   - Go to "Facebook Login" → "Settings"
   - **Valid OAuth Redirect URIs**:
     - `https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback`
   - **Valid Deauthorize Callback URL**: (Same as above)
   - **Valid Data Delete Callback URL**: (Same as above)

5. **App Settings**:
   - Go to "Settings" → "Basic"
   - Add **App Domains**:
     - `vplgtcguxujxwrgguxqq.supabase.co`
     - **YOUR-WEBSITE-DOMAIN.com** ← **REPLACE WITH YOUR ACTUAL DOMAIN**
   - **Privacy Policy URL**: Add your privacy policy URL
   - **Terms of Service URL**: Add your terms URL

6. **Get App Credentials**:
   - Note down **App ID** and **App Secret** from "Settings" → "Basic"

## 🔵 Supabase Configuration

### Step 1: Configure Authentication Providers
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/providers

2. **Configure Google Provider**:
   - Toggle "Enable sign in with Google"
   - **Client ID**: Paste your Google OAuth Client ID
   - **Client Secret**: Paste your Google OAuth Client Secret
   - Click "Save"

3. **Configure Facebook Provider** (optional):
   - Toggle "Enable sign in with Facebook"
   - **Facebook Client ID**: Paste your Facebook App ID
   - **Facebook Secret**: Paste your Facebook App Secret
   - Click "Save"

### Step 2: Configure URL Settings (⚠️ CRITICAL FOR NEW DOMAINS)
1. **Go to Authentication → URL Configuration**: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/url-configuration

2. **Set Site URL** (⚠️ UPDATE THIS TO YOUR NEW WEBSITE):
   - **Site URL**: `https://YOUR-WEBSITE-URL.com` ← **REPLACE WITH YOUR ACTUAL URL**

3. **Set Redirect URLs** (add each on a new line - ⚠️ UPDATE THESE):
   ```
   https://YOUR-WEBSITE-URL.com
   https://YOUR-WEBSITE-URL.com/
   https://YOUR-WEBSITE-URL.com/**
   http://localhost:5173
   http://localhost:5173/
   http://localhost:3000
   http://localhost:3000/
   ```

   **IMPORTANT**: Replace `YOUR-WEBSITE-URL.com` with your actual deployed website URL (e.g., `swipess.vercel.app` or your custom domain).

## 🚀 Testing OAuth

### Test Google OAuth:
1. Click "Continue with Google" in your app
2. Should redirect to Google consent screen
3. After approval, should redirect back and create profile

### Test Facebook OAuth:
1. Click "Continue with Facebook" in your app
2. Should redirect to Facebook consent screen
3. After approval, should redirect back and create profile

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"** or **"redirect_uri_mismatch"**:
   - This is the #1 issue when deploying to a new domain!
   - Go to Google Cloud Console → Credentials → Your OAuth Client
   - Add your new website URL to "Authorized JavaScript origins"
   - The redirect URI should always be: `https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback`

2. **OAuth redirects to wrong website**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Update the "Site URL" to your new website URL
   - Add your new website URL to "Redirect URLs"

3. **"App not approved for login"**:
   - Facebook: Make sure app is not in Development mode for production
   - Google: Verify OAuth consent screen is published

4. **"requested path is invalid"**:
   - Check Supabase Site URL and Redirect URLs are correctly configured

5. **Sign-up shows "Please wait..." forever**:
   - This usually means the database query is timing out
   - Check Supabase RLS policies allow profile queries
   - The app now has a 5-second timeout to prevent hanging

6. **Role not being set**:
   - Check that role parameter is being passed in OAuth URL
   - Verify profile creation logic handles OAuth users

### Debug Steps:
1. Check browser network tab for OAuth redirect URLs
2. Verify OAuth credentials in Supabase dashboard
3. Check Supabase Auth logs for detailed error messages (Supabase Dashboard → Logs → Auth)
4. Test with a fresh incognito browser session
5. Clear browser localStorage and try again

## 📋 Checklist for New Domain Deployment

- [ ] **Google Cloud Console**: Added new website URL to "Authorized JavaScript origins"
- [ ] **Google Cloud Console**: Verified redirect URI is `https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback`
- [ ] **Supabase Dashboard**: Updated "Site URL" to new website URL
- [ ] **Supabase Dashboard**: Added new website URL patterns to "Redirect URLs"
- [ ] **Facebook Developers** (if using): Added new domain to "App Domains"
- [ ] Tested Google OAuth for both Client and Owner roles
- [ ] Profile creation verified for OAuth users

## 🔗 Quick Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [Supabase Auth Providers](https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/providers)
- [Supabase URL Configuration](https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/url-configuration)

---

## Quick Fix Summary for New Website

If Google Sign-In is pointing to your old website, do these 2 things:

### 1. Update Google Cloud Console
- Go to: https://console.cloud.google.com/ → APIs & Services → Credentials
- Click on your OAuth 2.0 Client ID
- Add your new website URL to "Authorized JavaScript origins"
- Save

### 2. Update Supabase
- Go to: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/url-configuration
- Change "Site URL" to your new website URL
- Add these to "Redirect URLs":
  - `https://your-new-website.com`
  - `https://your-new-website.com/`
  - `https://your-new-website.com/**`
- Save

That's it! Google Sign-In should now work with your new website.