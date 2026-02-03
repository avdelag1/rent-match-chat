#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source
 * Creates both regular and maskable icons with proper safe zones
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_SOURCE = path.join(__dirname, '../public/icons/s-logo.svg');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Icon sizes to generate
const REGULAR_SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 1024, name: 'icon-1024.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

// Apple touch icon sizes for iOS
const APPLE_TOUCH_ICON_SIZES = [
  { size: 57, name: 'apple-touch-icon-57x57.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  { size: 72, name: 'apple-touch-icon-72x72.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 114, name: 'apple-touch-icon-114x114.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 1024, name: 'apple-touch-icon-1024x1024.png' }
];

// Maskable icons need safe zone (10% padding on all sides)
const MASKABLE_SIZES = [
  { size: 192, name: 'maskable-192.png' },
  { size: 512, name: 'maskable-512.png' }
];

async function generateRegularIcon(size, filename) {
  try {
    await sharp(SVG_SOURCE, { density: 300 })
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, filename));

    console.log(`✓ Generated ${filename} (${size}×${size})`);
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
  }
}

async function generateMaskableIcon(size, filename) {
  try {
    // Maskable icons need 10% safe zone padding
    // Content should occupy center 80% (safe zone is 10% on each side)
    const contentSize = Math.round(size * 0.8);
    const padding = Math.round((size - contentSize) / 2);

    // Create a dark navy blue background (#0F1123) with the icon centered
    await sharp(SVG_SOURCE, { density: 300 })
      .resize(contentSize, contentSize, {
        fit: 'contain',
        background: { r: 15, g: 17, b: 35, alpha: 1 }
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 15, g: 17, b: 35, alpha: 1 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, filename));

    console.log(`✓ Generated ${filename} (${size}×${size} with safe zone)`);
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate regular icons
  console.log('Regular icons:');
  for (const { size, name } of REGULAR_SIZES) {
    await generateRegularIcon(size, name);
  }

  console.log('\nApple touch icons (for iOS):');
  // Generate apple touch icons
  for (const { size, name } of APPLE_TOUCH_ICON_SIZES) {
    await generateRegularIcon(size, name);
  }

  console.log('\nMaskable icons (with 10% safe zone):');
  // Generate maskable icons
  for (const { size, name } of MASKABLE_SIZES) {
    await generateMaskableIcon(size, name);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify icons in /public/icons/');
  console.log('2. Test PWA installability on Chrome DevTools > Application > Manifest');
  console.log('3. Check maskable icons at https://maskable.app/editor');
}

main().catch(console.error);
