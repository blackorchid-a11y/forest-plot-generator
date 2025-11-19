# Forest Plot Generator v2.3.0 - Quick Start Guide

## Installation & Setup

### Step 1: Update Files
1. **Download the new app.js** from the outputs folder
2. **Replace** your existing `app.js` file with the new one
3. The `package.json` has already been updated to version 2.3.0

### Step 2: Test the Application
```bash
npm start
```

The application should launch with the new multi-plot interface.

### Step 3: Build for Distribution
When ready to create the installer:
```bash
update-to-v2.3.0.bat
```

Or manually:
```bash
npm install
npm run build
```

## What's New - Quick Overview

### Multi-Plot Interface
At the top of the application, you'll now see:
- **Plot Tabs**: Buttons showing all your plots
- **+ Add Plot**: Create new plots
- **Layout Buttons**: Choose vertical (⬇️) or horizontal (➡️)
- **Edit (✏️) and Delete (🗑️)** buttons for each plot

### Creating Multiple Plots
1. Click **"+ Add Plot"**
2. New plot tab appears  
3. Click the tab to switch to it
4. Enter data or import CSV/Excel
5. Repeat for more plots

### Editing a Plot
1. Click the **✏️ icon** on any plot tab
2. Full-screen editor opens
3. Edit subtitle, data, import files
4. Click **"Save Plot"**

### Downloading
- Single plot: Works as before
- Multiple plots: Automatically combined into one file
- Choose your layout first (vertical/horizontal)
- Download SVG or PNG - all plots included!

## Testing Checklist

### Basic Functionality
- [ ] Application starts without errors
- [ ] Can create first plot with data
- [ ] Can add second plot
- [ ] Can switch between plots
- [ ] Data persists when switching
- [ ] Can edit plot in modal

### Multi-Plot Features
- [ ] Plot tabs appear correctly
- [ ] Can add up to 3-4 plots
- [ ] Edit button opens modal
- [ ] Can set individual subtitles
- [ ] Can delete plots (keeps minimum 1)
- [ ] Plot counter shows correct number

### Layout Options
- [ ] Can select vertical layout
- [ ] Can select horizontal layout
- [ ] Layout button shows active state

### Data Management
- [ ] Can import CSV for specific plot
- [ ] Can import Excel for specific plot
- [ ] Can add/delete rows in plot editor
- [ ] Can set colors and groups per plot
- [ ] Position control works

### Download & Save
- [ ] SVG download works (single plot)
- [ ] SVG download works (multiple plots)
- [ ] PNG download works
- [ ] Save project includes all plots
- [ ] Load project restores all plots
- [ ] Backward compatibility with v2.2.x files

## Common Issues & Solutions

### Issue: Application won't start
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Can't see plot editor modal
**Solution**: Check if modal is blocked by browser/electron settings

### Issue: Download only shows one plot
**Solution**: This is normal if you only have one plot. Add a second plot to test combined download.

### Issue: Old project file doesn't load plots
**Solution**: Old files (v2.2.x) will load but show as single plot. This is expected - they'll work normally.

### Issue: Build fails
**Solution**: 
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again
4. Run `npm run build`

## File Structure

Your updated app should have:
```
forest-plot-app/
├── app.js (NEW - v2.3.0 with 2133 lines)
├── package.json (UPDATED - version 2.3.0)
├── main.js (unchanged)
├── index.html (unchanged)
├── NEW_FEATURES_v2.3.0.md (NEW)
├── CHANGELOG_v2.3.0.md (NEW)
├── update-to-v2.3.0.bat (NEW)
└── ...other files...
```

## Architecture Changes

### New Components
- **PlotEditorModal**: Full-screen editor for individual plots (lines 310-615)
- **Multi-plot state management**: Added in ForestPlotGenerator (lines 649-660)
- **Plot management functions**: Add/delete/edit plots (lines 688-747)

### Key Features
- **Auto-sync**: Data automatically saved when switching plots
- **UseEffect hook**: Keeps plots array synchronized with current data
- **Combined download**: Smart SVG generation for multiple plots
- **Backward compatibility**: Old project files load correctly

## Next Steps

1. **Test thoroughly** with the checklist above
2. **Create some multi-plot examples** for documentation
3. **Build the installer** when ready
4. **Create GitHub release v2.3.0**
5. **Update README** with multi-plot screenshots

## Support Files Created

✅ `app.js` - Main application file (2133 lines)
✅ `package.json` - Updated to v2.3.0  
✅ `NEW_FEATURES_v2.3.0.md` - Feature documentation
✅ `CHANGELOG_v2.3.0.md` - Complete changelog
✅ `update-to-v2.3.0.bat` - Deployment script
✅ `QUICKSTART_v2.3.0.md` - This file

## Implementation Details

**Total lines added**: ~615 lines
**Components added**: 2 (PlotEditorModal, plot management UI)
**Functions added**: 7 (add/delete/edit/save/cancel/switch/downloadCombined)
**State variables added**: 5 (plots, currentPlotIndex, multiPlotLayout, showPlotEditor, editingPlotId)

**Approach used**: Minimal modification strategy
- Kept ALL existing code intact
- Added new layer on top
- No breaking changes
- Maximum stability

---

**Ready to test!** Run `npm start` and explore the new multi-plot features.

For detailed feature documentation, see `NEW_FEATURES_v2.3.0.md`
For complete changelog, see `CHANGELOG_v2.3.0.md`

---
**Version**: 2.3.0  
**Date**: November 18, 2025  
**Build Status**: ✅ Ready for Testing
