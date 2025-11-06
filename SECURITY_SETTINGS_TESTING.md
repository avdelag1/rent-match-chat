# Security Settings Feature - Testing Guide

## Overview
This document provides testing instructions for the new persistent security settings feature.

## Features Implemented

1. **Database Persistence**: Security settings are now stored in Supabase and persist across sessions
2. **Security Menu Item**: Added to Settings menu for both Client and Owner roles
3. **Deep Linking**: Direct navigation to Security tab via URL parameters
4. **Performance**: Route prefetching for faster page loads

## Manual Testing Checklist

### Database & Persistence

- [ ] **First Time User**
  1. Login as a new user (client or owner)
  2. Navigate to Settings → Security tab
  3. Verify default settings are displayed:
     - Two-Factor Authentication: OFF
     - Login Alerts: ON
     - Session Timeout: ON
     - Device Tracking: ON
  4. Security Score should show 50/100

- [ ] **Toggle Settings**
  1. Toggle each security setting ON/OFF
  2. Verify no errors in console
  3. Check that changes are reflected immediately in UI
  4. Verify Security Score updates based on enabled features

- [ ] **Persistence Test**
  1. Toggle some settings (e.g., enable 2FA, disable Login Alerts)
  2. Navigate away from the page
  3. Navigate back to Settings → Security
  4. Verify settings are preserved
  5. Logout and login again
  6. Navigate to Settings → Security
  7. Verify settings are still preserved

### Navigation & Deep Linking

- [ ] **Settings Menu Access**
  1. As Client: Tap Settings icon (bottom right) → Open menu
  2. Verify "Security" appears as first menu item with shield icon
  3. Tap Security → Should navigate to `/client/settings?tab=security`
  4. Verify Security tab is active
  
  5. As Owner: Tap Settings icon (bottom right) → Open menu
  6. Verify "Security" appears as first menu item with shield icon
  7. Tap Security → Should navigate to `/owner/settings?tab=security`
  8. Verify Security tab is active

- [ ] **Deep Linking**
  1. Manually navigate to `/client/settings?tab=security`
  2. Verify Security tab is immediately active (not Profile)
  3. Manually navigate to `/owner/settings?tab=security`
  4. Verify Security tab is immediately active
  
- [ ] **URL Synchronization**
  1. Navigate to `/client/settings` (no tab param)
  2. Click on different tabs (Profile, Preferences, Security, etc.)
  3. Verify URL updates with `?tab=<tabname>` parameter
  4. Use browser back/forward buttons
  5. Verify tabs change correctly based on URL

### Both Roles Testing

- [ ] **Client Role**
  1. Login as client
  2. Verify Security menu item appears in Settings menu
  3. Navigate to Security tab from menu
  4. Toggle all security settings
  5. Verify persistence after logout/login
  6. Test deep link: `/client/settings?tab=security`

- [ ] **Owner Role**
  1. Login as owner
  2. Verify Security menu item appears in Settings menu
  3. Navigate to Security tab from menu
  4. Toggle all security settings
  5. Verify persistence after logout/login
  6. Test deep link: `/owner/settings?tab=security`

### Performance Testing

- [ ] **Route Prefetching**
  1. Navigate to dashboard
  2. Hover over "Messages" icon in bottom navigation
  3. Open browser DevTools → Network tab
  4. Verify messaging route is prefetched in background
  5. Click "Messages" → Should load instantly

- [ ] **Page Load Speed**
  1. Navigate to Settings → Security
  2. Verify loading spinner appears briefly if needed
  3. Page should load quickly (< 2 seconds)
  4. No console errors

### UI/UX Testing

- [ ] **Visual Consistency**
  1. Verify Security tab looks identical to before (no visual changes)
  2. All switches should be responsive
  3. Security score bar should update smoothly
  4. Card layouts should match other tabs

- [ ] **Loading States**
  1. Navigate to Security tab
  2. Verify loading spinner appears while fetching settings
  3. Toggle a setting immediately after page load
  4. Verify "saving" state is indicated (switch disabled)

- [ ] **Error Handling**
  1. Disable network in DevTools
  2. Try to toggle a setting
  3. Verify error toast appears
  4. Enable network
  5. Try again → Should work

### Database Validation

- [ ] **RLS Policies**
  1. Verify users can only see their own settings
  2. Verify users cannot modify other users' settings
  3. Test with two different user accounts

- [ ] **Migration**
  1. Check that migration file exists: `supabase/migrations/20251106030900_create_user_security_settings.sql`
  2. Verify table structure in Supabase dashboard
  3. Confirm RLS policies are enabled

## Expected Behavior

### Security Score Calculation
- Base: 50 points
- 2FA Enabled: +25 points
- Login Alerts: +10 points
- Session Timeout: +10 points
- Device Tracking: +5 points
- Maximum: 100 points

### Default Settings
- Two-Factor Authentication: `false`
- Login Alerts: `true`
- Session Timeout: `true`
- Device Tracking: `true`

## Common Issues & Solutions

### Settings Not Persisting
- Check browser console for errors
- Verify Supabase connection is active
- Check RLS policies in Supabase dashboard
- Ensure user is authenticated

### Deep Link Not Working
- Verify URL format is correct: `/client/settings?tab=security` or `/owner/settings?tab=security`
- Check React Router is handling the route
- Ensure tab name matches exactly (case-sensitive)

### Menu Item Not Appearing
- Clear browser cache
- Verify correct user role (client or owner)
- Check SettingsBottomSheet component loaded correctly

## Database Schema

Table: `user_security_settings`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | UUID | gen_random_uuid() | Primary key |
| user_id | UUID | - | Foreign key to auth.users |
| two_factor_enabled | BOOLEAN | false | 2FA status |
| login_alerts | BOOLEAN | true | Login notification setting |
| session_timeout | BOOLEAN | true | Auto-logout setting |
| device_tracking | BOOLEAN | true | Device monitoring setting |
| created_at | TIMESTAMPTZ | now() | Record creation time |
| updated_at | TIMESTAMPTZ | now() | Last update time |

## Success Criteria

✅ All security settings persist across sessions
✅ Security menu item appears for both client and owner roles
✅ Deep linking works for both `/client/settings?tab=security` and `/owner/settings?tab=security`
✅ URL parameters sync with tab changes
✅ No visual changes to existing UI
✅ No console errors
✅ No security vulnerabilities (verified by CodeQL)
✅ Page loads quickly with prefetching
