# SIMPLE SIGNUP FIX (Try This FIRST)

The "Database error saving new user" error is usually caused by **email confirmation being enabled without SMTP configured**.

## ✅ Quick Fix (2 minutes - NO SQL needed):

### Go to Supabase Dashboard:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Authentication** (left sidebar)
4. **Click "Providers"**
5. **Click "Email"**
6. **Scroll down to "Confirm email"**
7. **Toggle it OFF** (disable it)
8. **Click "Save"**

### Try Signup Again:

Open your app and try to sign up. It should work immediately.

---

## If That Doesn't Work:

Then the issue IS the database RLS policies. Run `REAL_SIGNUP_FIX.sql`:

1. Go to **Supabase Dashboard → SQL Editor**
2. Click **"New Query"**
3. **Copy all of REAL_SIGNUP_FIX.sql**
4. **Paste and Run**
5. **Try signup again**

---

## Why This Happens:

- Supabase sends a confirmation email when users sign up
- If SMTP is not configured, the email fails to send
- This causes signup to fail with "Database error"
- Disabling email confirmation bypasses this entirely

## After Fixing:

Once signup works, you can:
- Configure SMTP properly (SendGrid, AWS SES, etc.)
- Re-enable email confirmation
- Users will get welcome emails

---

**TL;DR: Go to Supabase Dashboard → Authentication → Providers → Email → Turn OFF "Confirm email" → Save → Try signup**
