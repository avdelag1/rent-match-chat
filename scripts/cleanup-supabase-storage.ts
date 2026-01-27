#!/usr/bin/env tsx
/**
 * Supabase Storage Cleanup Script
 *
 * This script helps reduce Cached Egress usage by:
 * 1. Finding orphaned files in storage (files not referenced in DB)
 * 2. Finding broken references in DB (URLs pointing to non-existent files)
 * 3. Optionally deleting orphaned files
 *
 * Run with: npx tsx scripts/cleanup-supabase-storage.ts [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL)');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Add these to your .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DRY_RUN = process.argv.includes('--dry-run');

interface StorageFile {
  name: string;
  bucket: string;
  fullPath: string;
  size: number;
}

interface CleanupStats {
  totalFiles: number;
  totalSize: number;
  orphanedFiles: number;
  orphanedSize: number;
  brokenRefs: number;
  deletedFiles: number;
}

const stats: CleanupStats = {
  totalFiles: 0,
  totalSize: 0,
  orphanedFiles: 0,
  orphanedSize: 0,
  brokenRefs: 0,
  deletedFiles: 0,
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function listAllFilesInBucket(bucketName: string): Promise<StorageFile[]> {
  const files: StorageFile[] = [];

  async function listFolder(path: string = '') {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error(`${colors.red}Error listing ${bucketName}/${path}:${colors.reset}`, error.message);
      return;
    }

    if (!data) return;

    for (const item of data) {
      const fullPath = path ? `${path}/${item.name}` : item.name;

      // @ts-ignore - metadata exists but not in types
      if (item.metadata) {
        // It's a file
        files.push({
          name: item.name,
          bucket: bucketName,
          fullPath,
          // @ts-ignore
          size: item.metadata?.size || 0,
        });
        stats.totalFiles++;
        // @ts-ignore
        stats.totalSize += item.metadata?.size || 0;
      } else {
        // It's a folder, recurse
        await listFolder(fullPath);
      }
    }
  }

  await listFolder();
  return files;
}

async function getReferencedImages(): Promise<Set<string>> {
  const referenced = new Set<string>();

  console.log(`${colors.cyan}📊 Fetching database references...${colors.reset}`);

  // Get profile images
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('avatar_url, profile_photo_url, property_photos')
    .not('avatar_url', 'is', null);

  if (profilesError) {
    console.error(`${colors.red}Error fetching profiles:${colors.reset}`, profilesError);
  } else if (profiles) {
    profiles.forEach(profile => {
      if (profile.avatar_url) referenced.add(profile.avatar_url);
      if (profile.profile_photo_url) referenced.add(profile.profile_photo_url);
      if (profile.property_photos) {
        profile.property_photos.forEach((url: string) => referenced.add(url));
      }
    });
    console.log(`${colors.gray}   Found ${profiles.length} profiles with images${colors.reset}`);
  }

  // Get listing images
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('images');

  if (listingsError) {
    console.error(`${colors.red}Error fetching listings:${colors.reset}`, listingsError);
  } else if (listings) {
    listings.forEach(listing => {
      if (listing.images) {
        listing.images.forEach((url: string) => referenced.add(url));
      }
    });
    console.log(`${colors.gray}   Found ${listings.length} listings with images${colors.reset}`);
  }

  // Get message attachments
  const { data: messages, error: messagesError } = await supabase
    .from('conversation_messages')
    .select('attachment_url')
    .not('attachment_url', 'is', null);

  if (messagesError) {
    console.error(`${colors.red}Error fetching messages:${colors.reset}`, messagesError);
  } else if (messages) {
    messages.forEach(message => {
      if (message.attachment_url) referenced.add(message.attachment_url);
    });
    console.log(`${colors.gray}   Found ${messages.length} messages with attachments${colors.reset}`);
  }

  console.log(`${colors.green}✓ Total referenced URLs: ${referenced.size}${colors.reset}\n`);
  return referenced;
}

function extractStoragePath(url: string, bucketName: string): string | null {
  // Handle both public and private bucket URLs
  // Public: https://XXX.supabase.co/storage/v1/object/public/{bucket}/{path}
  // Private: https://XXX.supabase.co/storage/v1/object/sign/{bucket}/{path}
  // Authenticated: https://XXX.supabase.co/storage/v1/object/authenticated/{bucket}/{path}

  const patterns = [
    new RegExp(`/storage/v1/object/public/${bucketName}/(.+?)(?:\\?|$)`),
    new RegExp(`/storage/v1/object/sign/${bucketName}/(.+?)(?:\\?|$)`),
    new RegExp(`/storage/v1/object/authenticated/${bucketName}/(.+?)(?:\\?|$)`),
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

async function findOrphanedFiles(
  files: StorageFile[],
  referenced: Set<string>,
  bucketName: string
): Promise<StorageFile[]> {
  const orphaned: StorageFile[] = [];

  for (const file of files) {
    let isReferenced = false;

    // Check if this file path matches any referenced URL
    for (const url of referenced) {
      const path = extractStoragePath(url, bucketName);
      if (path === file.fullPath) {
        isReferenced = true;
        break;
      }
    }

    if (!isReferenced) {
      orphaned.push(file);
      stats.orphanedFiles++;
      stats.orphanedSize += file.size;
    }
  }

  return orphaned;
}

async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error(`${colors.red}   Error deleting ${bucket}/${path}:${colors.reset}`, error.message);
    return false;
  }

  return true;
}

async function confirmDeletion(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}⚠️  Delete these ${stats.orphanedFiles} orphaned files? (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}   Supabase Storage Cleanup Tool${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);

  if (DRY_RUN) {
    console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be deleted${colors.reset}\n`);
  }

  const buckets = ['profile-images', 'profile-photos', 'listing-images', 'message-attachments'];
  const referenced = await getReferencedImages();

  for (const bucketName of buckets) {
    console.log(`${colors.blue}📁 Scanning bucket: ${bucketName}${colors.reset}`);

    const files = await listAllFilesInBucket(bucketName);
    if (files.length === 0) {
      console.log(`${colors.gray}   No files found${colors.reset}\n`);
      continue;
    }

    console.log(`${colors.gray}   Found ${files.length} files (${formatBytes(files.reduce((sum, f) => sum + f.size, 0))})${colors.reset}`);

    const orphaned = await findOrphanedFiles(files, referenced, bucketName);

    if (orphaned.length > 0) {
      console.log(`${colors.red}   ⚠️  ${orphaned.length} orphaned files (${formatBytes(orphaned.reduce((sum, f) => sum + f.size, 0))})${colors.reset}`);

      // Show first 10 orphaned files
      const displayCount = Math.min(10, orphaned.length);
      for (let i = 0; i < displayCount; i++) {
        const file = orphaned[i];
        console.log(`${colors.gray}      - ${file.fullPath} (${formatBytes(file.size)})${colors.reset}`);
      }
      if (orphaned.length > displayCount) {
        console.log(`${colors.gray}      ... and ${orphaned.length - displayCount} more${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}   ✓ No orphaned files${colors.reset}`);
    }
    console.log();
  }

  // Summary
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}   Summary${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}Total files scanned:${colors.reset}     ${stats.totalFiles} (${formatBytes(stats.totalSize)})`);
  console.log(`${colors.red}Orphaned files found:${colors.reset}    ${stats.orphanedFiles} (${formatBytes(stats.orphanedSize)})`);
  console.log(`${colors.yellow}Potential savings:${colors.reset}       ${formatBytes(stats.orphanedSize)}`);

  if (stats.orphanedSize > 0) {
    const percentSavings = ((stats.orphanedSize / stats.totalSize) * 100).toFixed(1);
    console.log(`${colors.green}Percentage reduction:${colors.reset}    ${percentSavings}%`);
  }
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);

  // Delete orphaned files if not dry run
  if (!DRY_RUN && stats.orphanedFiles > 0) {
    const confirmed = await confirmDeletion();

    if (confirmed) {
      console.log(`\n${colors.yellow}🗑️  Deleting orphaned files...${colors.reset}\n`);

      for (const bucket of buckets) {
        const files = await listAllFilesInBucket(bucket);
        const orphaned = await findOrphanedFiles(files, referenced, bucket);

        for (const file of orphaned) {
          const success = await deleteFile(bucket, file.fullPath);
          if (success) {
            stats.deletedFiles++;
            console.log(`${colors.green}   ✓ Deleted: ${bucket}/${file.fullPath}${colors.reset}`);
          }
        }
      }

      console.log(`\n${colors.green}✓ Deleted ${stats.deletedFiles} files${colors.reset}`);
      console.log(`${colors.green}✓ Freed up ${formatBytes(stats.orphanedSize)}${colors.reset}\n`);
    } else {
      console.log(`${colors.gray}Deletion cancelled${colors.reset}\n`);
    }
  } else if (DRY_RUN && stats.orphanedFiles > 0) {
    console.log(`${colors.cyan}💡 Run without --dry-run to delete these files${colors.reset}\n`);
  }

  console.log(`${colors.green}✅ Cleanup complete!${colors.reset}`);
}

main().catch(console.error);
