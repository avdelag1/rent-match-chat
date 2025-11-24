# 🚀 TindeRent CI/CD Pipeline Guide

Complete guide to your automated deployment pipeline.

---

## 📋 What Was Set Up

Your TindeRent app now has **fully automated CI/CD**:

### ✅ **What Happens Automatically:**

1. **Every time you push code to GitHub:**
   - ✅ Builds your web app
   - ✅ Runs TypeScript checks
   - ✅ Checks for security vulnerabilities
   - ✅ Creates build artifacts

2. **When you push to `main` branch:**
   - ✅ Everything above, PLUS:
   - ✅ Deploys to Vercel automatically
   - ✅ Builds Android debug APK
   - ✅ Makes APK available for download

3. **On pull requests:**
   - ✅ Builds and tests code
   - ✅ Prevents merging if build fails
   - ✅ Shows build status in PR

---

## 🔧 Initial Setup (One-Time)

### Step 1: Set Up Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Free for hobby projects

2. **Import Your Repository**
   - Click "Add New Project"
   - Select `rent-match-chat` repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add these:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your-anon-key-here
     ```
   - Get these from Supabase Dashboard → Settings → API

4. **Get Vercel Tokens** (for GitHub Actions)
   - Go to Vercel → Settings → Tokens
   - Create a new token
   - Name it "GitHub Actions"
   - Copy the token (you'll only see it once!)

5. **Get Project IDs**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```
   This creates `.vercel/project.json` with your IDs.

### Step 2: Add GitHub Secrets

1. **Go to GitHub Repository**
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"

2. **Add These Secrets:**
   ```
   VITE_SUPABASE_URL
   → Value: https://your-project.supabase.co

   VITE_SUPABASE_ANON_KEY
   → Value: your-anon-key-here

   VERCEL_TOKEN
   → Value: (token from Step 1.4)

   VERCEL_ORG_ID
   → Value: (from .vercel/project.json)

   VERCEL_PROJECT_ID
   → Value: (from .vercel/project.json)
   ```

**IMPORTANT:** Never commit these to Git!

---

## 🎯 How to Use CI/CD

### **Scenario 1: Deploy Web App**

```bash
# Make your changes
git add .
git commit -m "Add new feature"
git push origin main
```

**What happens:**
1. GitHub Actions starts building (1-3 min)
2. If build succeeds → Auto-deploys to Vercel
3. Your app is live in ~2 minutes! 🎉

**Check deployment:**
- GitHub: Actions tab shows build status
- Vercel: Dashboard shows deployment
- Your app: `https://your-app.vercel.app`

### **Scenario 2: Test Before Deploying**

```bash
# Create a feature branch
git checkout -b feature/new-swipe-ui

# Make changes
git add .
git commit -m "Improve swipe UI"
git push origin feature/new-swipe-ui

# Create Pull Request on GitHub
```

**What happens:**
1. GitHub Actions builds your code
2. Shows ✅ or ❌ in PR
3. Can't merge if build fails
4. Merge to `main` → auto-deploys

### **Scenario 3: Download Android APK**

Every push to `main` creates an Android APK:

1. Go to GitHub → Actions
2. Click on latest workflow run
3. Scroll down to "Artifacts"
4. Download `app-debug.apk`
5. Install on Android device

**Note:** This is a debug APK, not for Play Store.

---

## 📱 Building Release APK for Play Store

CI/CD builds **debug APKs only**. For Play Store, build manually:

### Option A: Local Build (Recommended)

```bash
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# In Android Studio:
# Build → Generate Signed Bundle/APK → Release
```

### Option B: Automated Release Build (Advanced)

Want CI/CD to build **release APKs** too? You need:

1. **Upload signing keys to GitHub Secrets**
2. **Create keystore credentials**
3. **Modify `.github/workflows/ci-cd.yml`**

See "Advanced: Automated Release Builds" section below.

---

## 🔍 Monitoring Your Pipeline

### Check Build Status

**GitHub:**
- Repository → Actions tab
- Shows all workflow runs
- Click on a run to see details
- Download build artifacts

**Vercel:**
- Dashboard shows all deployments
- Click deployment to see logs
- Can roll back to previous versions

### Build Status Badge

Add to your README.md:

```markdown
![CI/CD](https://github.com/avdelag1/rent-match-chat/actions/workflows/ci-cd.yml/badge.svg)
```

Shows: ![CI/CD](https://img.shields.io/badge/build-passing-brightgreen)

---

## 🐛 Troubleshooting

### Build Fails on GitHub Actions

**Error: "VITE_SUPABASE_URL is not defined"**

**Fix:**
1. Go to GitHub → Settings → Secrets
2. Make sure `VITE_SUPABASE_URL` is set
3. Re-run the workflow

---

**Error: "npm ERR! code ENOENT"**

**Fix:**
1. Check `package.json` has all dependencies
2. Push updated `package-lock.json`
3. GitHub Actions will use correct versions

---

**Error: "Vercel deployment failed"**

**Fix:**
1. Check `VERCEL_TOKEN` is valid
2. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Re-run workflow

---

### Deployment Works But App Broken

**Check environment variables:**

```bash
# Local works, production broken?
# → Vercel env variables are wrong

# Go to Vercel → Settings → Environment Variables
# Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
# Redeploy
```

---

### Android Build Fails

**Error: "gradlew: command not found"**

**Fix:** Android build only works on Linux/Mac. On Windows:
1. Use WSL (Windows Subsystem for Linux)
2. Or build locally in Android Studio
3. Or use cloud CI/CD (GitHub Actions)

---

## ⚙️ Advanced: Automated Release Builds

Want GitHub Actions to build **signed release APKs**?

### Step 1: Create GitHub Secrets

Add these to GitHub → Settings → Secrets:

```
ANDROID_KEYSTORE_BASE64
→ Base64-encoded keystore file

KEYSTORE_PASSWORD
→ Your keystore password

KEY_ALIAS
→ Your key alias (usually "release")

KEY_PASSWORD
→ Your key password
```

### Step 2: Encode Keystore

```bash
# On your computer (where keystore is)
base64 -i tinderent-release-key.keystore | pbcopy
# (pbcopy copies to clipboard on Mac)

# On Linux:
base64 -w 0 tinderent-release-key.keystore

# Paste this into ANDROID_KEYSTORE_BASE64 secret
```

### Step 3: Update Workflow

Edit `.github/workflows/ci-cd.yml`:

```yaml
- name: Decode Keystore
  run: |
    echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore

- name: Build Release APK
  run: |
    cd android
    ./gradlew assembleRelease \
      -Pandroid.injected.signing.store.file=../app/release.keystore \
      -Pandroid.injected.signing.store.password=${{ secrets.KEYSTORE_PASSWORD }} \
      -Pandroid.injected.signing.key.alias=${{ secrets.KEY_ALIAS }} \
      -Pandroid.injected.signing.key.password=${{ secrets.KEY_PASSWORD }}
    cd ..

- name: Upload Release APK
  uses: actions/upload-artifact@v4
  with:
    name: app-release.apk
    path: android/app/build/outputs/apk/release/app-release.apk
```

Now every push to `main` creates a **signed release APK**!

---

## 🚀 Advanced: Auto-Upload to Play Store

Want to **automatically upload to Google Play**?

### Using Fastlane

```bash
# Install Fastlane
gem install fastlane

# Initialize
cd android
fastlane init

# Configure Play Store upload
# See: https://docs.fastlane.tools/actions/upload_to_play_store/
```

This is complex and requires:
- Google Play Service Account JSON
- Play Store API access
- Fastlane configuration

**For most apps, manual upload is easier.**

---

## 📊 Performance Monitoring

### Add Build Time Monitoring

See how long builds take:

```yaml
- name: Build with timing
  run: |
    START=$(date +%s)
    npm run build
    END=$(date +%s)
    echo "Build time: $((END-START)) seconds"
```

### Add Size Monitoring

Check bundle size:

```yaml
- name: Check bundle size
  run: |
    du -sh dist/
    du -sh dist/assets/*.js | sort -h
```

---

## 🎉 Summary

### What You Have Now:

✅ **Automatic web deploys** - Push to `main` → Live in 2 minutes
✅ **Build checks** - Can't merge broken code
✅ **Android APKs** - Available for download after every deploy
✅ **Security checks** - npm audit runs automatically
✅ **TypeScript checks** - Catches type errors before deploy

### Workflow:

```
1. Edit code locally
2. Push to GitHub
3. GitHub Actions builds
4. If main branch → Vercel deploys
5. Download APK from Actions artifacts
6. Manual Play Store upload
```

### Cost:

- ✅ **GitHub Actions:** 2,000 min/month FREE
- ✅ **Vercel:** Unlimited deployments FREE (hobby plan)
- ✅ **Supabase:** Free tier is generous

**Total: $0/month** 🎉

---

## 🔗 Useful Links

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Vercel Docs:** https://vercel.com/docs
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Fastlane Docs:** https://docs.fastlane.tools

---

## 💡 Pro Tips

1. **Use branch protection** to require CI checks before merging
2. **Monitor Action usage** - GitHub shows minutes used
3. **Cache dependencies** for faster builds (already configured)
4. **Use dependabot** to keep dependencies updated
5. **Set up status checks** in Slack/Discord for notifications

---

## 🆘 Need Help?

**Build failing?**
1. Check GitHub Actions logs
2. Run `npm run build` locally
3. Check secrets are set correctly

**Deployment not working?**
1. Check Vercel logs
2. Verify environment variables
3. Check domain settings

**APK not building?**
1. Check Java version (need 17)
2. Check gradle permissions (`chmod +x android/gradlew`)
3. Check Android SDK is configured

---

**You now have a professional CI/CD pipeline! 🚀**

Every code push is:
- ✅ Tested automatically
- ✅ Built automatically
- ✅ Deployed automatically (if main branch)
- ✅ Creating Android APKs

**No more manual builds for web!**

---

## Quick Reference

### Deploy Web App
```bash
git push origin main
# Done! Live in 2 minutes
```

### Get Android APK
```bash
# Push code
git push origin main

# Go to: GitHub → Actions → Download artifact
```

### Manual Android Release
```bash
npm run build
npx cap sync android
npx cap open android
# Build → Generate Signed Bundle
```

---

**Questions? Check the Troubleshooting section or DEPLOYMENT_GUIDE.md**
