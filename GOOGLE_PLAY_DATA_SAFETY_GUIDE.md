# Google Play Store Data Safety Configuration Guide

This guide provides all the information you need to complete the Data Safety section in Google Play Console for RentMatch.

## 📋 Quick Reference

**Account Deletion URL:** `https://your-domain.com/account-deletion.html`
**Privacy Policy URL:** `https://your-domain.com/privacy-policy.html`
**Data Safety Info URL:** `https://your-domain.com/data-safety.html`

> ⚠️ **Important:** Replace `your-domain.com` with your actual deployed domain (e.g., rentmatch.app)

---

## 🔍 Data Collection Declaration

### Section 1: Data Collection Overview

**Does your app collect or share user data?**
- ✅ **Yes**

---

## 📊 Data Types Collected

### 1. Personal Information

#### ✅ Name
- **Collected:** Yes
- **Required/Optional:** Required for basic functionality
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Personalization

#### ✅ Email Address
- **Collected:** Yes
- **Required/Optional:** Required for account creation
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Account management
  - Developer communications

#### ✅ User IDs
- **Collected:** Yes (username/user ID)
- **Required/Optional:** Required
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Account management

#### ✅ Phone Number
- **Collected:** Yes
- **Required/Optional:** Optional
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Account management

---

### 2. Financial Information

#### ✅ User Payment Info
- **Collected:** No (not directly collected by the app)
- **Note:** In-app purchases handled by Google Play Billing

---

### 3. Health and Fitness

#### ❌ Not Collected

---

### 4. Location

#### ✅ Approximate Location
- **Collected:** Yes
- **Required/Optional:** Optional (user can deny permission)
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality (showing nearby properties)
  - Personalization

#### ✅ Precise Location
- **Collected:** Yes (when user grants permission)
- **Required/Optional:** Optional
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Personalization

---

### 5. Messages

#### ✅ Emails
- **Collected:** No (app doesn't access external emails)

#### ✅ SMS or MMS
- **Collected:** No

#### ✅ Other In-App Messages
- **Collected:** Yes (chat messages within the app)
- **Required/Optional:** Required for app functionality
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality (messaging between users)

---

### 6. Photos and Videos

#### ✅ Photos
- **Collected:** Yes
- **Required/Optional:** Optional (user chooses to upload)
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality (profile pictures, property listings)

#### ✅ Videos
- **Collected:** No (currently not supported)

---

### 7. Audio Files

#### ❌ Not Collected

---

### 8. Files and Docs

#### ❌ Not Collected (beyond photos)

---

### 9. Calendar

#### ❌ Not Collected

---

### 10. Contacts

#### ❌ Not Collected

---

### 11. App Activity

#### ✅ App Interactions
- **Collected:** Yes (swipes, likes, searches)
- **Required/Optional:** Required for app functionality
- **User can request deletion:** Yes
- **Shared with third parties:** Yes (anonymized analytics)
- **Ephemeral:** No
- **Purpose:**
  - Analytics
  - App functionality
  - Personalization

#### ✅ In-App Search History
- **Collected:** Yes
- **Required/Optional:** Required for saved searches feature
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Personalization

#### ✅ Other User-Generated Content
- **Collected:** Yes (profile bios, preferences)
- **Required/Optional:** Optional
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Personalization

#### ✅ Other Actions
- **Collected:** Yes (matches, likes, etc.)
- **Required/Optional:** Required
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - App functionality
  - Analytics

---

### 12. Web Browsing

#### ❌ Not Collected

---

### 13. App Info and Performance

#### ✅ Crash Logs
- **Collected:** Yes
- **Required/Optional:** Required for app improvement
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - Analytics
  - App functionality

#### ✅ Diagnostics
- **Collected:** Yes (error logs, performance data)
- **Required/Optional:** Required
- **User can request deletion:** Yes
- **Shared with third parties:** No
- **Ephemeral:** No
- **Purpose:**
  - Analytics
  - App functionality

#### ✅ Other App Performance Data
- **Collected:** Yes
- **Required/Optional:** Required
- **User can request deletion:** Yes
- **Shared with third parties:** Yes (anonymized)
- **Ephemeral:** No
- **Purpose:**
  - Analytics

---

### 14. Device or Other IDs

#### ✅ Device or Other IDs
- **Collected:** Yes (device identifiers, push tokens)
- **Required/Optional:** Required for push notifications
- **User can request deletion:** Yes
- **Shared with third parties:** Yes (push notification services)
- **Ephemeral:** No
- **Purpose:**
  - App functionality (push notifications)
  - Analytics
  - Fraud prevention

---

## 🔐 Security Practices

### Data Encryption

#### ✅ Data is encrypted in transit
- **How:** HTTPS/TLS encryption for all network communication

#### ✅ Data is encrypted at rest
- **How:** Database encryption, secure cloud storage

### User Controls

#### ✅ Users can request data deletion
- **How:**
  - In-app account deletion in Settings
  - Web page: account-deletion.html
  - Email request to support@rentmatch.app

### Account Creation

#### ✅ Users can create an account

**Account creation methods (Select all that apply):**
- ✅ Username and password
- ✅ Username and other authentication (email verification)
- ✅ Username, password, and other authentication (2FA, biometric)
- ✅ OAuth (Google, Apple sign-in)

### Delete Account URL

```
https://your-domain.com/account-deletion.html
```

**Replace with your actual domain!**

---

## 📱 Data Sharing with Third Parties

### Do you share user data with third parties?

**Analytics Providers:**
- **Purpose:** App analytics and performance monitoring
- **Data shared:** Anonymized usage data, crash reports
- **User can opt-out:** Limited (required for app functionality)

**Cloud Services (Supabase):**
- **Purpose:** Database and backend services
- **Data shared:** All user data (encrypted)
- **User can opt-out:** No (required for app functionality)

**Push Notification Services:**
- **Purpose:** Send app notifications
- **Data shared:** Device tokens, notification content
- **User can opt-out:** Yes (disable notifications)

---

## ✅ Compliance Declarations

### Does your app follow the Families Policy requirements?
- ❌ **No** (App is for users 18+)

### Target Audience
- **Age:** 18 and older
- **Content Rating:** Mature 17+

### Is your app's privacy policy publicly available?
- ✅ **Yes**
- **URL:** `https://your-domain.com/privacy-policy.html`

---

## 📝 Step-by-Step Instructions

### 1. Deploy HTML Files

First, deploy the three HTML files to your production server:

```bash
# Files to deploy from /public/ folder:
- privacy-policy.html
- account-deletion.html
- data-safety.html
```

### 2. Verify URLs Work

Test these URLs in your browser:
- `https://your-domain.com/privacy-policy.html`
- `https://your-domain.com/account-deletion.html`
- `https://your-domain.com/data-safety.html`

### 3. Complete Google Play Console

1. **Go to:** Google Play Console → Your App → App content → Data safety
2. **Start:** Click "Start" or "Manage"
3. **Data Collection:** Select "Yes, we collect or share user data"
4. **Data Types:** Use the checklist above to select all data types
5. **For each data type:**
   - Specify if it's required or optional
   - Indicate if users can request deletion
   - Select the purposes (app functionality, analytics, etc.)
6. **Security:**
   - Check "Data is encrypted in transit"
   - Check "Data is encrypted at rest"
   - Check "Users can request data deletion"
7. **Account Creation:**
   - Check the box "My app allows users to create an account"
   - Select authentication methods (username/password, OAuth, etc.)
   - **Add delete account URL:** `https://your-domain.com/account-deletion.html`
8. **Privacy Policy:**
   - Add URL: `https://your-domain.com/privacy-policy.html`

### 4. Save and Submit

- Review all information carefully
- Click "Save"
- Submit your app update

---

## 🔧 Maintenance

### When to Update

You must update your Data Safety section when:
- You add new features that collect additional data
- You change how data is shared
- You modify security practices
- You change account deletion procedures

### Regular Reviews

Review your data safety declaration:
- Before each app release
- At least quarterly
- When privacy regulations change

---

## 📞 Support

If users have questions about data safety:

- **Privacy inquiries:** privacy@rentmatch.app
- **Data deletion:** support@rentmatch.app or use in-app deletion
- **General support:** support@rentmatch.app

---

## ✨ Summary Checklist

Before submitting to Google Play:

- [ ] All three HTML files deployed and accessible
- [ ] Privacy policy URL tested and working
- [ ] Account deletion URL tested and working
- [ ] All data types accurately declared
- [ ] Security practices documented
- [ ] Third-party sharing disclosed
- [ ] Account creation methods selected
- [ ] Delete account URL added
- [ ] Data safety form saved in Play Console

---

## 🎯 Important Notes

1. **Be Accurate:** Provide truthful information. Violations can result in app suspension.
2. **Be Complete:** Declare ALL data collection, even if minimal.
3. **Update Regularly:** Keep your declaration current with app changes.
4. **Test URLs:** Ensure all links work before submitting.
5. **User Rights:** Honor all user data requests promptly.

---

**Document Version:** 1.0
**Last Updated:** November 25, 2024
**App:** RentMatch
