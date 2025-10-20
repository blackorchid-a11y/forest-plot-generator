# What's New in Version 2.2.0

## Enhanced Control & Customization

Forest Plot Generator v2.2.0 brings powerful new features for precise control over your forest plots, including manual variable ordering, improved spacing controls, and optional p-value display.

---

## 🎯 Manual Position Control

**Take full control of variable display order!**

- **New Position Column**: Every variable now has a position number
- **Custom Ordering**: Set any order you want within each section/group
- **Easy Reordering**: Just change the position number to move variables around
- **Group-Independent**: Each section maintains its own ordering

**How to use:**
1. Look at the new "Position" column in your data table
2. Change any number to reorder variables
3. Lower numbers appear first (1, 2, 3...)
4. Each group/section has independent numbering

**Example:**
```
Group: ICU Admission
Position 1: Age-10yrs
Position 2: CHI
Position 3: Extrahep-HepA

Group: ALF
Position 1: Age-10yrs
Position 2: AIH
Position 3: Alcohol
```

---

## 📏 Enhanced Spacing Controls

**Fine-tune section spacing for perfect layout!**

The old single "Section Spacing" control has been replaced with two separate controls:

- **Space Before Section Title**: Control the gap ABOVE section headers
  - Default: 20 pixels
  - Range: 0-100 pixels
  - Creates visual separation from previous section

- **Space After Section Title**: Control the gap BELOW section headers
  - Default: 5 pixels
  - Range: 0-100 pixels
  - Keeps section title close to its variables

**Why this matters:**
- More space above = better section separation
- Less space below = tighter grouping within sections
- Full control over your forest plot layout

**Recommended settings:**
- For tight layouts: Before=15, After=3
- For balanced spacing: Before=20, After=5 (default)
- For spacious layouts: Before=30, After=8

---

## 📊 P-Value Display

**Show statistical significance at a glance!**

- **Optional Display**: New "Show P-Values" checkbox in settings
- **Exact Format**: Shows p-values exactly as you entered them
  - 0.03 displays as "p=0.03" (not p=0.030)
  - 0.341 displays as "p=0.341"
  - 0.001 displays as "p=0.001"
  - Very small values show as "p=<0.001"

- **Automatic Layout**: Plot automatically expands to fit p-value text
  - Right margin increases from 150px to 220px when enabled
  - No text gets cut off
  - Clean, professional appearance

**Display format:**
```
Without p-values: 1.50 (1.20-1.90)
With p-values:    1.50 (1.20-1.90) p=0.341
```

---

## 🔤 Variable Alignment Option

**Choose how variable names are aligned!**

New "Align Variables Left" checkbox gives you alignment control:

- **Right-Aligned (Default)**: Variable names end at the plot edge
  - Traditional forest plot style
  - Text flows toward the data
  
- **Left-Aligned (Optional)**: Variable names start at the left margin
  - Alternative layout style
  - Text flows away from the plot

**Applies to all left-side text:**
- Variable names
- Section/group titles
- "Pooled Effect" label
- "Variable" header

---

## 🔄 Backward Compatibility

**Your old projects still work perfectly!**

- Legacy project files automatically updated with new features
- Old spacing values intelligently migrated (70% before, 30% after)
- Missing position numbers automatically assigned
- No manual conversion needed

---

## 🎨 Complete Feature Summary

**New in v2.2.0:**
✅ Manual position control for custom ordering
✅ Separate spacing controls (before/after titles)
✅ Optional p-value display
✅ Variable name alignment option (left/right)
✅ Automatic margin adjustment for p-values
✅ Backward compatibility with v2.1.0 projects

**Still Available from v2.1.0:**
✅ Section/group organization
✅ 55+ color palette
✅ Smart axis scaling
✅ Manual X-axis controls
✅ Excel import wizard
✅ High-res PNG export (800 DPI)

---

## 📝 Quick Start Guide

### To use manual ordering:
1. Enter position numbers in the "Position" column
2. Lower numbers appear first
3. Each section has independent ordering

### To adjust section spacing:
1. Find "Space Before Section Title" in settings
2. Find "Space After Section Title" in settings
3. Adjust values (0-100 pixels) to taste

### To show p-values:
1. Check "Show P-Values" in settings
2. P-values automatically appear next to OR (95% CI)
3. Plot expands to fit the text

### To change variable alignment:
1. Check "Align Variables Left" in settings
2. Variable names move to left edge
3. Uncheck to return to right alignment

---

## 🚀 Coming Soon

Have suggestions for v2.3.0? Let us know!

---

**Forest Plot Generator v2.2.0**
*Professional forest plots made easy*
