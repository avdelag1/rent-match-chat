# Supabase Storage Bucket Cleanup Guide

This guide identifies which storage buckets are actively used in the codebase and which can be safely deleted.

## Summary

**KEEP (Actively Used):**
- `profile-images` - Profile photos
- `listing-images` - Property listing photos
- `legal-documents` - Legal documents storage
- `contracts` - Contract file storage

**DELETE (Not Used in Code):**
- `profile-photos` - **REPLACED** by `profile-images`
- `property-images` - No code references
- `property-photos` - No code references
- `signatures` - No code references
- `legal_documents` - Redundant with `legal-documents`

---

## Detailed Analysis

### ✅ BUCKETS TO KEEP

#### 1. `profile-images` (PRIMARY PROFILE BUCKET)
**Status:** Actively used
**Purpose:** User profile photos and avatars
**File Size Limit:** Unset (50 MB default)
**MIME Types:** image/jpeg, image/jpg, image/png, image/webp
**Policies:** Public bucket with 4 policies

**Code References:**
- `src/components/ClientProfileDialog.tsx` (lines 270, 282)
- `src/pages/OwnerListingCamera.tsx` (lines 92, 105)
- `src/components/ImageUpload.tsx` (line 24)
- `src/components/OnboardingFlow.tsx` (lines 75, 95)
- `src/components/OwnerProfileDialog.tsx` (lines 51, 57)
- `src/utils/photoUpload.ts` (lines 23, 110, 134) - **UPDATED**
- `src/components/ProfilePhotoUpload.tsx` (lines 80, 91) - **UPDATED**

**Action Required:** KEEP - This is the primary profile photo bucket

---

#### 2. `listing-images`
**Status:** Actively used
**Purpose:** Property listing photos
**File Size Limit:** 10 MB
**MIME Types:** image/jpeg, image/jpg, image/png, image/webp
**Policies:** Public bucket with 4 policies

**Code References:**
- `src/components/AIListingAssistant.tsx` (lines 93, 99)
- `src/components/UnifiedListingForm.tsx` (lines 273, 279)

**Action Required:** KEEP - Essential for listing functionality

---

#### 3. `legal-documents` (with hyphen)
**Status:** Actively used
**Purpose:** Legal document storage
**File Size Limit:** Unset (50 MB default)
**MIME Types:** Any
**Policies:** 4 policies

**Code References:**
- `src/components/LegalDocumentsDialog.tsx` (lines 98, 149)

**Action Required:** KEEP - Used for legal document uploads

---

#### 4. `contracts`
**Status:** Actively used
**Purpose:** Contract file storage
**File Size Limit:** Unset (50 MB default)
**MIME Types:** Any
**Policies:** 2 policies

**Code References:**
- `src/hooks/useContracts.tsx` (line 99)

**Action Required:** KEEP - Used for contract file management

---

### ❌ BUCKETS TO DELETE

#### 1. `profile-photos` ⚠️ **REPLACED**
**Status:** REPLACED by `profile-images`
**Reason:** Code has been updated to use `profile-images` instead
**Files Changed:**
- `src/utils/photoUpload.ts` - Updated from `profile-photos` → `profile-images`
- `src/components/ProfilePhotoUpload.tsx` - Updated from `profile-photos` → `profile-images`

**Action Required:**
1. ⚠️ **BEFORE DELETING:** Migrate existing files from `profile-photos` to `profile-images`
2. Verify no active users have photos only in `profile-photos`
3. Delete bucket after migration complete

---

#### 2. `property-images`
**Status:** Not used in code
**Reason:** No references found in codebase
**Note:** Similar to `listing-images` but never implemented

**Action Required:** DELETE - Safe to remove immediately

---

#### 3. `property-photos`
**Status:** Not used in code
**Reason:** No references found in codebase
**Policies:** 0 policies

**Action Required:** DELETE - Safe to remove immediately

---

#### 4. `signatures`
**Status:** Not used in code
**Reason:** Contract signatures stored in `contracts` bucket instead
**Policies:** 2 policies

**Action Required:** DELETE - Safe to remove immediately

---

#### 5. `legal_documents` (with underscore)
**Status:** Redundant
**Reason:** `legal-documents` (with hyphen) is used instead
**Policies:** 3 policies

**Action Required:**
1. ⚠️ **BEFORE DELETING:** Check if any files exist in this bucket
2. Migrate any existing files to `legal-documents` (hyphen version)
3. Delete bucket after migration complete

---

## Migration Steps

### Step 1: Migrate `profile-photos` → `profile-images`

Run this SQL in Supabase SQL Editor to check for existing files:

```sql
-- Check files in profile-photos bucket
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'profile-photos'
ORDER BY created_at DESC;
```

If files exist, migrate them using this approach:
1. Download files from `profile-photos`
2. Re-upload to `profile-images` with same paths
3. Update database references if needed
4. Delete old files
5. Delete `profile-photos` bucket

---

### Step 2: Check `legal_documents` for files

```sql
-- Check files in legal_documents bucket
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'legal_documents'
ORDER BY created_at DESC;
```

If files exist, migrate to `legal-documents` (hyphen version).

---

### Step 3: Delete Empty Buckets

Delete these buckets in Supabase Storage UI (Storage > Settings):
1. `property-images`
2. `property-photos`
3. `signatures`

---

## Final Bucket Configuration

After cleanup, you should have these 4 buckets:

| Bucket Name | Purpose | File Size Limit | MIME Types |
|-------------|---------|-----------------|------------|
| `profile-images` | User profile photos | 50 MB | image/jpeg, image/jpg, image/png, image/webp |
| `listing-images` | Property listing photos | 10 MB | image/jpeg, image/jpg, image/png, image/webp |
| `legal-documents` | Legal document storage | 50 MB | Any |
| `contracts` | Contract file storage | 50 MB | Any |

---

## Code Changes Made

### ✅ Completed Updates

1. **src/utils/photoUpload.ts**
   - Line 23: `bucket = 'profile-photos'` → `bucket = 'profile-images'`
   - Line 110: `bucket: 'profile-photos'` → `bucket: 'profile-images'`
   - Line 134: `bucket = 'profile-photos'` → `bucket = 'profile-images'`

2. **src/components/ProfilePhotoUpload.tsx**
   - Line 80: `.from('profile-photos')` → `.from('profile-images')`
   - Line 91: `.from('profile-photos')` → `.from('profile-images')`

All code now uses the consolidated `profile-images` bucket.

---

## Verification Checklist

- [ ] Run app and test profile photo upload
- [ ] Run app and test listing photo upload
- [ ] Verify no console errors related to storage buckets
- [ ] Check `profile-photos` bucket for existing files (migrate if needed)
- [ ] Check `legal_documents` bucket for existing files (migrate if needed)
- [ ] Delete unused buckets: `property-images`, `property-photos`, `signatures`
- [ ] Delete redundant bucket: `profile-photos` (after migration)
- [ ] Delete redundant bucket: `legal_documents` (after migration)

---

## Notes

- The swipe/like issue was NOT related to storage buckets
- Swipe/like issue was fixed in commit `270ea7e` by replacing `useSwipeWithMatch` with `useSwipe`
- Storage buckets are only for file uploads (images, documents)
- User likes/swipes are stored in database tables (`likes`, `owner_likes`, `swipe_dismissals`)
