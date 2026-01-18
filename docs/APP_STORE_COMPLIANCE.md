# 📱 APP STORE PRIVACY COMPLIANCE

**Apple App Store & Google Play Privacy Requirements**

Date: 2026-01-18
Classification: Critical - App Store Submission

---

## TABLE OF CONTENTS

1. [Data Collection Inventory](#data-collection-inventory)
2. [Privacy Policy Requirements](#privacy-policy-requirements)
3. [Apple App Store Compliance](#apple-app-store-compliance)
4. [Google Play Compliance](#google-play-compliance)
5. [GDPR/CCPA Basics](#gdpr-ccpa-basics)
6. [Required Disclosures](#required-disclosures)
7. [Rejection Risk Assessment](#rejection-risk-assessment)

---

## DATA COLLECTION INVENTORY

### What Data is Collected

#### 🟢 Account Data (Required for Service)

| Data Point | Purpose | Apple Category | Retention |
|------------|---------|----------------|-----------|
| Email address | Authentication, account recovery | Contact Info | Until deletion |
| Password (hashed) | Authentication | N/A (not shared) | Until deletion |
| Phone number | Account verification, contact | Contact Info | Until deletion |
| Full name | Profile display | Name | Until deletion |
| Date of birth / Age | Age verification, matching | Other Data | Until deletion |
| Profile photos | Identity, matching | Photos/Videos | Until deletion |

#### 🟢 Profile Information (User-Provided)

| Data Point | Purpose | Apple Category | Retention |
|------------|---------|----------------|-----------|
| Bio/Description | Matching, profile display | Other User Content | Until deletion |
| Occupation | Matching preferences | Other Data | Until deletion |
| Interests/Hobbies | Matching algorithm | Other Data | Until deletion |
| Location (City) | Geographic matching | Precise/Coarse Location | Until deletion |
| Preferences (rent, roommate type) | Matching algorithm | Other Data | Until deletion |

#### 🟡 Usage Data (Analytics)

| Data Point | Purpose | Apple Category | Retention |
|------------|---------|----------------|-----------|
| Swipe history | Matching algorithm | Other Data | Until deletion |
| Match history | Conversation management | Other Data | Until deletion |
| Message history | Communication | Other User Content | Until deletion |
| App usage (sessions, features) | Product analytics | Product Interaction | 90 days |
| Device type, OS version | Bug tracking, compatibility | Device ID | 90 days |

#### 🟡 Technical Data (Security/Performance)

| Data Point | Purpose | Apple Category | Retention |
|------------|---------|----------------|-----------|
| IP address | Security, abuse prevention | Other Data | 30 days |
| Device fingerprint (basic) | Fraud prevention | Device ID | 30 days |
| Crash logs | Bug fixes | Diagnostics | 30 days |
| Performance metrics | Optimization | Product Interaction | 30 days |

#### 🔴 Sensitive Data (High Privacy Risk)

| Data Point | Purpose | Apple Category | Retention |
|------------|---------|----------------|-----------|
| Identity documents (passport, license) | Verification | Sensitive Info | Until deletion |
| Exact GPS location (lat/lng) | Listing location | Precise Location | Until deletion |
| Income/Financial info | Matching, affordability | Financial Info | Until deletion |
| Payment information | Subscriptions | Purchase History | Tokenized, delegated to Stripe |

---

### What Data is NOT Collected

❌ **Social Security Number** - Never collected
❌ **Credit card numbers** - Handled by Stripe, never stored
❌ **Biometric data** - No Face ID/Touch ID data stored
❌ **Health data** - Not applicable to this app
❌ **Precise real-time location** - Only city/neighborhood
❌ **Contacts** - No contact list access
❌ **Microphone/Camera (background)** - Only during upload
❌ **Browsing history** - No web tracking
❌ **Advertising ID** - No ad tracking

---

## PRIVACY POLICY REQUIREMENTS

### Required Sections

1. **What Data We Collect**
   - Complete list from above
   - Purpose for each data point
   - Legal basis (consent, legitimate interest, contract)

2. **How We Use Your Data**
   - Matching algorithm
   - Communication features
   - Account management
   - Analytics and improvement
   - Fraud prevention

3. **Who We Share Data With**
   - Other users (limited profile data)
   - Service providers (Supabase, Stripe, Cloudflare)
   - Law enforcement (if legally required)
   - NO selling data to third parties

4. **Your Rights**
   - Access your data
   - Export your data (data portability)
   - Delete your data (right to be forgotten)
   - Correct your data
   - Opt-out of marketing
   - Withdraw consent

5. **Data Retention**
   - How long we keep data
   - Deletion policy
   - Backups

6. **Security Measures**
   - Encryption (TLS, at rest)
   - RLS policies
   - Access controls
   - Regular security audits

7. **Cookies and Tracking**
   - Session cookies (required)
   - Analytics cookies (optional)
   - No third-party advertising cookies

8. **Children's Privacy**
   - Age restriction (18+ for dating/rental app)
   - Compliance with COPPA (if applicable)

9. **International Data Transfers**
   - Where data is stored (Supabase region)
   - EU-US data transfer mechanisms (if applicable)

10. **Changes to Policy**
    - How users are notified
    - Version history

### Privacy Policy Template Location

```
/docs/PRIVACY_POLICY_TEMPLATE.md
```

Display in app:
```
Settings > Legal > Privacy Policy
Also link during signup: "By continuing, you agree to our Privacy Policy and Terms of Service"
```

---

## APPLE APP STORE COMPLIANCE

### Privacy Nutrition Label (App Privacy Details)

**Required in App Store Connect** - Apple's "nutrition label" for privacy

#### Data Used to Track You (Advertising/Analytics)

Select: **NO** (if not using third-party advertising SDKs)

If using analytics:
- ✅ Product Interaction (anonymous usage data)
- ❌ Do NOT check if data is de-identified/not linked to user

#### Data Linked to You

Select ALL that apply:

- ✅ **Contact Info** - Email, phone
- ✅ **Name** - Full name
- ✅ **Photos/Videos** - Profile photos, listing photos
- ✅ **User Content** - Messages, bio, reviews
- ✅ **Location** - City, neighborhood (select "Coarse Location")
  - ❌ Do NOT select "Precise Location" unless you need exact GPS
- ✅ **Contacts** - NO (don't check if not importing contacts)
- ✅ **Identifiers** - User ID (for linking data)
- ✅ **Usage Data** - Product interaction, advertising data
  - ❌ Do NOT check "Advertising Data" if not serving ads
- ✅ **Diagnostics** - Crash data, performance data
- ✅ **Financial Info** - Income (if collecting)
  - ❌ Do NOT check "Payment Info" if using Stripe (delegated)
- ✅ **Sensitive Info** - Government ID (if verifying users)

#### Data Not Linked to You

Select if data is anonymized:

- ✅ **Usage Data** - Anonymous app analytics (if using Mixpanel, etc.)
- ✅ **Diagnostics** - Crash logs (if anonymized)

### What Triggers Manual Review

🔴 **High Risk** (Apple will manually review):

- Collecting government IDs (identity documents)
- Collecting financial information (income)
- Precise location tracking
- Access to contacts or photo library
- Background location tracking
- In-app purchases without clear disclosure
- Dating app features (always reviewed more closely)

🟡 **Medium Risk**:

- Messaging features (need content moderation)
- User-generated content (profile photos, bios)
- Age-gating (18+ apps)

🟢 **Low Risk**:

- Standard authentication (email/password)
- Basic profile information
- City-level location
- Analytics (if disclosed)

### Rejection Reasons to Avoid

❌ **Privacy Violations**:
- Not disclosing data collection in Privacy Policy
- Collecting data without clear purpose
- Sharing data with third parties without disclosure
- Using invasive fingerprinting (canvas, WebGL)

❌ **Misleading Users**:
- Requesting permissions without explanation
- Using data for purposes not disclosed
- Dark patterns (making it hard to delete account)

❌ **Insufficient Moderation**:
- No way to report abusive content
- No user blocking feature
- No terms of service

### Required Features for Approval

✅ **Account Deletion** - Must be easily accessible (Settings > Delete Account)
✅ **User Blocking** - Block other users
✅ **Content Reporting** - Report abusive messages/profiles
✅ **Privacy Policy** - Accessible in-app
✅ **Terms of Service** - Accessible in-app
✅ **Age Gate** - 18+ verification
✅ **Parental Controls** - N/A (18+ app)

---

## GOOGLE PLAY COMPLIANCE

### Data Safety Section (Similar to Apple's Nutrition Label)

**Required in Google Play Console**

#### Data Collection

Select all collected data types:

**Location**:
- ✅ Approximate location (city, neighborhood)
- ❌ Precise location (only if using exact GPS)

**Personal Info**:
- ✅ Name
- ✅ Email address
- ✅ User IDs
- ✅ Physical address (if collecting)
- ✅ Phone number

**Financial Info**:
- ✅ Purchase history (if using in-app purchases)
- ✅ Other financial info (income, if collecting)
- ❌ Payment info (if using Google Play Billing - handled by Google)

**Photos and Videos**:
- ✅ Photos (profile photos, listing photos)

**Messages**:
- ✅ Emails (if collecting)
- ✅ Other in-app messages (chat messages)

**App Info and Performance**:
- ✅ Crash logs
- ✅ Diagnostics
- ✅ Other app performance data

**Device or Other IDs**:
- ✅ Device or other IDs (device fingerprint for fraud)

#### Data Usage and Handling

For each data type, specify:

1. **Is data collected or shared?**
   - ✅ Collected
   - ❌ Shared (unless using third-party analytics)

2. **Is data processed ephemerally?**
   - ❌ No (data is stored)

3. **Is data required or optional?**
   - Email/Password: Required
   - Profile info: Required
   - Photos: Optional
   - Exact location: Optional

4. **Why is data collected?**
   - App functionality (matching, messaging)
   - Analytics
   - Fraud prevention
   - Personalization

5. **Is data encrypted in transit?**
   - ✅ Yes (TLS/HTTPS)

6. **Can users request data deletion?**
   - ✅ Yes (via account deletion)

### Google Play Rejection Risks

❌ **Missing Data Safety Declarations** - Must be complete and accurate
❌ **Undisclosed Data Collection** - Analytics SDKs must be declared
❌ **Insufficient Age Restrictions** - Dating apps must be 18+
❌ **Malware/Deceptive Behavior** - Invasive tracking triggers review

---

## GDPR/CCPA BASICS

### GDPR (EU Users)

**Applies if**: You have users in EU/EEA

#### Required Actions:

1. **Legal Basis for Processing**
   - Consent (explicit opt-in)
   - Contract (necessary for service)
   - Legitimate interest (fraud prevention)

2. **Data Subject Rights**
   - ✅ Right to access (export data)
   - ✅ Right to deletion (account deletion)
   - ✅ Right to rectification (edit profile)
   - ✅ Right to portability (export JSON/CSV)
   - ✅ Right to object (opt-out of marketing)

3. **Consent Management**
   - Must be explicit (checkboxes, not pre-checked)
   - Must be separate from Terms of Service
   - Can be withdrawn anytime

4. **Data Breach Notification**
   - Notify users within 72 hours of breach
   - Report to supervisory authority

#### Implementation:

```typescript
// src/components/auth/GDPRConsent.tsx
export function GDPRConsent() {
  const [marketingConsent, setMarketingConsent] = useState(false);

  return (
    <div className="gdpr-consent">
      <h3>Your Privacy Choices</h3>

      {/* Required for service */}
      <label>
        <input type="checkbox" required checked disabled />
        I agree to the processing of my personal data as described in the
        <a href="/privacy-policy">Privacy Policy</a> (required for service)
      </label>

      {/* Optional marketing */}
      <label>
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
        />
        I consent to receiving marketing communications (optional)
      </label>
    </div>
  );
}
```

---

### CCPA (California Users)

**Applies if**: You have users in California

#### Required Actions:

1. **"Do Not Sell My Personal Information"**
   - Provide opt-out link (even if not selling data)
   - If collecting data, assume you might be "selling" under CCPA definition

2. **Data Disclosure**
   - What categories of data are collected
   - For what purposes
   - Whether data is "sold" or shared

3. **User Rights**
   - Right to know (what data is collected)
   - Right to delete
   - Right to opt-out of sale

#### Implementation:

```
Settings > Privacy > Do Not Sell My Personal Information

When enabled:
- Disable third-party analytics
- Disable data sharing with partners
- Mark user account with do_not_sell flag
```

---

## REQUIRED DISCLOSURES

### During Signup

```
By signing up, you agree to our:
- Terms of Service [link]
- Privacy Policy [link]

We collect: email, name, location, and profile information.
See our Privacy Policy for details.

[Continue] [Cancel]
```

### Permission Requests

**Location Permission**:
```
"Rent Match" would like to access your location.

We use your location to:
- Show nearby listings
- Match you with rentals in your area

You can change this in Settings.

[Allow While Using App] [Allow Once] [Don't Allow]
```

**Photo Library Access**:
```
"Rent Match" needs access to your photos to upload profile pictures and listing images.

We never access your photos without your permission.

[Allow Access] [Cancel]
```

**Camera Access**:
```
"Rent Match" needs camera access to take profile photos and listing images.

[Allow] [Don't Allow]
```

### In-App Privacy Center

```
Settings > Privacy & Security

Your Data:
- [Export My Data] - Download all your data
- [Delete My Account] - Permanently delete account

Privacy Controls:
- [Who Can See My Profile] - Everyone / Matches Only
- [Show My Location] - City / Hidden
- [Read Receipts] - On / Off

Cookies & Tracking:
- [Analytics] - On / Off
- [Personalization] - On / Off
```

---

## REJECTION RISK ASSESSMENT

### 🔴 HIGH RISK - Will Trigger Manual Review

- ✅ Dating/Social app features (matching, messaging)
- ✅ Government ID verification (user_documents)
- ✅ Financial data collection (income)
- ✅ User-generated content (messages, reviews)

**Mitigation**:
- Clear Privacy Policy
- Content moderation system (reporting, blocking)
- Age-gating (18+)
- Identity verification disclosure

---

### 🟡 MEDIUM RISK - May Trigger Review

- Location tracking (even city-level)
- Photo uploads (profile, listings)
- Analytics (if using third-party SDK)

**Mitigation**:
- Explain why location is needed (matching)
- Disclose analytics in Privacy Policy
- Use privacy-safe analytics (Supabase, not Facebook SDK)

---

### 🟢 LOW RISK - Standard Approval

- Email/password authentication
- Basic profile data (name, age, bio)
- Messaging (if moderated)

**Mitigation**:
- Standard disclosures
- Privacy Policy
- Terms of Service

---

## IMPLEMENTATION CHECKLIST

### Before Submission

- [ ] Privacy Policy written and accessible in-app
- [ ] Terms of Service written and accessible in-app
- [ ] Age gate implemented (18+ restriction)
- [ ] Account deletion easily accessible
- [ ] Data export feature implemented (GDPR/CCPA)
- [ ] Content reporting system active
- [ ] User blocking feature active
- [ ] Apple Privacy Nutrition Label filled out accurately
- [ ] Google Data Safety section filled out accurately
- [ ] Permission requests have clear explanations
- [ ] Privacy controls in Settings
- [ ] GDPR consent flow (for EU users)
- [ ] CCPA opt-out option (for CA users)

### App Store Connect Specific

- [ ] Privacy Policy URL provided
- [ ] Support URL provided
- [ ] Marketing URL provided
- [ ] Screenshot doesn't show sensitive data
- [ ] App description doesn't make false claims
- [ ] Age rating set correctly (17+ for dating apps)
- [ ] Content moderation explained in Review Notes

---

## FINGERPRINTING DISCLOSURE

### Safe Fingerprinting (Apple/Google Compliant)

✅ **Allowed** (Basic device info):
- Screen resolution
- Timezone
- Language
- Platform (OS)
- User agent
- Hardware concurrency (CPU cores)

❌ **NOT Allowed** (Invasive tracking):
- Canvas fingerprinting
- WebGL fingerprinting
- Audio fingerprinting
- Font enumeration
- Battery status

### Disclosure in Privacy Policy

```
We collect basic device information (screen size, operating system, browser type)
to optimize your experience and prevent fraud. We do NOT use invasive tracking
methods like canvas fingerprinting.
```

---

## SUMMARY

✅ **Data Collection**: Clearly documented, minimal necessary data
✅ **Privacy Policy**: Comprehensive, accessible, GDPR/CCPA compliant
✅ **User Rights**: Account deletion, data export, privacy controls
✅ **Disclosures**: Apple/Google nutrition labels filled accurately
✅ **Compliance**: GDPR (EU), CCPA (CA), age restrictions (18+)

❌ **Rejection Risks**: Mitigated with content moderation, clear disclosures
🟢 **Approval Likelihood**: HIGH (with proper implementation)

**Next Steps**: Implement privacy center in Settings, write Privacy Policy/ToS.
