# Supabase Email Settings Configuration

This guide explains how to configure Supabase email settings for password reset and email confirmation features.

## Overview

The application uses Supabase Auth for user authentication, which includes:
- Email confirmation for new signups
- Password reset via email
- Resend confirmation email feature

## Supabase Dashboard Configuration

### 1. Enable Email Confirmations

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Auth Providers**, find **Email**
4. Enable the following options:
   - ✅ **Enable email confirmations** - Users must verify their email before logging in
   - ✅ **Enable email provider** - Allow users to sign up with email/password

### 2. Configure Email Templates

1. In the Authentication settings, go to **Email Templates**
2. You can customize the following templates:
   - **Confirm signup** - Sent when a user signs up
   - **Reset password** - Sent when a user requests a password reset
   - **Magic Link** - Sent for passwordless login (if enabled)

### 3. Email Template Variables

For the **Reset Password** template, ensure the redirect URL is set correctly:
```
{{ .ConfirmationURL }}
```

The app automatically sets the redirect URL to:
```
${window.location.origin}/reset-password
```

### 4. SMTP Settings (Production)

For production environments, configure custom SMTP settings:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (e.g., SendGrid, AWS SES, Mailgun)
3. Required settings:
   - **Host**: Your SMTP host
   - **Port**: Usually 587 (TLS) or 465 (SSL)
   - **Username**: SMTP username
   - **Password**: SMTP password
   - **Sender email**: The email address that will send auth emails
   - **Sender name**: Display name for the sender

**Note**: Supabase provides a default email service for development, but it's recommended to use a custom SMTP provider for production to ensure email deliverability.

## Application Features

### Password Reset Flow

1. User clicks "Forgot password?" on the login dialog
2. User enters their email address
3. Supabase sends a password reset email
4. User clicks the link in the email
5. User is redirected to `/reset-password` page
6. User enters and confirms new password
7. Password is updated in Supabase

**Implementation**: See `src/components/AuthDialog.tsx` (lines 90-127)

### Change Password (Logged-in Users)

1. Navigate to Security settings:
   - **Clients**: `/client/security`
   - **Owners**: `/owner/security`
2. Click "Change Password" button
3. Enter current password, new password, and confirm
4. Password is validated and updated

**Implementation**: See `src/components/AccountSecurity.tsx` (lines 64-150)

### Resend Confirmation Email

1. If a user tries to log in with an unconfirmed email, they see an error
2. A "Resend confirmation email" button appears
3. User clicks the button
4. A new confirmation email is sent

**Implementation**: See `src/components/AuthDialog.tsx` (handleResendConfirmation function)

## Troubleshooting

### Email Confirmations Not Required

**Issue**: Users can log in without confirming their email

**Solution**:
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Confirm email" under Email Auth
3. Save changes

### Reset Password Emails Not Sending

**Issue**: Users don't receive password reset emails

**Solutions**:
1. Check spam/junk folders
2. Verify SMTP settings in Supabase dashboard
3. Check Supabase logs for email delivery errors
4. For production, ensure custom SMTP is configured
5. Verify the sender email is not blacklisted

### Redirect URL Mismatch

**Issue**: Password reset redirects to wrong URL

**Solution**:
1. Check that the redirect URL in `AuthDialog.tsx` matches your domain
2. Verify allowed redirect URLs in Supabase:
   - Go to Authentication → Settings → Redirect URLs
   - Add your production domain: `https://yourdomain.com/reset-password`
   - Add localhost for development: `http://localhost:3000/reset-password`

### Email Delivery Rate Limits

**Issue**: Too many emails being sent

**Solution**:
- Supabase has rate limits on email sending
- For development: ~30 emails per hour
- For production with custom SMTP: Depends on your provider
- Implement client-side rate limiting for resend buttons

## Security Considerations

1. **Password Requirements**:
   - Minimum 8 characters
   - Combination of uppercase, lowercase, and numbers recommended
   - See password strength indicator in signup/reset forms

2. **Current Password Verification**:
   - When changing password, users must enter current password
   - Provides defense against session hijacking
   - Implementation in `AccountSecurity.tsx` (lines 104-118)

3. **Email Verification**:
   - Always keep "Confirm email" enabled in production
   - Prevents fake signups and ensures valid contact information

4. **Rate Limiting**:
   - Supabase automatically rate limits authentication attempts
   - Add client-side debouncing for resend buttons

## Testing

### Test Email Confirmation Flow

1. Sign up with a new email
2. Check inbox for confirmation email
3. Click confirmation link
4. Verify you can now log in

### Test Password Reset Flow

1. Click "Forgot password?"
2. Enter email and submit
3. Check inbox for reset email
4. Click reset link
5. Enter new password
6. Verify you can log in with new password

### Test Resend Confirmation

1. Sign up with a new email
2. Try to log in without confirming email
3. Click "Resend confirmation email"
4. Verify new email is received

## Related Files

- `src/components/AuthDialog.tsx` - Login/signup dialog with forgot password and resend confirmation
- `src/pages/ResetPassword.tsx` - Password reset page
- `src/components/AccountSecurity.tsx` - Change password for logged-in users
- `src/pages/ClientSecurity.tsx` - Client security settings page
- `src/pages/OwnerSecurity.tsx` - Owner security settings page
- `src/schemas/auth.ts` - Authentication validation schemas
