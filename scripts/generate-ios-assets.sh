#!/bin/bash

# =============================================================================
# Tinderent iOS Assets Generator
# =============================================================================
# This script generates all required icons and splash screens for iOS App Store
# Requirements: ImageMagick (brew install imagemagick)
# Usage: ./scripts/generate-ios-assets.sh
# =============================================================================

set -e

echo "🍎 Tinderent iOS Assets Generator"
echo "=================================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it:"
    echo "   brew install imagemagick"
    exit 1
fi

# Source icon (use SVG or high-res PNG)
SOURCE_ICON="public/icons/icon.svg"
if [ ! -f "$SOURCE_ICON" ]; then
    SOURCE_ICON="public/icons/icon-1024.png"
fi

# Output directories
ICONS_DIR="public/icons"
SPLASH_DIR="public/splash"
RESOURCES_DIR="resources"

mkdir -p "$ICONS_DIR" "$SPLASH_DIR" "$RESOURCES_DIR"

echo ""
echo "📱 Generating App Icons..."
echo "--------------------------"

# App Store Icon (required: 1024x1024, no transparency, no rounded corners)
ICON_SIZES=(
    "20:icon-20"
    "29:icon-29"
    "40:icon-40"
    "58:icon-58"
    "60:icon-60"
    "76:icon-76"
    "80:icon-80"
    "87:icon-87"
    "114:icon-114"
    "120:icon-120"
    "144:icon-144"
    "152:icon-152"
    "167:icon-167"
    "180:icon-180"
    "192:icon-192"
    "256:icon-256"
    "512:icon-512"
    "1024:icon-1024"
)

# Apple Touch Icons
APPLE_TOUCH_SIZES=(
    "57:apple-touch-icon-57x57"
    "60:apple-touch-icon-60x60"
    "72:apple-touch-icon-72x72"
    "76:apple-touch-icon-76x76"
    "114:apple-touch-icon-114x114"
    "120:apple-touch-icon-120x120"
    "144:apple-touch-icon-144x144"
    "152:apple-touch-icon-152x152"
    "167:apple-touch-icon-167x167"
    "180:apple-touch-icon-180x180"
    "1024:apple-touch-icon-1024x1024"
)

# Generate standard icons
for size_name in "${ICON_SIZES[@]}"; do
    IFS=':' read -r size name <<< "$size_name"
    echo "  ✅ ${name}.png (${size}x${size})"
    convert "$SOURCE_ICON" -resize "${size}x${size}" -background black -flatten "$ICONS_DIR/${name}.png"
done

# Generate Apple Touch Icons
for size_name in "${APPLE_TOUCH_SIZES[@]}"; do
    IFS=':' read -r size name <<< "$size_name"
    echo "  ✅ ${name}.png (${size}x${size})"
    convert "$SOURCE_ICON" -resize "${size}x${size}" -background black -flatten "$ICONS_DIR/${name}.png"
done

# Default apple-touch-icon (180x180)
cp "$ICONS_DIR/apple-touch-icon-180x180.png" "$ICONS_DIR/apple-touch-icon.png"
echo "  ✅ apple-touch-icon.png (180x180 default)"

# Favicon
convert "$SOURCE_ICON" -resize "32x32" -background black -flatten "$ICONS_DIR/favicon-32x32.png"
convert "$SOURCE_ICON" -resize "16x16" -background black -flatten "$ICONS_DIR/favicon-16x16.png"
echo "  ✅ favicon-32x32.png"
echo "  ✅ favicon-16x16.png"

echo ""
echo "🖼️  Generating Splash Screens..."
echo "--------------------------------"

# Background color for splash screens
BG_COLOR="#000000"
LOGO_COLOR="#ff6b35"

# Splash screen sizes for iOS
SPLASH_SIZES=(
    "750x1334:apple-splash-750-1334"      # iPhone 8, 7, 6s, 6
    "1242x2208:apple-splash-1242-2208"    # iPhone 8 Plus
    "1125x2436:apple-splash-1125-2436"    # iPhone X, XS, 11 Pro
    "828x1792:apple-splash-828-1792"      # iPhone XR, 11
    "1242x2688:apple-splash-1242-2688"    # iPhone XS Max, 11 Pro Max
    "1080x2340:apple-splash-1080-2340"    # iPhone 12 mini, 13 mini
    "1170x2532:apple-splash-1170-2532"    # iPhone 12, 13, 14
    "1284x2778:apple-splash-1284-2778"    # iPhone 12/13 Pro Max, 14 Plus
    "1179x2556:apple-splash-1179-2556"    # iPhone 14/15 Pro
    "1290x2796:apple-splash-1290-2796"    # iPhone 14/15 Pro Max
    "1536x2048:apple-splash-1536-2048"    # iPad Mini
    "1620x2160:apple-splash-1620-2160"    # iPad Air
    "1668x2388:apple-splash-1668-2388"    # iPad Pro 11"
    "2048x2732:apple-splash-2048-2732"    # iPad Pro 12.9"
)

for size_name in "${SPLASH_SIZES[@]}"; do
    IFS=':' read -r dimensions name <<< "$size_name"
    IFS='x' read -r width height <<< "$dimensions"

    # Calculate logo size (25% of smaller dimension)
    logo_size=$((width < height ? width / 4 : height / 4))

    echo "  ✅ ${name}.png (${width}x${height})"

    # Create splash screen with centered logo
    convert -size "${width}x${height}" xc:"$BG_COLOR" \
        \( "$SOURCE_ICON" -resize "${logo_size}x${logo_size}" -background none \) \
        -gravity center -composite \
        "$SPLASH_DIR/${name}.png"
done

echo ""
echo "📁 Generating Capacitor Resources..."
echo "------------------------------------"

# Copy main icon for Capacitor
cp "$ICONS_DIR/icon-1024.png" "$RESOURCES_DIR/icon.png"
echo "  ✅ resources/icon.png"

# Create a simple splash for Capacitor
convert -size "2732x2732" xc:"$BG_COLOR" \
    \( "$SOURCE_ICON" -resize "512x512" -background none \) \
    -gravity center -composite \
    "$RESOURCES_DIR/splash.png"
echo "  ✅ resources/splash.png"

echo ""
echo "✨ All assets generated successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: npm run build"
echo "   2. Run: npx cap add ios"
echo "   3. Run: npx cap sync ios"
echo "   4. Open in Xcode: npx cap open ios"
echo ""
