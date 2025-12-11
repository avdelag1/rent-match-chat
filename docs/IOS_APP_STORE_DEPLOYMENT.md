# Tinderent iOS App Store Deployment Guide

Complete guide to deploy Tinderent to the Apple App Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Apple Developer Account](#apple-developer-account)
3. [Generate App Icons and Assets](#generate-app-icons-and-assets)
4. [Build the iOS Project](#build-the-ios-project)
5. [Configure Xcode Project](#configure-xcode-project)
6. [App Store Connect Setup](#app-store-connect-setup)
7. [Submit for Review](#submit-for-review)
8. [Common Issues and Solutions](#common-issues-and-solutions)

---

## Prerequisites

### Required Software

1. **Mac computer** with macOS Ventura 13.0 or later
2. **Xcode 15+** (download from Mac App Store)
3. **Node.js 18+** and npm
4. **CocoaPods** (for iOS dependencies)

```bash
# Install CocoaPods
sudo gem install cocoapods

# Or with Homebrew
brew install cocoapods
```

5. **ImageMagick** (for generating icons)

```bash
brew install imagemagick
```

### Required Accounts

- **Apple Developer Account** ($99/year) - [developer.apple.com/programs](https://developer.apple.com/programs)

---

## Apple Developer Account

### Step 1: Enroll in the Apple Developer Program

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs)
2. Click **"Enroll"**
3. Sign in with your Apple ID (same as your iPhone)
4. Choose **"Individual"** enrollment type
5. Fill in your personal information
6. Accept the license agreement
7. Pay **$99 USD** (credit/debit card or PayPal)
8. Wait for approval (usually within 48 hours)

### Step 2: Set Up Certificates

After enrollment is approved:

1. Go to [developer.apple.com/account](https://developer.apple.com/account)
2. Navigate to **Certificates, IDs & Profiles**
3. Create a **Distribution Certificate**:
   - Click **+** → **Apple Distribution**
   - Follow the Certificate Signing Request (CSR) instructions in Keychain Access
   - Download and install the certificate

### Step 3: Create App ID

1. In **Certificates, IDs & Profiles** → **Identifiers**
2. Click **+** to add a new identifier
3. Select **App IDs** → **App**
4. Configure:
   - **Description**: `Tinderent`
   - **Bundle ID**: `com.tinderent.app` (Explicit)
5. Enable capabilities:
   - ✅ Push Notifications
   - ✅ Associated Domains (for deep linking)
   - ✅ Sign In with Apple (optional)

### Step 4: Create Provisioning Profile

1. Navigate to **Profiles**
2. Click **+** → **App Store Connect**
3. Select your App ID (`com.tinderent.app`)
4. Select your Distribution Certificate
5. Download the profile (`.mobileprovision`)

---

## Generate App Icons and Assets

### Option 1: Use the Provided Script

```bash
# Make the script executable
chmod +x scripts/generate-ios-assets.sh

# Run the script (requires ImageMagick)
./scripts/generate-ios-assets.sh
```

This generates:
- All required app icons in `public/icons/`
- All splash screens in `public/splash/`
- Capacitor resources in `resources/`

### Option 2: Manual Icon Generation

If you have a 1024x1024 PNG icon, use these tools:
- [App Icon Generator](https://appicon.co/)
- [Make App Icon](https://makeappicon.com/)

Place the generated icons in `public/icons/`.

### Required Icon Sizes for iOS

| Size | Usage |
|------|-------|
| 20x20 | Notification icon (2x, 3x) |
| 29x29 | Settings icon (2x, 3x) |
| 40x40 | Spotlight icon (2x, 3x) |
| 60x60 | App icon (2x, 3x) |
| 76x76 | iPad app icon (1x, 2x) |
| 83.5x83.5 | iPad Pro icon (2x) |
| 1024x1024 | App Store |

---

## Build the iOS Project

### Step 1: Install Dependencies

```bash
# Install npm packages
npm install

# Install iOS-specific Capacitor plugins
npm install @capacitor/splash-screen @capacitor/keyboard @capacitor/app
```

### Step 2: Build the Web App

```bash
# Production build
npm run build
```

### Step 3: Add iOS Platform

```bash
# Add iOS platform (first time only)
npx cap add ios

# Sync web code to iOS
npx cap sync ios
```

### Step 4: Install iOS Dependencies

```bash
cd ios/App
pod install
cd ../..
```

---

## Configure Xcode Project

### Step 1: Open in Xcode

```bash
npx cap open ios
```

### Step 2: Configure Project Settings

In Xcode, select the **App** project in the navigator:

1. **General Tab**:
   - Display Name: `Tinderent`
   - Bundle Identifier: `com.tinderent.app`
   - Version: `1.0.0`
   - Build: `1`
   - Minimum Deployments: iOS 14.0+

2. **Signing & Capabilities Tab**:
   - Team: Select your Apple Developer Team
   - Enable "Automatically manage signing"
   - Or manually select your provisioning profile

3. **Add Capabilities** (click **+ Capability**):
   - Push Notifications
   - Associated Domains (add `applinks:tinderent.lovable.app`)
   - Background Modes → Remote notifications

### Step 3: Configure Info.plist

Add these entries to `ios/App/App/Info.plist`:

```xml
<!-- Camera and Photo Library Access -->
<key>NSCameraUsageDescription</key>
<string>Tinderent needs camera access to take photos for your profile and property listings.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Tinderent needs photo library access to upload images for your profile and property listings.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Tinderent needs permission to save photos to your library.</string>

<!-- Location Access (if using location features) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Tinderent uses your location to show nearby rental properties.</string>

<!-- Push Notifications -->
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>

<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>supabase.co</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSThirdPartyExceptionAllowsInsecureHTTPLoads</key>
            <false/>
        </dict>
    </dict>
</dict>
```

### Step 4: Configure App Icons in Xcode

1. Open `ios/App/App/Assets.xcassets`
2. Click **AppIcon**
3. Drag your icons to each slot or use the generated icons

---

## App Store Connect Setup

### Step 1: Create App in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Configure:
   - **Platform**: iOS
   - **Name**: `Tinderent`
   - **Primary Language**: English (US)
   - **Bundle ID**: `com.tinderent.app`
   - **SKU**: `tinderent-ios-001`
   - **User Access**: Full Access

### Step 2: App Information

Fill in required fields:

| Field | Value |
|-------|-------|
| **Name** | Tinderent - Find Your Perfect Rental |
| **Subtitle** | Match with rentals & tenants |
| **Category** | Lifestyle (Primary), Business (Secondary) |
| **Privacy Policy URL** | https://tinderent.lovable.app/privacy-policy |
| **Support URL** | https://tinderent.lovable.app/support |
| **Marketing URL** | https://tinderent.lovable.app |

### Step 3: App Privacy

Answer Apple's privacy questions:

**Data Collection**:
- ✅ Contact Info (Email address)
- ✅ User Content (Photos, Messages)
- ✅ Identifiers (User ID, Device ID)
- ✅ Usage Data (Product interaction)
- ✅ Location (if applicable)

**Data Use**:
- Analytics
- App Functionality
- Product Personalization

**Data Linked to User**: Yes

### Step 4: Prepare App Store Listing

**Screenshots Required** (upload for each device size):

| Device | Size | Quantity |
|--------|------|----------|
| iPhone 6.7" | 1290 x 2796 | 3-10 |
| iPhone 6.5" | 1242 x 2688 | 3-10 |
| iPhone 5.5" | 1242 x 2208 | 3-10 |
| iPad 12.9" | 2048 x 2732 | 3-10 |

**Description** (4000 characters max):

```
🏠 Find Your Perfect Rental with Tinderent

Tinderent revolutionizes the rental experience by connecting property owners with potential tenants through an intuitive, swipe-based matching system.

FOR TENANTS:
• Browse verified rental listings
• Swipe right on properties you love
• Chat directly with property owners
• Save favorite properties for later
• Get instant notifications for new matches

FOR PROPERTY OWNERS:
• List your properties with detailed descriptions
• View potential tenant profiles
• Match with qualified renters
• Manage all your listings in one place
• Screen tenants efficiently

KEY FEATURES:
✓ Smart matching algorithm
✓ Verified user profiles
✓ In-app messaging
✓ Push notifications for matches
✓ Search filters for location, price, amenities
✓ Secure authentication
✓ Beautiful, intuitive interface

Whether you're searching for your next home or looking for reliable tenants, Tinderent makes the rental process simple, fast, and enjoyable.

Download Tinderent today and find your perfect match!
```

**Keywords** (100 characters, comma-separated):

```
rental,apartment,tenant,landlord,property,house,rent,matching,home,real estate,swipe,roommate
```

**What's New** (for updates):

```
Version 1.0.0
- Initial release
- Property browsing and matching
- In-app messaging
- Push notifications
- Profile management
```

---

## Submit for Review

### Step 1: Archive the App

In Xcode:

1. Select **Product** → **Archive**
2. Wait for the build to complete
3. In the Organizer window, click **Distribute App**
4. Select **App Store Connect**
5. Choose **Upload**
6. Follow the prompts to upload

### Step 2: Complete Submission

1. Return to App Store Connect
2. Select your uploaded build
3. Answer the **Export Compliance** question (No encryption typically)
4. Answer the **Content Rights** question
5. Agree to the **Advertising Identifier** usage (if applicable)
6. Click **Submit for Review**

### Step 3: App Review Guidelines Checklist

Before submitting, ensure compliance with Apple's guidelines:

- [ ] App has a clear purpose and functionality
- [ ] Privacy policy URL is accessible
- [ ] All external links work correctly
- [ ] No placeholder content
- [ ] App doesn't crash or have major bugs
- [ ] UI follows iOS Human Interface Guidelines
- [ ] Account deletion option available (required!)
- [ ] In-app purchases use Apple's payment system

---

## Common Issues and Solutions

### Issue: "No suitable application records were found"

**Solution**: Ensure Bundle ID in Xcode matches the App ID in App Store Connect exactly.

### Issue: "Invalid Binary"

**Solution**: Check that:
- All required icons are present
- Info.plist has required privacy descriptions
- No simulator builds included
- Correct architecture (arm64 only)

### Issue: "Missing Push Notification Entitlement"

**Solution**:
1. Enable Push Notifications in Apple Developer portal
2. Add capability in Xcode
3. Regenerate provisioning profile

### Issue: "App Rejected - Guideline 4.2 Minimum Functionality"

**Solution**: Ensure your app:
- Has substantial functionality beyond a website
- Provides native features (push notifications, camera, etc.)
- Works offline for core features

### Issue: "App Rejected - Account Deletion Required"

**Solution**: Add account deletion functionality per Apple's guidelines. Tinderent already has this in:
- Settings → Security → Delete Account

---

## Useful Commands

```bash
# Build for production
npm run build

# Add iOS platform
npx cap add ios

# Sync changes
npx cap sync ios

# Open in Xcode
npx cap open ios

# Update Capacitor
npm update @capacitor/core @capacitor/cli @capacitor/ios

# Check iOS build
npx cap doctor
```

---

## Support

- **App Store Review Guidelines**: [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Human Interface Guidelines**: [developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- **Capacitor iOS Documentation**: [capacitorjs.com/docs/ios](https://capacitorjs.com/docs/ios)

---

## Timeline Estimate

| Step | Duration |
|------|----------|
| Apple Developer enrollment | 1-48 hours |
| Generate assets | 30 minutes |
| Build iOS project | 15 minutes |
| Configure Xcode | 30 minutes |
| App Store Connect setup | 1 hour |
| Submit for review | 15 minutes |
| **App Review** | **1-7 days** |

---

*Last updated: December 2025*
