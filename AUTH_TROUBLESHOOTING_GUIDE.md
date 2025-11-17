# Authentication Troubleshooting Guide

This guide will help you diagnose and fix issues with Google sign-in, sign-up, and session persistence in Tinderent.

## Quick Diagnostics

### Run OAuth Diagnostics in Browser Console

1. Open your browser's Developer Tools (F12 or Right-click > Inspect)
2. Go to the **Console** tab
3. Run this command:
   ```javascript
   await runOAuthDiagnostics()
   ```

This will display:
- ✅ Google OAuth status
- ✅ Session persistence status (localStorage)
- ❌ Any errors that need fixing
- 💡 Recommendations for fixes

## Common Issues & Solutions

### Issue 1: "Continue with Google" Button Does Nothing

**Symptoms:**
- Clicking the Google button doesn't redirect
- No error message appears
- Browser console shows OAuth errors

**Diagnosis:**
```javascript
await runOAuthDiagnostics()
```

**Solutions:**

#### A) Google OAuth Not Enabled in Supabase
Check the diagnostics output for: `Google OAuth: Configured: ❌`

**Fix:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication > Providers**
4. Find **Google** and click to expand
5. Toggle **Enabled** to ON
6. Add your Google OAuth credentials:
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
7. Click **Save**

#### B) Redirect URL Not Configured
Check diagnostics for: "Ensure this is added to Supabase redirect URLs"

**Fix:**
1. In Supabase Dashboard, go to **Authentication > URL Configuration**
2. Under **Redirect URLs**, add your current domain:
   - For local development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
3. Click **Save**

#### C) Google Client Credentials Invalid
Check diagnostics for: `Invalid OAuth credentials`

**Fix:**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create a new OAuth 2.0 Client ID for Web Application
3. Add authorized redirect URIs:
   - Your Supabase OAuth callback URL (found in Supabase Auth settings)
4. Copy the Client ID and Secret
5. Add them to Supabase in **Authentication > Providers > Google**

### Issue 2: "I Stay Logged Out When I Go Back"

**Symptoms:**
- You sign in successfully
- You navigate away or refresh the page
- You're logged out again
- Session doesn't persist

**Diagnosis:**
```javascript
await runOAuthDiagnostics()
```
Look for: `Session Persistence: localStorage: ❌`

**Solutions:**

#### A) Private/Incognito Mode
**Fix:** Use regular (non-private) browsing mode. Private mode disables localStorage.

#### B) Browser Privacy Settings
**Fix:**
1. Check if localStorage is disabled in your browser settings
2. For Chrome: Settings > Privacy and security > Site settings > Cookies and data > Allow all cookies
3. For Firefox: Go to about:preferences > Privacy > Cookies and Site Data > Allow

#### C) Cookies Blocked
**Fix:**
1. Clear your browser cache and cookies:
   - Chrome: Settings > Clear browsing data > Select "All time" and check all boxes
   - Firefox: History > Clear Recent History > Select "Everything"
2. Refresh the page and try again

### Issue 3: "I Can Sign In But Keep Getting Redirected to Sign In"

**Symptoms:**
- Google OAuth works
- You sign in successfully
- Dashboard loads but redirects back to login
- Infinite redirect loop

**Diagnosis:**
Check the browser console (F12) for errors about "user role" or "role fetch failed"

**Solutions:**

#### A) Database Role Not Created
**Fix:**
This is usually automatic, but if it fails:
1. Open browser console (F12)
2. Look for errors with "ProfileSetup" or "role"
3. Refresh the page (may take 15 seconds for retry logic)
4. If still failing, contact support

#### B) Profile Creation Failed
**Fix:**
1. Check browser console for "Profile creation failed" messages
2. Try signing out and signing back in
3. If problem persists, try:
   - Clear localStorage and cache
   - Use an incognito window to test

### Issue 4: Sign Up Not Working

**Symptoms:**
- Sign up form doesn't submit
- Email/password fields not accepting input
- Account not created

**Solutions:**

#### A) Email Already Exists
**Fix:**
If you already have an account with that email:
- Use the Sign In button instead
- Or use a different email address

#### B) Password Requirements Not Met
**Fix:**
Password must be:
- At least 6 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)

Example: `MyPassword123`

#### C) Invalid Email Format
**Fix:**
Ensure your email is in correct format: `user@example.com`

## Session Persistence Explained

When you sign in successfully:
1. Your session token is stored in localStorage
2. When you refresh or come back to the site, the session is automatically restored
3. You stay logged in until you click "Logout"

**How to verify it's working:**
1. Sign in to the app
2. Open browser Developer Tools (F12)
3. Go to **Application** tab
4. Click **Local Storage** > Your domain
5. Look for keys containing "auth" or "session"
6. This data means your session is persisted

## Authentication Flow

### Email/Password Sign In
1. User clicks "I'm a Client" or "I'm an Owner"
2. Opens auth dialog with email/password form
3. Enters credentials and clicks "Sign In"
4. Account verified in Supabase
5. Role checked from database
6. Redirected to correct dashboard (client or owner)

### Google OAuth Sign In
1. User clicks "Continue with Google"
2. Role (client/owner) stored in localStorage
3. Redirected to Google consent screen
4. User grants permission
5. Redirected back to app
6. Account linked to existing account or new account created
7. Role restored from localStorage
8. Redirected to correct dashboard

### Session Persistence
1. After login, session is in localStorage
2. When page refreshes, auth hook checks localStorage
3. Session restored automatically
4. No need to log in again
5. Session persists across browser sessions until logout

## Advanced: Browser Console Testing

### Check Current Session
```javascript
// Get current user
const { data } = await supabase.auth.getSession();
console.log('Current session:', data.session);
console.log('User:', data.session?.user);
```

### Test Google OAuth (without redirect)
```javascript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
    skipBrowserRedirect: true // Don't actually redirect
  }
});
console.log('OAuth error:', error);
```

### Check localStorage
```javascript
// View all localStorage keys
console.log('localStorage:', localStorage);

// Check for session token
const authToken = localStorage.getItem('sb-vplgtcguxujxwrgguxqq-auth-token');
console.log('Auth token exists:', !!authToken);
```

### Clear Session (for testing)
```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Still Having Issues?

1. **Run diagnostics again:** `await runOAuthDiagnostics()`
2. **Check console logs:** Open DevTools console (F12) and look for `[Auth]` or `[OAuth]` messages
3. **Clear and retry:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. **Try incognito mode:** Test in a fresh incognito/private window
5. **Contact support:** Provide the output of `runOAuthDiagnostics()`

## Key Files & Components

- **Auth Hook**: `src/hooks/useAuth.tsx` - Main authentication logic
- **Auth Dialog**: `src/components/AuthDialog.tsx` - Sign in/up UI
- **Supabase Client**: `src/integrations/supabase/client.ts` - Session config
- **Account Linking**: `src/hooks/useAccountLinking.tsx` - OAuth account handling
- **Diagnostics**: `src/utils/oauthDiagnostics.ts` - Diagnostic tool

## Configuration Checklist

- [ ] Supabase project created and accessible
- [ ] Google OAuth provider enabled in Supabase
- [ ] Google Client ID and Secret added to Supabase
- [ ] Redirect URLs configured in Supabase (include your domain)
- [ ] localStorage enabled in browser
- [ ] Private/Incognito mode disabled during testing
- [ ] Not behind a proxy that blocks OAuth
- [ ] Environment variables properly configured

## Support

If you've gone through this guide and still have issues:
1. Run `await runOAuthDiagnostics()` in console
2. Copy the output
3. Check browser console logs (Filter for `[Auth]` or `[OAuth]`)
4. Open a GitHub issue with the diagnostic output and error logs
