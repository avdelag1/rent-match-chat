# ⚡ QUICK FIX: OAuth Not Working - 5 Minute Solution

## 🎯 You Have OAuth Enabled - But Missing ONE Thing!

Your Google and Facebook OAuth providers are **enabled** with **correct credentials**.

**The problem**: Supabase doesn't know where to redirect users after OAuth succeeds.

---

## ✅ THE FIX (5 minutes)

### Go Here RIGHT NOW:
👉 **https://supabase.com/dashboard/project/vplgtcguxujxwrgguxqq/auth/url-configuration**

### Set These TWO Fields:

#### 1. Site URL
```
https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com
```

#### 2. Redirect URLs (copy-paste all lines)
```
https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com
https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com/
https://686673c3-e550-4efd-907e-ac52efe85ffc.lovableproject.com/**
http://localhost:3000
http://localhost:3000/
http://localhost:5173
http://localhost:5173/
```

### Click **SAVE**

---

## 🧪 Test It

1. Clear browser cache
2. Go to your app
3. Click "Continue with Google" or "Continue with Facebook"
4. Should work! ✅

---

## ⚠️ Still Not Working?

Check these 2 things:

### 1. Google Cloud Console
👉 https://console.cloud.google.com/apis/credentials

**Find OAuth Client**: `717945237189-fiancec8s9q4ga4tu5erq2ptur9c7pt7`

**Authorized redirect URIs** must include:
```
https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback
```

### 2. Facebook Developers
👉 https://developers.facebook.com/apps/726601586522621

**Facebook Login → Settings**

**Valid OAuth Redirect URIs** must include:
```
https://vplgtcguxujxwrgguxqq.supabase.co/auth/v1/callback
```

---

## 📊 Why This Happens

**OAuth Flow**:
1. User clicks "Login with Google" ✅
2. User approves on Google ✅
3. Google sends user back to Supabase ✅
4. Supabase tries to redirect to your app... ❌ **WHERE?**

**Without Site URL configured**: Supabase doesn't know where to send the user!

**With Site URL configured**: Supabase redirects to your app ✅

---

## 🚀 That's It!

**99% of OAuth issues** = Missing Site URL in Supabase

**1 minute to fix** = Add Site URL

**Done!** = OAuth works perfectly

---

**Need detailed help?** See `OAUTH_FIX_GUIDE.md`
