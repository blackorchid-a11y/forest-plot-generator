# App Icon Setup Guide

Your new Forest Plot app logo has been created! 🌲

## Files Created

- `build/icon.svg` - Transparent background version
- `build/icon-with-background.svg` - Version with green gradient background (recommended for icon conversion)

## Next Steps - Converting to App Icon Formats

To use these icons in your Electron app builds, you need to convert them to platform-specific formats:

### Option 1: Online Converter (Easiest)
1. Go to https://www.icoconverter.com/ or https://cloudconvert.com/
2. Upload `build/icon-with-background.svg`
3. Convert to:
   - **icon.ico** (for Windows) - 256x256 recommended
   - **icon.icns** (for macOS) - multiple sizes bundled
   - **icon.png** (for Linux) - 512x512 or 1024x1024 recommended

4. Save the converted files in the `build` folder

### Option 2: Using Electron-Builder Icon Generator
If you have npm installed:

```bash
npm install --save-dev electron-icon-builder

# Then run:
npx electron-icon-builder --input=./build/icon-with-background.svg --output=./build
```

This will automatically generate all required formats!

### Option 3: Manual Conversion
- **For Windows (.ico)**: Use tools like GIMP, ImageMagick, or online converters
- **For macOS (.icns)**: Use Image2Icon app or iconutil command line tool
- **For Linux (.png)**: Export from any image editor at 512x512px

## Current Configuration

Your package.json has been updated to reference:
- Windows: `build/icon.ico`
- macOS: `build/icon.icns`  
- Fallback: `build/icon.png`

Once you have these files in place, your builds will use the new logo automatically!

## Testing

To see the icon in development:
```bash
npm start
```

To build with the new icon:
```bash
npm run build          # For Windows
npm run build-mac      # For macOS
```

---

**Note:** The icon design features:
- A stylized tree representing the "forest" in forest plots
- Confidence interval visualization bars below
- Professional green color scheme
- Modern design with depth and shadow effects
