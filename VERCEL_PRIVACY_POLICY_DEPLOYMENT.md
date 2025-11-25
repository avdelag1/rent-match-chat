# Deploy Privacy Policy to Vercel - Quick Guide

## ✅ Current Status
- All privacy policy files are ready on the `claude/optimize-studio-performance-01TEu8atBWauF7R3mWnazGdo` branch
- Build passes successfully (tested and verified)
- Privacy policy URL will be: `https://[your-app].vercel.app/privacy-policy`

## 📋 Quick Steps to Deploy on Vercel

### Option 1: Deploy from Claude Branch (RECOMMENDED - Fastest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your "rent-match-chat" project (or create new project if first time)

2. **Configure Git Branch**
   - Go to: Settings → Git
   - Change "Production Branch" from `main` to `claude/optimize-studio-performance-01TEu8atBWauF7R3mWnazGdo`
   - Save changes

3. **Trigger Deployment**
   - Go to "Deployments" tab
   - Click "Redeploy" (or it will auto-deploy on next push)
   - Wait 2-3 minutes for build to complete

4. **Get Your Privacy Policy URL**
   - Once deployed, your URL will be:
   - **Privacy Policy**: `https://[your-app].vercel.app/privacy-policy`
   - **Terms of Service**: `https://[your-app].vercel.app/terms-of-service`
   - Use this URL in Google Play Store submission!

### Option 2: Import New Project

If you don't have Vercel set up yet:

1. **Visit Vercel**
   - Go to: https://vercel.com/new
   - Click "Import Project"

2. **Connect GitHub**
   - Select "Import Git Repository"
   - Choose: `avdelag1/rent-match-chat`
   - Branch: `claude/optimize-studio-performance-01TEu8atBWauF7R3mWnazGdo`

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `./`

4. **Add Environment Variables**
   Go to "Environment Variables" section and add:
   ```
   VITE_SUPABASE_URL=https://vplgtcguxujxwrgguxqq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbGd0Y2d1eHVqeHdyZ2d1eHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4Njc4NzcsImV4cCI6MjA0MjQ0Mzg3N30.eUCPDJJfkm3g_sqb8kQOjxI-MtUQtPK_6wSLn-fE13k
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL!

## 🎯 For Google Play Store Submission

Use this information:

- **Privacy Policy URL**: `https://[your-vercel-app].vercel.app/privacy-policy`
- **Terms of Service URL**: `https://[your-vercel-app].vercel.app/terms-of-service`
- **Contact Email**: villarrealdg@gmail.com

## ✅ What's Already Done

All these files are ready on the Claude branch:

- ✅ `public/privacy-policy.md` - Complete privacy policy (GDPR, CCPA, LFPDPPP compliant)
- ✅ `public/terms-of-service.md` - Complete terms of service
- ✅ `src/pages/PrivacyPolicy.tsx` - Privacy policy page component
- ✅ `src/pages/TermsOfService.tsx` - Terms page component
- ✅ `src/App.tsx` - Routes configured for `/privacy-policy` and `/terms-of-service`
- ✅ All merge conflicts fixed
- ✅ All builds passing
- ✅ Contact info updated to: villarrealdg@gmail.com

## 🚀 After Deployment

1. Visit your deployed privacy policy at: `https://[your-app].vercel.app/privacy-policy`
2. Copy the full URL
3. Paste it into Google Play Store Console
4. Submit your app! 🎉

## 📝 Notes

- Vercel deployments are FREE for hobby projects
- SSL/HTTPS is automatic (required by Play Store)
- Updates to the privacy policy will auto-deploy when you push to the branch
- You can change the production branch back to `main` after Google Play approval if needed
