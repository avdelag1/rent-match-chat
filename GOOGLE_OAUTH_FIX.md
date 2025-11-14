# Google OAuth Sign-In Fix Guide

## Current Implementation Status

The Google OAuth code is correctly implemented in the codebase:
- **Location**: `src/hooks/useAuth.tsx` (lines 303-354)
- **Implementation**: Uses Supabase's `signInWithOAuth` with proper role handling
- **Role Storage**: Stores pending role in localStorage before redirect

## Why Google OAuth Might Not Be Working

### 1. **Supabase Dashboard Configuration** (Most Likely Issue)

#### Required Settings in Supabase Dashboard:
1. Navigate to: Authentication → Providers → Google
2. **Enable Google Provider**: Must be toggled ON
3. **OAuth Client ID**: Must be configured with your Google OAuth 2.0 credentials
4. **OAuth Client Secret**: Must be configured

#### Google Cloud Console Setup:
1. Go to: https://console.cloud.google.com/
2. Select your project or create a new one
3. Navigate to: APIs & Services → Credentials
4. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `https://your-production-domain.com`
   - **Authorized redirect URIs**:
     - `https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback`
     - Add your production domain callback URL

5. Copy Client ID and Client Secret to Supabase Dashboard

### 2. **Redirect URL Configuration**

#### Current redirect in code:
```typescript
redirectTo: `${window.location.origin}/`
```

#### Verify in Supabase:
1. Go to: Authentication → URL Configuration
2. **Site URL**: Must match your production domain
3. **Redirect URLs**: Add:
   - `http://localhost:5173/` (for dev)
   - `https://your-production-domain.com/` (for prod)

### 3. **OAuth Consent Screen** (Google Cloud Console)

1. Navigate to: APIs & Services → OAuth consent screen
2. **User Type**: Select "External" for public access
3. **App name**: "Tinderent" or your app name
4. **User support email**: Your support email
5. **Developer contact information**: Your email
6. **Scopes**: Add:
   - `userinfo.email`
   - `userinfo.profile`
7. **Test users**: Add test emails if app is in testing mode
8. **Publishing status**:
   - **Testing**: Only test users can sign in
   - **Production**: Anyone can sign in (requires verification for sensitive scopes)

### 4. **Common Error Messages & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| "Provider not enabled" | Google OAuth not enabled in Supabase | Enable in Supabase Dashboard → Auth → Providers |
| "redirect_uri_mismatch" | Redirect URL not whitelisted | Add redirect URL in Google Console AND Supabase |
| "access_denied" | User cancelled OAuth flow | Normal behavior - no fix needed |
| "invalid_client" | Wrong Client ID/Secret | Double-check credentials in Supabase Dashboard |
| 403 Error | App not verified or in testing mode | Add user as test user in Google Console |

## Testing Steps

### 1. **Test Locally**
```bash
npm run dev
```
- Click "Continue with Google" button
- Should redirect to Google login
- After login, should redirect back to app with user authenticated

### 2. **Check Console Logs**
Open browser DevTools Console and look for:
```
[OAuth] Starting google OAuth for role: client (or owner)
[OAuth] google OAuth initiated successfully
```

If you see errors, they will indicate the specific issue.

### 3. **Verify Supabase Logs**
1. Go to Supabase Dashboard
2. Navigate to: Authentication → Logs
3. Look for recent OAuth attempts and any error messages

## Code Implementation (Already Correct)

The current implementation in `src/hooks/useAuth.tsx` is correct:

```typescript
const signInWithOAuth = async (provider: 'google', role: 'client' | 'owner') => {
  try {
    // Store role before redirect
    localStorage.setItem('pendingOAuthRole', role);

    // Build OAuth options
    const queryParams: Record<string, string> = {
      prompt: 'consent',
      access_type: 'offline',
    };

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams
      }
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    localStorage.removeItem('pendingOAuthRole');
    // Error handling...
  }
};
```

## Quick Checklist

- [ ] Google OAuth is enabled in Supabase Dashboard
- [ ] OAuth Client ID configured in Supabase
- [ ] OAuth Client Secret configured in Supabase
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 Client ID created in Google Console
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added (Supabase callback URL)
- [ ] OAuth consent screen configured
- [ ] Test users added (if in testing mode)
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs whitelisted in Supabase

## If Still Not Working

1. **Check Supabase Auth Logs** for specific errors
2. **Test with a different browser** (clear cache/cookies)
3. **Verify environment variables** are loaded correctly
4. **Check browser console** for JavaScript errors
5. **Contact Supabase support** if configuration looks correct but still failing

## Alternative: Use Email/Password Authentication

If Google OAuth continues to have issues, email/password authentication is fully functional and can be used as a fallback.
