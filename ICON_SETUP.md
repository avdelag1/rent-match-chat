# 🎨 App Icon & Splash Screen Setup

## Quick Option: Use a Design Tool

### Recommended: Figma (Free)

1. Go to [Figma](https://figma.com)
2. Create a new file
3. Create a 1024x1024 artboard
4. Design your icon:
   - TindeRent flame logo (🔥)
   - Use orange (#FF5722) and red (#F44336) gradient
   - Keep it simple and recognizable at small sizes
5. Export as PNG (1024x1024)

### Or Use: Canva (Free)

1. Go to [Canva](https://canva.com)
2. Search for "App Icon" template
3. Customize with TindeRent branding
4. Download as PNG (1024x1024)

---

## Generate All Sizes

### Option 1: Online Tool (Easiest)

Use **[AppIcon.co](https://appicon.co/)**:

1. Upload your 1024x1024 PNG icon
2. Select platforms: Android & iOS
3. Download generated assets
4. Extract the files

### Option 2: Use easyappicon.com

1. Go to [easyappicon.com](https://easyappicon.com/)
2. Upload your icon
3. Download Android and iOS assets

---

## Install Icons

### For Android (Capacitor)

1. **App Icon**: Replace files in `android/app/src/main/res/`
   ```
   mipmap-mdpi/ic_launcher.png (48x48)
   mipmap-hdpi/ic_launcher.png (72x72)
   mipmap-xhdpi/ic_launcher.png (96x96)
   mipmap-xxhdpi/ic_launcher.png (144x144)
   mipmap-xxxhdpi/ic_launcher.png (192x192)
   ```

2. **Splash Screen**: Replace in `android/app/src/main/res/drawable/`
   ```
   splash.png (2732x2732)
   ```

### For iOS (Capacitor)

1. Open Xcode: `npx cap open ios`
2. Select `App` in the navigator
3. Click on `App` target
4. General tab → App Icons and Launch Images
5. Click on AppIcon → Drag your icons
6. For splash: Assets.xcassets → Splash → Add images

### For Web (PWA)

Update `public/` folder:
```
favicon.ico (32x32)
icon-192.png (192x192)
icon-512.png (512x512)
apple-touch-icon.png (180x180)
```

Update `index.html` links:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

Update `public/manifest.json`:
```json
{
  "name": "TindeRent",
  "short_name": "TindeRent",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#FF5722",
  "background_color": "#FFFFFF",
  "display": "standalone"
}
```

---

## Design Guidelines

### Icon Design Tips

1. **Simple & Memorable**: Use a flame icon (🔥) with "T" or "TR"
2. **High Contrast**: Ensure visibility on light and dark backgrounds
3. **No Text**: Small text is unreadable at small sizes
4. **Test Small**: Check how it looks at 48x48 pixels
5. **Consistent Branding**: Use your brand colors (orange/red gradient)

### Color Palette

```
Primary: #FF5722 (Orange)
Secondary: #F44336 (Red)
Accent: #FF6F00 (Deep Orange)
Background: #FFFFFF (White)
```

### Splash Screen

- Center your logo on a solid background
- 2732x2732 px for maximum compatibility
- Use brand colors
- Keep it simple (loads quickly)

---

## Example Icon Concept

```
┌─────────────────┐
│                 │
│      🔥         │  Flame icon
│   TINDERENT     │  (or just flame for small sizes)
│                 │
└─────────────────┘
```

Or simplified for small sizes:
```
┌───────┐
│   🔥  │  Just the flame icon
│       │  with gradient background
└───────┘
```

---

## Quick Setup with Existing Assets

If you already have icons in your project:

```bash
# Find existing icons
find . -name "*icon*.png" -o -name "*logo*.png"

# Check android resources
ls android/app/src/main/res/mipmap-*/
```

---

## Testing Icons

### Android
```bash
npx cap sync android
npx cap open android
# Run app in Android Studio and check home screen
```

### iOS
```bash
npx cap sync ios
npx cap open ios
# Build and run in simulator, check home screen
```

### Web
```bash
npm run dev
# Open browser dev tools → Application → Manifest
```

---

## Professional Icon Services (Paid)

If you want a professional designer:

- **Fiverr**: $20-100 for app icon design
- **99designs**: Run a contest for ~$299
- **DesignCrowd**: Similar to 99designs

Search for "app icon design" and provide:
- App name: TindeRent
- Description: Tinder for property rentals
- Style: Modern, minimal, friendly
- Colors: Orange and red gradient
- Elements: Flame icon, house/property element

---

## Free Icon Resources

If designing yourself:

- **Icons**: [Flaticon](https://flaticon.com), [Icons8](https://icons8.com)
- **Colors**: [Coolors](https://coolors.co) for gradients
- **Mockups**: [Mockuphone](https://mockuphone.com) to preview icon

---

## Checklist

- [ ] Created 1024x1024 master icon
- [ ] Generated all size variants
- [ ] Replaced Android mipmap icons
- [ ] Added iOS icons in Xcode
- [ ] Updated web icons (favicon, apple-touch-icon)
- [ ] Updated manifest.json
- [ ] Created splash screen
- [ ] Tested on Android device
- [ ] Tested on iOS device (if applicable)
- [ ] Tested PWA on web browser

---

**Need help?** Ping a designer or use Fiverr for quick professional results!
