# 🧪 TindeRent Testing Guide

Complete guide to test your app before launch.

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Manual Testing Checklist](#manual-testing-checklist)
3. [User Flow Testing](#user-flow-testing)
4. [Performance Testing](#performance-testing)
5. [Device Testing](#device-testing)
6. [Common Issues](#common-issues)

---

## Pre-Testing Setup

### Create Test Accounts

You'll need at least 2 accounts to test matching:

**Account 1: Client (Property Seeker)**
- Email: `client.test@example.com`
- Password: `TestPassword123!`
- Role: Client
- Profile: Complete with preferences

**Account 2: Owner (Property Lister)**
- Email: `owner.test@example.com`
- Password: `TestPassword123!`
- Role: Owner
- Has 1-2 property listings

### Test Data Setup

1. **Create Property Listings** (as Owner)
   - At least 3 different properties
   - Include photos, descriptions, amenities
   - Vary prices, locations, types

2. **Set Client Preferences**
   - Location preferences
   - Price range
   - Property type
   - Amenities

---

## Manual Testing Checklist

### ✅ Authentication Flow

- [ ] Sign up with email/password
- [ ] Verify email (if implemented)
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Password reset (if implemented)
- [ ] Sign out
- [ ] Session persists after closing app
- [ ] Can't access protected routes when logged out

### ✅ Profile Setup

#### Client Profile
- [ ] Upload profile photo
- [ ] Fill out bio
- [ ] Set preferences (budget, location, etc.)
- [ ] Save profile successfully
- [ ] Edit profile later
- [ ] Profile photo displays correctly

#### Owner Profile
- [ ] Upload profile photo
- [ ] Fill out business/personal info
- [ ] Save profile successfully
- [ ] Edit profile later

### ✅ Property Listings (Owner)

- [ ] Create new property listing
- [ ] Upload multiple photos
- [ ] Fill all required fields
- [ ] Save successfully
- [ ] Edit existing listing
- [ ] Delete listing
- [ ] View all my listings
- [ ] Listing photos load correctly
- [ ] Listing appears in client swipe feed

### ✅ Swipe Functionality (Client)

- [ ] Properties load in swipe feed
- [ ] Swipe right (like) works
- [ ] Swipe left (skip) works
- [ ] Tap heart button works
- [ ] Tap X button works
- [ ] Images display correctly
- [ ] Can tap image to expand
- [ ] Can swipe through property images
- [ ] Bottom sheet expansion works
- [ ] All property details visible
- [ ] No duplicate properties shown
- [ ] Runs out of properties eventually
- [ ] Animation is smooth
- [ ] Works on slow devices

### ✅ Swipe Functionality (Owner)

- [ ] Client profiles load
- [ ] Can swipe on clients
- [ ] Filter by category works
- [ ] View client details
- [ ] Like/skip clients

### ✅ Matching System

- [ ] Like from both sides creates match
- [ ] Match notification appears
- [ ] Match shows in match list
- [ ] Can view matched profiles
- [ ] Match persists after refresh

### ✅ Messaging

- [ ] Send first message after match
- [ ] Receive messages in real-time
- [ ] Message history loads correctly
- [ ] Can send multiple messages
- [ ] Timestamps are correct
- [ ] Unread count updates
- [ ] Message activations decrement (if quota system)
- [ ] Can attach images (if implemented)
- [ ] Conversation list shows latest message
- [ ] Notifications work for new messages

### ✅ Search & Filters (Client)

- [ ] Open filter modal
- [ ] Set price range
- [ ] Set location
- [ ] Set property type
- [ ] Set bedrooms/bathrooms
- [ ] Set amenities
- [ ] Apply filters
- [ ] Filters actually filter properties
- [ ] Save filter preferences
- [ ] Reset filters works
- [ ] 50+ filters all work

### ✅ Subscription System

#### Free Tier
- [ ] Can create account
- [ ] Has usage limits
- [ ] Warning when approaching limit
- [ ] Blocked when limit reached
- [ ] Prompt to upgrade

#### Premium Tiers
- [ ] View subscription packages
- [ ] Package details display correctly
- [ ] Prices are correct
- [ ] Can select a package
- [ ] Payment flow (skip if not integrated)
- [ ] Quota increases after upgrade
- [ ] Premium features unlock

### ✅ Notifications

- [ ] New match notification
- [ ] New message notification
- [ ] New like notification (if applicable)
- [ ] Notification badge updates
- [ ] Clicking notification navigates correctly
- [ ] Can dismiss notifications
- [ ] Mark as read works

### ✅ Activity Feed

- [ ] Shows recent activity
- [ ] Likes appear
- [ ] Matches appear
- [ ] Messages appear
- [ ] Timestamps are recent
- [ ] Can click to view details

### ✅ Saved Items

- [ ] Save property (client)
- [ ] View saved properties
- [ ] Remove from saved
- [ ] Saved items persist

### ✅ Settings

- [ ] Update profile
- [ ] Change password (if implemented)
- [ ] Update notification preferences
- [ ] Privacy settings work
- [ ] Delete account (if implemented)
- [ ] Logout works

### ✅ Legal Pages

- [ ] Privacy Policy loads
- [ ] Terms of Service loads
- [ ] Contact information correct
- [ ] Links work
- [ ] Readable formatting

---

## User Flow Testing

### 🎯 Flow 1: Complete Client Journey

**Goal**: Go from signup to having a conversation with an owner

1. **Sign Up**
   - Create new client account
   - Set up profile with photo
   - Set preferences

2. **Discovery**
   - Browse property listings
   - Swipe through at least 10 properties
   - Like 3-5 properties

3. **Match**
   - Get matched (have owner like you back)
   - See match notification
   - View match in matches list

4. **Messaging**
   - Send first message
   - Receive reply
   - Have conversation (5+ messages)

5. **Additional Actions**
   - Save a property
   - Update filters
   - View saved properties
   - Check activity feed

**Expected Time**: 10-15 minutes
**Pass Criteria**: All steps complete without errors

---

### 🎯 Flow 2: Complete Owner Journey

**Goal**: Go from signup to connecting with a client

1. **Sign Up**
   - Create owner account
   - Set up profile

2. **Create Listing**
   - Add new property
   - Upload 3-5 photos
   - Fill all details
   - Publish listing

3. **Discover Clients**
   - Browse client profiles
   - Swipe through clients
   - Like interested clients

4. **Match & Message**
   - Get matched with a client
   - Start conversation
   - Exchange messages

5. **Manage Listings**
   - View all listings
   - Edit a listing
   - Verify listing is visible to clients

**Expected Time**: 10-15 minutes
**Pass Criteria**: All steps complete without errors

---

### 🎯 Flow 3: Dual Role User

**Goal**: Test user with both client and owner roles

1. Sign up as client
2. Complete client profile
3. Browse properties as client
4. Switch to owner role (if implemented)
5. Create property listing
6. Switch back to client role
7. Both roles work correctly

---

## Performance Testing

### Load Time Testing

Test on 3G network (simulate in Chrome DevTools):

- [ ] Homepage loads < 3 seconds
- [ ] Swipe feed loads < 2 seconds
- [ ] Messages load < 2 seconds
- [ ] Images load progressively
- [ ] No layout shift during load

### Swipe Performance

- [ ] 60 FPS during swipes (check in DevTools)
- [ ] No lag or stuttering
- [ ] Smooth animations
- [ ] Fast response to touch

### Memory Usage

```bash
# Check memory in Chrome DevTools
# Performance → Memory

# Target:
# Initial load: < 50 MB
# After 5 min use: < 100 MB
# No memory leaks
```

---

## Device Testing

### Minimum Test Devices

**Android:**
- [ ] Low-end device (2GB RAM) - e.g., Samsung Galaxy A10
- [ ] Mid-range device (4GB RAM) - e.g., Pixel 4a
- [ ] High-end device (8GB RAM) - e.g., Samsung S21

**iOS (if applicable):**
- [ ] iPhone 8 or older
- [ ] iPhone 11/12
- [ ] iPhone 13/14

**Screen Sizes:**
- [ ] Small (< 5 inches)
- [ ] Medium (5-6 inches)
- [ ] Large (> 6 inches)
- [ ] Tablet (if targeting tablets)

### Browser Testing (Web)

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Stress Testing

### High Load Scenarios

- [ ] Swipe through 100+ properties quickly
- [ ] Send 50+ messages rapidly
- [ ] Upload 10 photos at once
- [ ] Open/close modals repeatedly
- [ ] Navigate between pages rapidly
- [ ] Switch between roles frequently

### Edge Cases

- [ ] No internet connection
- [ ] Poor internet (3G simulation)
- [ ] Empty states (no matches, no messages)
- [ ] Very long messages
- [ ] Special characters in text
- [ ] Large image files (> 5 MB)
- [ ] Many properties (1000+)
- [ ] Many messages (100+)

---

## Common Issues

### Issue: Images Not Loading

**Check:**
- Image URLs are correct
- CORS is configured
- Images exist in Supabase storage
- Network connection is stable

**Fix:**
```typescript
// Add error handling
<img
  src={imageUrl}
  onError={(e) => {
    e.target.src = '/fallback-image.png';
  }}
/>
```

---

### Issue: Swipes Not Registering

**Check:**
- Touch events are enabled
- No conflicting event listeners
- Gesture thresholds are appropriate

**Fix:**
```typescript
// Check useSwipeGestures.tsx
// Adjust SWIPE_THRESHOLD if needed
```

---

### Issue: Messages Not Sending

**Check:**
- User is authenticated
- Message activation quota remaining
- Supabase connection working
- RLS policies are correct

**Fix:**
```typescript
// Check useMessaging.tsx
// Verify quota check logic
```

---

### Issue: Slow Performance

**Check:**
- Too many console.logs (remove in production)
- Large images not optimized
- Too many re-renders
- Memory leaks

**Fix:**
```bash
# Build production version (removes logs)
npm run build

# Optimize images
npm install sharp
```

---

## Automated Testing (Optional)

### Set Up Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Example Test

```typescript
// tests/swipe.spec.ts
import { test, expect } from '@playwright/test';

test('client can swipe properties', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Login
  await page.fill('[name="email"]', 'client.test@example.com');
  await page.fill('[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');

  // Wait for swipe feed
  await page.waitForSelector('.swipe-card');

  // Swipe right
  await page.click('[aria-label="Like property"]');

  // Verify next card appears
  await expect(page.locator('.swipe-card')).toBeVisible();
});
```

---

## Bug Tracking Template

When you find a bug, document it:

```markdown
### Bug #001: [Brief Description]

**Severity**: Critical / High / Medium / Low
**Device**: Samsung Galaxy A10, Android 11
**Steps to Reproduce**:
1. Login as client
2. Go to swipe feed
3. Swipe right on third card
4. App crashes

**Expected**: Card should swipe right
**Actual**: App crashes

**Error Message**: (if any)
**Screenshot**: (attach if possible)
```

---

## Final Checklist Before Launch

- [ ] All critical bugs fixed
- [ ] Tested on 3+ devices
- [ ] Performance acceptable on low-end devices
- [ ] No console errors in production
- [ ] Privacy policy and terms accessible
- [ ] Contact information correct
- [ ] All images load correctly
- [ ] App doesn't crash during testing
- [ ] Real-time features work
- [ ] Notifications work
- [ ] Database queries are fast (< 500ms)
- [ ] App works offline gracefully (shows error)

---

## Quick Test Script

Run through this in 5 minutes for smoke testing:

```bash
# 1. Start app
npm run dev

# 2. Open browser
# 3. Quick flow:
#    - Login
#    - Swipe 5 properties
#    - Send 1 message
#    - Check notifications
#    - Logout

# 4. Check console for errors
# 5. Check network tab for failed requests
```

**Pass**: No errors, everything works
**Fail**: Fix issues and retest

---

## Getting Help

If tests fail:
1. Check browser console for errors
2. Check Supabase logs
3. Check network tab for failed requests
4. Review error messages carefully
5. Search error message online
6. Ask in Discord/Stack Overflow

---

**Good luck testing! 🚀 The more thorough you are now, the fewer issues you'll have in production!**
