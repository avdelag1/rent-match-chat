# Supabase Storage Cleanup Guide

## Problem: Exceeded Cached Egress Quota

Your Supabase Free Plan has hit the **Cached Egress limit** (5 GB). This happens when you serve too much data from Supabase Storage buckets. This guide will help you:

1. **Identify** orphaned/unused files
2. **Clean up** storage to reduce egress
3. **Optimize** image serving for the future

---

## ⚠️ Current Status

```
Cached Egress: 5.014 / 5 GB (100%) ← EXCEEDED
Storage Size:  0.175 / 1 GB (18%)  ← Plenty of space
```

**Issue**: Not storage space, but **bandwidth usage** from serving images.

---

## 🔍 Step 1: Analyze Your Storage

### Option A: Run the TypeScript Cleanup Script (Recommended)

1. **Get your Supabase Service Role Key**:
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
   - Copy the `service_role` key (keep it secret!)

2. **Add to your `.env.local` file**:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run the cleanup analysis** (dry run first):
   ```bash
   npx tsx scripts/cleanup-supabase-storage.ts --dry-run
   ```

   This will show you:
   - Total files and their sizes
   - Orphaned files (not referenced in database)
   - How much you can save

4. **Actually delete orphaned files**:
   ```bash
   npx tsx scripts/cleanup-supabase-storage.ts
   ```

   You'll be prompted to confirm before deletion.

### Option B: Run SQL Queries Manually

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/YOUR_PROJECT/sql

2. Copy and run queries from:
   `scripts/fix-broken-image-refs.sql`

   This will show you:
   - Broken image references in database
   - External URLs (not in Supabase storage)
   - Storage usage statistics

---

## 🗑️ Step 2: Clean Up Storage

### What Gets Deleted

The cleanup script finds and removes:

1. **Orphaned files**: Files in storage with no database reference
   - Old profile photos from deleted users
   - Listing images from deleted listings
   - Replaced/updated profile avatars

2. **External references**: Database URLs pointing to external sites
   - Unsplash.com placeholder images
   - Example.com test URLs
   - Mock/placeholder URLs

### Buckets to Clean

```
profile-images          Profile avatars (new bucket)
profile-photos          Profile avatars (old bucket)
listing-images          Property/vehicle photos
message-attachments     Message attachments (currently disabled)
```

---

## 📊 Step 3: Check Results

After cleanup, run the analysis again:

```bash
npx tsx scripts/cleanup-supabase-storage.ts --dry-run
```

You should see:
- ✅ Reduced file count
- ✅ Freed up storage space
- ✅ **Reduced egress** (takes 1-24 hours to reflect)

---

## 💡 Step 4: Optimize for the Future

Your app has **aggressive image caching/prefetching** that consumes bandwidth. Here's what's happening:

### Current Issues

1. **Multiple Image Caches**:
   - Swipe image cache (50 images)
   - Image carousel cache (150 images)
   - Client profile cache
   - → Same images cached multiple times

2. **Aggressive Prefetching**:
   - Preloads 4 images on swipe initialization
   - Each swipe preloads 2 more images
   - Full-resolution images loaded without optimization

3. **No CDN/Optimization**:
   - Images served directly from Supabase
   - No width/height transformations applied consistently
   - Signed URLs bypass optimization

### Recommended Optimizations

**Option 1: Reduce Prefetching** (Quick Win)
```typescript
// In ImagePreloadController.ts
// Change from 4 to 2 images
this.preloadNextImages(2); // instead of 4
```

**Option 2: Add Image CDN** (Best Solution)
- Use Cloudflare Images or Imgix
- Set Supabase as origin
- Apply transformations at CDN level
- Dramatic egress reduction (CDN caches everything)

**Option 3: Apply Width/Height to All Images**
```typescript
// Always use getCardImageUrl() with optimizations
const url = getCardImageUrl(imageUrl, {
  width: 800,
  quality: 85
});
```

**Option 4: Unified Image Cache**
- Consolidate 3+ caches into one
- Use service worker for app-wide cache
- Prevent duplicate downloads

---

## 🚨 Quick Fixes (Do These Now)

### 1. Clear Mock Data (SQL)

Run this in Supabase SQL Editor:

```sql
-- Clear external/mock profile images
UPDATE profiles
SET
  avatar_url = NULL,
  profile_photo_url = NULL
WHERE
  avatar_url NOT LIKE '%supabase.co/storage%'
  OR profile_photo_url NOT LIKE '%supabase.co/storage%'
  OR avatar_url LIKE '%placeholder%'
  OR avatar_url LIKE '%unsplash.com%'
  OR profile_photo_url LIKE '%placeholder%'
  OR profile_photo_url LIKE '%unsplash.com%';
```

### 2. Delete Old Bucket Files (Bash)

If you have access to Supabase CLI:

```bash
# List all files in old profile-photos bucket
supabase storage ls profile-photos

# Remove entire old bucket if migrated
supabase storage bucket empty profile-photos
```

### 3. Reduce Image Quality (Code)

Update `src/utils/imageCompression.ts`:

```typescript
// Profile photos: reduce from 0.5MB to 0.3MB
maxSizeMB: 0.3,

// Listing photos: reduce from 1.5MB to 1MB
maxSizeMB: 1.0,
```

---

## 📈 Monitoring Usage

### Check Egress in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/billing
2. Look at "Cached Egress" metric
3. Check daily usage trends

### Set Up Alerts

Add this to your cron jobs (weekly check):

```bash
# Send alert if orphaned files > 100
npx tsx scripts/cleanup-supabase-storage.ts --dry-run | \
  grep "Orphaned files found" | \
  awk '{if ($4 > 100) print "⚠️ Clean up storage!"}'
```

---

## 🆘 Emergency: Hit Quota Mid-Month

If you hit the quota and can't wait for cleanup:

### Temporary Solutions

1. **Upgrade Supabase Plan** (Immediate)
   - Pro Plan: $25/month → 200 GB egress
   - https://supabase.com/dashboard/project/YOUR_PROJECT/settings/billing

2. **Move Images to External Storage** (1-2 hours)
   - Upload to Cloudflare R2 (10 GB free egress)
   - Update database URLs
   - Keep Supabase for database only

3. **Disable Image Prefetching** (5 minutes)
   ```typescript
   // In ImagePreloadController.ts
   // Comment out all preloading temporarily
   // preloadNextImages(0);
   ```

4. **Add Cache-Control Headers** (Reduces repeat downloads)
   ```typescript
   // In photoUpload.ts
   cacheControl: '31536000', // 1 year
   ```

---

## 📋 Checklist

- [ ] Get Supabase Service Role Key
- [ ] Add key to `.env.local`
- [ ] Run cleanup script with `--dry-run`
- [ ] Review what will be deleted
- [ ] Run actual cleanup (delete orphaned files)
- [ ] Run SQL cleanup (fix broken references)
- [ ] Check storage usage reduced
- [ ] Wait 24 hours for egress to update
- [ ] Consider CDN for future optimization
- [ ] Reduce image prefetching count
- [ ] Monitor egress weekly

---

## 🎯 Expected Results

After cleanup, you should see:

```
Before:
Cached Egress: 5.014 / 5 GB (100%)
Total files: 500+ files

After:
Cached Egress: 2.5 / 5 GB (50%)  ← Room to breathe
Total files: 200 files  ← Orphans removed
```

---

## ❓ FAQ

### Q: Will this delete active user images?
**A**: No. The script only deletes files **not referenced** in the database. Active profile photos and listing images are safe.

### Q: How long until egress quota resets?
**A**: Egress quotas reset at the start of each billing cycle (monthly).

### Q: Can I prevent this in the future?
**A**: Yes! Use a CDN (Cloudflare Images), reduce prefetching, and run cleanup monthly.

### Q: What if I need more egress now?
**A**: Upgrade to Supabase Pro ($25/mo) for 200 GB egress, or move images to Cloudflare R2 (free egress).

### Q: Will cleanup affect app performance?
**A**: No. Only orphaned (unused) files are deleted. Active images remain untouched.

---

## 🔗 Useful Links

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Supabase Pricing](https://supabase.com/pricing)
- [Cloudflare Images](https://www.cloudflare.com/products/cloudflare-images/) (CDN alternative)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)

---

**Need Help?**

1. Check script output for specific errors
2. Review `scripts/fix-broken-image-refs.sql` results
3. Check Supabase logs for storage errors
4. Consider upgrading plan if cleanup isn't enough
