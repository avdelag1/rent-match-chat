# 🚀 TindeRent Deployment Guide

Complete guide to deploy your TindeRent app to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [Web Deployment (Vercel/Netlify)](#web-deployment)
4. [Android APK Build](#android-apk-build)
5. [Google Play Store Submission](#google-play-store)
6. [iOS Deployment](#ios-deployment)
7. [Post-Deployment](#post-deployment)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Completed Google OAuth setup (see `GOOGLE_OAUTH_SETUP.md`)
- [ ] Updated Privacy Policy with your contact information
- [ ] Updated Terms of Service with your business address
- [ ] Configured Supabase environment variables
- [ ] Tested the app thoroughly in development
- [ ] Created app icons and splash screens
- [ ] Set up error tracking (optional: Sentry)
- [ ] Set up analytics (optional: Google Analytics)

---

## Environment Variables

### Required Variables

Create a `.env.production` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Info
VITE_APP_NAME=TindeRent
VITE_APP_URL=https://yourdomain.com

# Optional: Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# Optional: Error Tracking
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Important**: Never commit `.env.production` to Git!

### Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Web Deployment

### Option 1: Vercel (Recommended - Free & Fast)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Build and Deploy

```bash
# Build the project
npm run build

# Login to Vercel
vercel login

# Deploy
vercel
```

#### 3. Set Environment Variables

```bash
# Add environment variables to Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Or set them in the Vercel dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add each variable

#### 4. Deploy to Production

```bash
vercel --prod
```

**Done!** Your app is live at `https://your-project.vercel.app`

#### Custom Domain (Optional)

1. Go to Vercel dashboard
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

---

### Option 2: Netlify (Alternative - Also Free)

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Build and Deploy

```bash
# Build the project
npm run build

# Login to Netlify
netlify login

# Deploy
netlify deploy
```

#### 3. Set Environment Variables

In Netlify dashboard:
1. Site settings → Build & deploy → Environment
2. Add environment variables

#### 4. Deploy to Production

```bash
netlify deploy --prod
```

---

### Option 3: Manual Hosting

For any static hosting service (AWS S3, GitHub Pages, etc.):

```bash
# Build the project
npm run build

# The dist/ folder contains your production-ready files
# Upload the contents of dist/ to your hosting service
```

**Important**: Configure redirects for single-page app routing!

Example for Netlify (`public/_redirects`):
```
/*    /index.html   200
```

Example for Vercel (`vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Android APK Build

### Prerequisites

- Android Studio installed
- Java JDK 11 or higher
- Android SDK configured

### Step 1: Sync Capacitor

```bash
# Install dependencies
npm install

# Build web app
npm run build

# Sync with Android
npx cap sync android
```

### Step 2: Update App Configuration

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.rentmatch.app"
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 3: Generate Signing Key

```bash
# Generate a keystore (do this ONCE and keep it safe!)
keytool -genkey -v -keystore tinderent-release-key.keystore \
  -alias tinderent -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT**:
- Store this keystore file securely (you'll need it for all future updates)
- Never commit it to Git
- Backup to a secure location

### Step 4: Configure Signing

Create `android/keystore.properties`:

```properties
storeFile=../tinderent-release-key.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=tinderent
keyPassword=YOUR_KEY_PASSWORD
```

Update `android/app/build.gradle`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 5: Build Release APK

#### Option A: Using Android Studio

1. Open Android Studio
2. Open the `android` folder
3. Build → Generate Signed Bundle / APK
4. Select **APK**
5. Choose your keystore
6. Build release
7. Find APK in `android/app/build/outputs/apk/release/`

#### Option B: Using Command Line

```bash
cd android
./gradlew assembleRelease
cd ..

# APK is located at:
# android/app/build/outputs/apk/release/app-release.apk
```

### Step 6: Test APK

```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or simply transfer the APK to your phone and install it
```

---

## Google Play Store Submission

### 1. Create Play Console Account

- Go to [Google Play Console](https://play.google.com/console)
- Pay one-time $25 registration fee
- Complete account setup

### 2. Create App Listing

1. **Create Application**
   - Click "Create app"
   - Enter app name: "TindeRent"
   - Select language and app/game category

2. **App Content**
   - Fill out questionnaire about app content
   - Add privacy policy URL (your deployed website/privacy-policy)
   - Declare ads (if applicable)

3. **Store Listing**
   - **Short description** (80 characters):
     ```
     Swipe to find your perfect property or ideal tenant. Tinder for rentals!
     ```

   - **Full description** (4000 characters):
     ```
     TindeRent revolutionizes property rentals with a simple swipe interface.

     FOR PROPERTY SEEKERS:
     • Swipe through properties like Tinder
     • Filter by location, price, amenities
     • Match with verified property owners
     • Chat and arrange viewings instantly

     FOR PROPERTY OWNERS:
     • List properties in minutes
     • Discover interested tenants
     • Match with quality applicants
     • Manage multiple listings easily

     FEATURES:
     • Smart matching algorithm
     • Real-time messaging
     • Property photos & virtual tours
     • Verified profiles
     • Secure and safe

     Download now and find your match!
     ```

4. **Graphics Assets** (Required):
   - App icon: 512 x 512 px
   - Feature graphic: 1024 x 500 px
   - Screenshots: At least 2 phone screenshots (1080 x 1920 px recommended)
   - Optional: Tablet screenshots, promotional video

5. **Contact Details**
   - Support email
   - Website (if available)
   - Phone number (optional)

6. **Upload APK/Bundle**
   - Go to Release → Production
   - Create new release
   - Upload your signed APK or AAB file
   - Add release notes

7. **Content Rating**
   - Complete the questionnaire
   - TindeRent should be rated "Everyone" or "Teen" depending on content

8. **Pricing & Distribution**
   - Select "Free"
   - Choose countries for distribution
   - Check required boxes

9. **Submit for Review**
   - Review all sections
   - Submit for review
   - Wait 1-7 days for approval

### 3. App Updates

For future updates:

1. Increment version in `build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.1"  // Semantic versioning
   ```

2. Build new APK
3. Upload to Play Console
4. Add release notes
5. Submit

---

## iOS Deployment

### Prerequisites

- macOS with Xcode
- Apple Developer Account ($99/year)
- Physical iPhone or iPad for testing

### Build iOS App

```bash
# Sync Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### Configure in Xcode

1. Update Bundle Identifier: `com.rentmatch.app`
2. Update version and build number
3. Configure signing & capabilities
4. Add app icon (AppIcon.appiconset)

### TestFlight & App Store

1. Create app in [App Store Connect](https://appstoreconnect.apple.com/)
2. Build archive in Xcode
3. Upload to App Store Connect
4. TestFlight for beta testing
5. Submit for App Store review

**Note**: iOS review is typically stricter and takes 1-3 days.

---

## Post-Deployment

### 1. Monitor Error Logs

- Check Supabase logs regularly
- Set up error tracking (Sentry, LogRocket)
- Monitor user feedback

### 2. Analytics Setup

Optional but recommended:

```bash
npm install @vercel/analytics
```

Add to `main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

### 3. Performance Monitoring

Use built-in Web Vitals monitoring in your app:
- Check `src/hooks/usePerformanceOptimization.tsx`
- Logs are stored in localStorage
- Integrate with analytics platform

### 4. User Feedback

Set up channels for user feedback:
- In-app feedback form
- Support email
- Social media monitoring
- App store reviews

### 5. Backup Strategy

- Regular Supabase database backups
- Store signing keys securely (1Password, LastPass)
- Document deployment process
- Keep credentials in secure vault

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Environment Variables Not Working

- Ensure `.env.production` exists
- Restart dev server after changes
- Check variable names start with `VITE_`
- Clear browser cache

### APK Not Installing

- Enable "Install unknown apps" on Android device
- Check minimum SDK version in `build.gradle`
- Verify APK is signed correctly

---

## Support & Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Supabase Docs**: https://supabase.com/docs

---

## Quick Reference

### Deploy Web (Vercel)
```bash
npm run build && vercel --prod
```

### Build Android APK
```bash
npm run build && npx cap sync android && cd android && ./gradlew assembleRelease
```

### Update App Version
```bash
# 1. Update version in package.json
# 2. Update versionCode/versionName in android/app/build.gradle
# 3. Rebuild and deploy
```

---

**Congratulations! Your TindeRent app is ready for the world! 🎉**

If you encounter any issues, refer to the troubleshooting section or check the official documentation links above.
