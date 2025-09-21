# OAuth Setup Guide for Facebook & Google Authentication

## Overview
This guide will help you configure Facebook and Google OAuth authentication for your Tinderent application. You'll need to set up external service credentials and configure them in Supabase.

## 🔵 Google OAuth Setup

### Step 1: Google Cloud Console Setup
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**:
   - Create a new project or select an existing one
   - Name it something like "Tinderent-OAuth"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - **App name**: Tinderent
     - **User support email**: Your email
     - **Developer contact email**: Your email
   - Under "Authorized domains", add:
     - `vplgtcguxujxwrgguxqq.supabase.co`
     - Your custom domain (if any)
   - Configure scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile` 
     - `openid`

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web application"
   - **Name**: Tinderent Web Client
   - **Authorized JavaScript origins**:
     - `https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com`
     - `https://vplgtcguxujxwrgguxqq.supabase.co`
     - Your custom domain (if any)
   - **Authorized redirect URIs**:
     - `https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback`

6. **Save Client ID and Secret**: You'll need these for Supabase configuration.

## 🔵 Facebook OAuth Setup

### Step 1: Facebook Developers Setup
1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create App**:
   - Click "Create App"
   - Choose "Consumer" app type
   - **App Name**: Tinderent
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
     - `686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com`
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

3. **Configure Facebook Provider**:
   - Toggle "Enable sign in with Facebook"
   - **Facebook Client ID**: Paste your Facebook App ID
   - **Facebook Secret**: Paste your Facebook App Secret
   - Click "Save"

### Step 2: Configure URL Settings
1. **Go to Authentication → URL Configuration**: https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/url-configuration

2. **Set Site URL**:
   - **Site URL**: `https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com`

3. **Set Redirect URLs** (add each on a new line):
   ```
   https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com
   https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com/
   https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com/**
   http://localhost:3000
   http://localhost:3000/
   ```

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

1. **"Invalid redirect URI"**:
   - Verify redirect URIs match exactly in Google/Facebook and Supabase
   - Check for trailing slashes and protocol (https vs http)

2. **"App not approved for login"**:
   - Facebook: Make sure app is not in Development mode for production
   - Google: Verify OAuth consent screen is published

3. **"requested path is invalid"**:
   - Check Supabase Site URL and Redirect URLs are correctly configured

4. **Role not being set**:
   - Check that role parameter is being passed in OAuth URL
   - Verify profile creation logic handles OAuth users

### Debug Steps:
1. Check browser network tab for OAuth redirect URLs
2. Verify OAuth credentials in Supabase dashboard
3. Check Supabase Auth logs for detailed error messages
4. Test with a fresh incognito browser session

## 📋 Checklist

- [ ] Google Cloud project created and configured
- [ ] Google OAuth credentials generated
- [ ] Facebook app created and configured  
- [ ] Facebook login product added
- [ ] Supabase Google provider configured
- [ ] Supabase Facebook provider configured
- [ ] Supabase URL configuration set
- [ ] OAuth flows tested for both client and owner roles
- [ ] Profile creation verified for OAuth users

## 🔗 Quick Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Facebook Developers](https://developers.facebook.com/)
- [Supabase Auth Providers](https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/providers)
- [Supabase URL Configuration](https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/url-configuration)

---

Once these configurations are complete, OAuth authentication should work seamlessly for both Facebook and Google!