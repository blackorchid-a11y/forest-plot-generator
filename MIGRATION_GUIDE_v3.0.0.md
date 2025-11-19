# Migration Guide: v2.x.x → v3.0.0

This guide helps you transition smoothly from Forest Plot Generator v2.x.x to v3.0.0 with the new multi-plot feature.

---

## 🎉 Good News: Automatic Migration!

**Your existing v2.x.x project files work immediately in v3.0.0** - no manual conversion needed!

---

## What Happens When You Open Old Projects?

### Scenario 1: Opening a v2.3.0 Project

**What you had:**
- One forest plot
- All your data and settings
- Title, footnote, colors, etc.

**What happens in v3.0.0:**
1. File opens normally
2. Your plot becomes "Plot 1" in the new tab system
3. All data preserved exactly
4. All settings maintained
5. You can immediately start adding more plots!

**Result:** Zero data loss, zero setting changes ✅

---

## Understanding the New Interface

### What's Different?

#### Before (v2.x.x):
```
┌─────────────────────────────────────┐
│  Settings                           │
│  - Title: "My Forest Plot"         │
│  - Width: 1000                      │
│  - Height: 600                      │
│  [Data Table]                       │
│  [Preview]                          │
└─────────────────────────────────────┘
```

#### After (v3.0.0):
```
┌─────────────────────────────────────┐
│  ┌──────────┬───┐                   │
│  │ Plot 1 ✓ │ + │  ← New Tab Bar   │
│  └──────────┴───┘                   │
│                                     │
│  Global Settings  ← New Section     │
│  - Main Title                       │
│  - Layout (Vertical/Horizontal)     │
│                                     │
│  Settings & Data  ← Renamed         │
│  - Title: "My Forest Plot"         │
│  - Width: 1000                      │
│  - Height: 600                      │
│  [Data Table]                       │
│  [Preview]                          │
└─────────────────────────────────────┘
```

---

## Key Changes to Understand

### 1. Global vs. Individual Settings

**Global Settings** (new in v3.0.0):
- Main Title
- Layout (Vertical/Horizontal)
- Apply to ALL plots

**Individual Plot Settings** (same as before):
- Plot Title
- Data
- Dimensions
- Fonts
- Colors
- Axis settings
- Everything else!

### 2. The Tab System

**New Element:** Tab bar at top
- Shows all your plots
- Click to switch between them
- "+" to add new plots
- "×" to delete plots

**Your old project:** Automatically shows as "Plot 1"

### 3. New "Main Title" Field

**What is it?**
- Optional title that appears ABOVE all plots
- Different from individual plot titles
- Useful when you have multiple plots

**For single-plot users:**
- Leave blank if you don't need it
- Or use it as a super-title above your plot title

---

## Step-by-Step: Your First Day with v3.0.0

### Step 1: Open Your Existing Project (2 minutes)

1. Launch Forest Plot Generator v3.0.0
2. Click "Load Project"
3. Select your old v2.x.x .json file
4. File opens normally!

**You'll notice:**
- New tab bar shows "Plot 1"
- New "Global Settings" section (empty)
- Your data and settings exactly as before
- Preview looks identical

### Step 2: Familiarize Yourself (3 minutes)

Look around at what's new:
- ✅ Tab bar (currently just "Plot 1")
- ✅ Global Settings (Main Title, Layout)
- ✅ Everything else is the same!

**Try this:**
- Click the "Plot 1" tab (it's already selected)
- Scroll through your settings (unchanged!)
- Check your preview (looks the same!)

### Step 3: Optional - Add a Second Plot (5 minutes)

**Want to try the new feature?**

1. Click the "+" button
2. A "Plot 2" tab appears
3. You're now on Plot 2 (empty data table)
4. Add some test data
5. Click between "Plot 1" and "Plot 2" tabs
6. Notice each has its own data!

**Not ready yet?**
- That's fine! Use it just like v2.x.x
- One plot, same as always
- The new features are optional

---

## Common Questions

### Q: Do I HAVE to use multiple plots?

**A: No!** v3.0.0 works perfectly with just one plot, exactly like v2.x.x.

The multi-plot feature is **optional**. Many users will continue using single plots, and that's completely fine.

### Q: Will my old projects still work?

**A: Yes, 100%!** All v2.0.0, v2.1.0, v2.2.0, v2.2.1, v2.2.2, v2.2.3, and v2.3.0 projects work in v3.0.0 with zero issues.

### Q: Do I need to re-save my projects?

**A: Not required, but recommended.**

When you open an old project and make any changes, save it again. This updates the file format to v3.0.0 standard.

**Benefits:**
- Faster loading in future
- Access to new features if you want them
- Future-proof format

### Q: Can I go back to v2.x.x?

**A: Yes, but with a caveat.**

- **Single-plot projects from v3.0.0:** Open fine in v2.x.x
- **Multi-plot projects from v3.0.0:** Won't open correctly in v2.x.x (only first plot loads)

**Recommendation:** Keep v3.0.0 installed. If you need v2.x.x for some reason, keep both versions.

### Q: What if something breaks?

**A: Very unlikely, but we've got you covered.**

1. Your original file is not modified when you load it
2. Always save with a new filename if concerned: "myproject_v3.json"
3. Keep backups of important projects (good practice anyway!)
4. Report any issues so they can be fixed

### Q: Is v3.0.0 stable?

**A: Yes!** The multi-plot feature has been thoroughly tested:
- Data isolation verified (no cross-contamination)
- Layout rendering validated
- Save/load functionality confirmed
- All v2.x.x features preserved

---

## Best Practices for Migration

### Practice 1: Test with a Copy First

For important projects:
1. Make a copy of your v2.x.x file
2. Open the copy in v3.0.0
3. Verify everything looks correct
4. Only then work with your main file

### Practice 2: Incremental Adoption

You don't need to use multi-plot right away:
1. Week 1: Use v3.0.0 exactly like v2.x.x
2. Week 2: Experiment with a second plot in test project
3. Week 3: Try multi-plot in real work when comfortable

### Practice 3: Save Regularly

With any new version:
- Save after making changes
- Use meaningful filenames
- Keep dated backups: "myproject_2025-01-15.json"

### Practice 4: Read the Documentation

Before diving into multi-plot:
- Skim **QUICKSTART_v3.0.0.md** (5 minutes)
- Reference **NEW_FEATURES_v3.0.0.md** as needed
- Check **CHANGELOG_v3.0.0.md** for technical details

---

## Feature Comparison Table

| Feature | v2.3.0 | v3.0.0 | Notes |
|---------|--------|--------|-------|
| Forest plot creation | ✅ | ✅ | Unchanged |
| Excel/CSV import | ✅ | ✅ | Unchanged |
| Section/group support | ✅ | ✅ | Unchanged |
| Color palette (55+) | ✅ | ✅ | Unchanged |
| P-value display | ✅ | ✅ | Unchanged |
| Manual axis control | ✅ | ✅ | Unchanged |
| Variable positioning | ✅ | ✅ | Unchanged |
| SVG/PNG export | ✅ | ✅ | Unchanged |
| Project save/load | ✅ | ✅ | Enhanced format |
| **Multiple plots** | ❌ | ✅ | **NEW!** |
| **Tab interface** | ❌ | ✅ | **NEW!** |
| **Flexible layouts** | ❌ | ✅ | **NEW!** |
| **Global settings** | ❌ | ✅ | **NEW!** |

**Summary:** Everything you had + powerful new features!

---

## Troubleshooting Migration Issues

### Issue 1: "My project looks different"

**Likely cause:** Preview rendering differences

**Solution:**
1. Check your plot's settings (title, dimensions, etc.)
2. Verify data table looks correct
3. If everything checks out, the visual difference is likely minor rendering improvements

### Issue 2: "Some settings seem missing"

**Likely cause:** Looking in wrong section

**Solution:**
1. Global Settings = Main Title, Layout only
2. Settings & Data = Your plot's settings (scroll down)
3. Everything is there, just organized differently

### Issue 3: "Export looks different"

**Likely cause:** New layout system

**Solution:**
- In Global Settings, Layout is set to "Vertical" by default
- For single plot, layout choice doesn't matter
- Your export should look identical to v2.x.x

### Issue 4: "Can't find my data"

**Likely cause:** Wrong tab selected

**Solution:**
1. Look at the tab bar at top
2. Click "Plot 1" if not already selected
3. Your data is in Plot 1's data table

---

## When to Use Multi-Plot (For Beginners)

### Good Use Cases for Your First Multi-Plot:

1. **Subgroup Analysis**
   - Plot 1: Men
   - Plot 2: Women
   - Horizontal layout for comparison

2. **Time Series**
   - Plot 1: 6-month outcomes
   - Plot 2: 12-month outcomes
   - Plot 3: 24-month outcomes
   - Vertical layout for progression

3. **Multiple Outcomes**
   - Plot 1: Primary outcome
   - Plot 2: Secondary outcome
   - Horizontal or vertical

### Start Simple:
- Begin with just 2 plots
- Use same data structure for both
- Keep settings similar
- Master the basics before complex layouts

---

## Advanced Tips for Power Users

### Tip 1: Batch Project Creation
1. Create template project with desired formatting
2. Save as "template_v3.json"
3. Load template, add data, save with new name
4. Repeat for multiple related projects

### Tip 2: Consistent Formatting Across Plots
- Set up Plot 1 completely
- Note all your settings
- Add Plot 2
- Manually replicate settings
- (Future versions may have "copy settings" feature)

### Tip 3: Publication-Ready Workflow
1. Create all plots with similar dimensions
2. Use same font, size, colors across plots
3. Match axis ranges when comparing
4. Add descriptive main title
5. Export once for entire figure

---

## Getting Help

### Resources:
- **Quick help:** QUICKSTART_v3.0.0.md
- **Comprehensive guide:** NEW_FEATURES_v3.0.0.md  
- **Technical details:** CHANGELOG_v3.0.0.md
- **Original features:** Previous version docs (v2.3.0, v2.2.0, etc.)

### Community:
- GitHub Issues: Report bugs or request features
- Check existing issues for known problems
- Share your use cases to help improve the app

---

## Summary: Migration Checklist

Before you start:
- [ ] Backup important project files
- [ ] Read this migration guide
- [ ] Download and install v3.0.0

Day 1:
- [ ] Open an old project to verify it works
- [ ] Familiarize yourself with the new interface
- [ ] Make a small change and save to test

Week 1:
- [ ] Use v3.0.0 for normal work (single plots)
- [ ] Get comfortable with the new layout
- [ ] Explore Global Settings section

Week 2+:
- [ ] Try creating a 2-plot project
- [ ] Experiment with layouts
- [ ] Explore advanced multi-plot features

---

## Welcome to v3.0.0! 🎉

You're all set! The transition is seamless, and you now have powerful multi-plot capabilities when you need them.

**Remember:**
- Old projects work immediately ✅
- Single-plot workflow unchanged ✅
- New features are optional ✅
- Zero pressure to use multi-plot ✅

**Happy plotting!**

---

*Have questions? Check the FAQ in NEW_FEATURES_v3.0.0.md or open an issue on GitHub.*
