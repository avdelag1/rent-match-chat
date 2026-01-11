import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconsDir = join(__dirname, '../public/icons');

async function generateFavicon() {
  console.log('🎨 Generating favicon.ico...');

  try {
    // Generate 32x32 favicon.ico from the SVG
    await sharp(join(iconsDir, 'icon.svg'))
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(join(iconsDir, 'favicon-32.png'));

    // Rename to .ico (browsers accept PNG data in .ico files)
    fs.renameSync(
      join(iconsDir, 'favicon-32.png'),
      join(iconsDir, 'favicon.ico')
    );

    console.log('✓ Generated favicon.ico (32×32)');
    console.log('✅ Favicon generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
