# SMASHER App Icon Generation

## Icon Design

**Design Specifications:**
- **Background:** Black (#000000)
- **Letter:** Red "S" in script/cursive bold font
- **Effect:** Chrome/metallic outline with gradient shine
- **Style:** Bold, italic, script font

## Generated Files

The icon generation creates the following files:

1. **icon.png** (1024x1024) - Main app icon for iOS and Expo
2. **adaptive-icon.png** (1024x1024) - Android adaptive icon
3. **favicon.png** (48x48) - Web favicon

## Method 1: HTML Generator (Easiest)

### Steps:

1. **Open the HTML generator:**
   ```
   Open: app-rn/icon-generator.html
   ```
   Just double-click the file or open it in any web browser.

2. **Download the icons:**
   - Click the "Download" button under each icon preview
   - Save each file to the `app-rn/assets/` folder
   - Replace the existing icon files

3. **Rebuild the app:**
   ```bash
   cd app-rn
   npx expo prebuild --clean
   ```

4. **Run the app:**
   ```bash
   # For iOS
   npx expo run:ios
   
   # For Android
   npx expo run:android
   ```

## Method 2: Node.js Script (Automated)

### Prerequisites:

Install the sharp image processing library:
```bash
cd app-rn
npm install sharp
```

### Steps:

1. **Run the generator script:**
   ```bash
   node generate-icon.js
   ```

2. **Rebuild the app:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Run the app:**
   ```bash
   # For iOS
   npx expo run:ios
   
   # For Android
   npx expo run:android
   ```

## Method 3: Manual Design (Custom)

If you want to customize the icon further:

1. **Edit the SVG:**
   - Open `assets/icon-design.svg` in a vector editor (Inkscape, Adobe Illustrator, etc.)
   - Modify colors, fonts, or effects as needed

2. **Export to PNG:**
   - Export at 1024x1024px for `icon.png` and `adaptive-icon.png`
   - Export at 48x48px for `favicon.png`

3. **Save to assets folder:**
   - Place the exported files in `app-rn/assets/`

4. **Rebuild:**
   ```bash
   npx expo prebuild --clean
   ```

## Icon Specifications

### iOS Icon Sizes (Generated automatically by Expo)
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 87x87 (iPad Pro)
- 80x80 (iPad, iPad mini)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPhone, iPad)
- 29x29 (iPhone, iPad)
- 20x20 (iPhone, iPad)

### Android Icon Sizes (Generated automatically by Expo)
- 1024x1024 (Adaptive icon foreground)
- Various densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

## Design Details

### Chrome Effect
The chrome outline is created using multiple layers:

1. **Outer stroke:** Silver gradient (32px width)
2. **Inner shine:** White-to-gray gradient (24px width, 60% opacity)
3. **Highlight:** White stroke (4px width, 40% opacity)

### Red Gradient
The red "S" uses a vertical gradient:
- Top: #ff3333 (bright red)
- Middle: #cc0000 (deep red)
- Bottom: #ff1a1a (bright red)

### Font Fallbacks
The script tries these fonts in order:
1. Brush Script MT
2. Lucida Handwriting
3. Segoe Script
4. Generic cursive

## Troubleshooting

### Icon not updating after rebuild

1. **Clear Expo cache:**
   ```bash
   npx expo start -c
   ```

2. **Clean rebuild:**
   ```bash
   npx expo prebuild --clean
   ```

3. **Delete native folders and rebuild:**
   ```bash
   rm -rf ios android
   npx expo prebuild
   ```

### Icon looks different on device

- iOS and Android may render fonts differently
- Test on actual devices, not just simulators
- Consider using a custom font file for consistency

### Chrome effect not visible

- Make sure the icon size is large enough (1024x1024)
- The effect is subtle on small sizes
- Check that gradients are rendering correctly

## Customization

### Change Colors

Edit the SVG or generator scripts:

**Background:**
```svg
<rect width="1024" height="1024" fill="#000000"/>
```

**Red gradient:**
```javascript
redGradient.addColorStop(0, '#ff3333');
redGradient.addColorStop(0.5, '#cc0000');
redGradient.addColorStop(1, '#ff1a1a');
```

**Chrome gradient:**
```javascript
chromeGradient.addColorStop(0, '#ffffff');
// ... modify other stops
```

### Change Font

In the HTML generator or SVG:
```javascript
ctx.font = `bold italic ${fontSize}px "Your Font Name", cursive`;
```

### Adjust Letter Position

Modify the Y position (currently at 55% of height):
```javascript
ctx.fillText('S', size / 2, size * 0.55);
```

## Files Included

- **icon-design.svg** - SVG source file
- **generate-icon.js** - Node.js automated generator
- **icon-generator.html** - Browser-based generator
- **ICON_GENERATION.md** - This documentation

## Notes

- The icon uses web-safe fonts that should be available on most systems
- For production, consider embedding a custom script font for consistency
- Test the icon on both light and dark backgrounds
- Ensure the icon is visible at small sizes (20x20px)

## Support

If you encounter issues:

1. Check that all files are in the correct locations
2. Verify Expo is properly configured in `app.json`
3. Try the HTML generator if the Node.js script fails
4. Clear all caches and rebuild from scratch
