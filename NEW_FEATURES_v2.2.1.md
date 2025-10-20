# What's New in Version 2.2.1

## Fine-Tuned Section Control

Forest Plot Generator v2.2.1 adds precise controls for section title appearance and ultra-tight spacing options for compact layouts.

---

## 🔤 Independent Section Title Font Size

**Make section titles stand out or blend in!**

- **New Setting**: "Section Title Font Size" 
  - Default: 16 pixels
  - Range: 8-48 pixels
  - Located right after the regular "Font Size" setting

- **Independent Control**: Section titles no longer follow the variable font size
  - Variables: Use "Font Size" setting
  - Section Titles: Use "Section Title Font Size" setting

**Use Cases:**
- **Prominent Sections**: Set to 20-24px for bold, eye-catching section headers
- **Subtle Sections**: Set to 12-14px for understated organization
- **Balanced Look**: Keep at 16px (default) for professional appearance

**Example:**
```
Variables: 14px
Section Titles: 20px
Result: Section headers are 43% larger and more prominent
```

---

## 📐 Negative Spacing Values

**Create ultra-compact layouts!**

- **Enhanced Range**: "Space After Section Title" now accepts -20 to 100 pixels
  - Previously: 0 to 100 pixels
  - Now: -20 to 100 pixels

- **What Negative Values Do**:
  - Negative spacing pulls section titles closer to their variables
  - Creates tight, compact layouts perfect for space-constrained plots
  - Section title overlaps into the variable space area

**Spacing Examples:**
```
+10px: Spacious layout with clear separation
+5px:  Standard spacing (default)
0px:   Section title directly touches first variable
-5px:  Title pulls into variable space
-10px: Very tight, compact layout
-20px: Ultra-compact (maximum tightness)
```

**When to Use Negative Spacing:**
- Publications with strict page limits
- Posters where space is premium
- Multi-section plots that need to fit in limited height
- When you want section titles to feel "embedded" in their groups

---

## 🔄 Backward Compatibility

**Seamless upgrades from v2.2.0!**

- Old projects automatically get default section title font size (16px)
- Existing spacing values preserved
- No manual configuration needed
- All v2.2.0 features still available

---

## 🎨 Complete Feature Summary

**New in v2.2.1:**
✅ Independent section title font size control (8-48px)
✅ Negative spacing values for ultra-tight layouts (-20 to 100px)
✅ Enhanced section prominence control
✅ Backward compatibility with v2.2.0

**All Features from v2.2.0:**
✅ Manual position control for custom ordering
✅ Separate spacing controls (before/after titles)
✅ Optional p-value display
✅ Variable name alignment option (left/right)
✅ Automatic margin adjustment for p-values

**All Features from v2.1.0:**
✅ Section/group organization
✅ 55+ color palette
✅ Smart axis scaling
✅ Manual X-axis controls
✅ Excel import wizard
✅ High-res PNG export (800 DPI)

---

## 📝 Quick Start Guide

### To set section title font size:
1. Find "Section Title Font Size" in settings
2. Adjust value (8-48 pixels)
3. Make titles larger (20+) or smaller (12-) than variables

### To use negative spacing:
1. Find "Space After Section Title" in settings
2. Enter negative value (-5, -10, -20)
3. Section title pulls closer to variables
4. Perfect for compact layouts

### Recommended Combinations:

**Professional Standard:**
- Section Title Font Size: 16px
- Space After: 5px

**Prominent Sections:**
- Section Title Font Size: 20px
- Space After: 8px

**Compact Layout:**
- Section Title Font Size: 14px
- Space After: -5px

**Ultra-Compact:**
- Section Title Font Size: 14px
- Space After: -15px

---

## 💡 Tips & Tricks

**Make Section Titles Pop:**
- Increase section title font size to 18-22px
- Keep variable font at 12-14px
- Use 5-10px spacing after titles

**Maximize Space Efficiency:**
- Use negative spacing (-10 to -20px)
- Reduce section title font to 12-14px
- Minimize "Space Before Section Title" to 10-15px

**Balanced Professional Look:**
- Section title: 16px
- Variables: 14px
- Space before: 20px
- Space after: 5px

---

**Forest Plot Generator v2.2.1**
*Professional forest plots made easy*
