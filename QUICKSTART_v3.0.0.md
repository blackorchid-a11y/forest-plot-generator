# Forest Plot Generator v3.0.0 - Quick Start Guide

Welcome to the multi-plot era of Forest Plot Generator! This guide will get you creating multiple forest plots in minutes.

---

## 🚀 5-Minute Tutorial: Your First Multi-Plot Project

### Step 1: Start with Your First Plot (1 minute)

When you open the app, you'll see:
- A tab labeled "Plot 1" at the top
- The familiar data entry table
- Settings panel on the left

**Add some data:**
```
Variable: Treatment A
OR: 1.5
Lower CI: 1.2
Upper CI: 1.9
```

**Set a title:**
- In the settings, enter: "Primary Analysis"

### Step 2: Add a Second Plot (1 minute)

1. Look for the **"+"** button next to the "Plot 1" tab
2. Click it - a new "Plot 2" tab appears
3. You're now on Plot 2 (notice the empty data table)
4. Add different data:
   ```
   Variable: Treatment B
   OR: 2.1
   Lower CI: 1.6
   Upper CI: 2.8
   ```
5. Set title: "Secondary Analysis"

### Step 3: Choose Your Layout (30 seconds)

Look for **"Global Settings"** section:
- Find the "Layout" dropdown
- Choose either:
  - **Vertical** (plots stack up/down) ← Default
  - **Horizontal** (plots side-by-side)

### Step 4: Add a Main Title (30 seconds)

In **Global Settings**:
- Find "Main Title" field
- Enter: "Comparative Treatment Analysis"
- This appears above ALL plots

### Step 5: Preview & Export (1 minute)

- Scroll down to the **Preview** section
- You'll see both plots in your chosen layout
- Click **"Download PNG (800 DPI)"** or **"Download SVG"**
- Get a single image with both plots!

**🎉 Congratulations!** You've created your first multi-plot forest plot.

---

## 🎯 Essential Controls

### The Tab Bar
```
┌──────────┬──────────┬──────────┬───┐
│ Plot 1 ✓ │  Plot 2  │  Plot 3  │ + │
└──────────┴──────────┴──────────┴───┘
```
- **Active tab** (checkmark): Currently editing this plot
- **Inactive tabs**: Click to switch
- **"+" button**: Add new plot
- **"×" button**: Delete current plot

### Global Settings Panel
Controls that affect **all plots**:
- ✅ Main Title (appears above everything)
- ✅ Layout (Vertical or Horizontal)

### Individual Plot Settings
Everything else is **specific to each plot**:
- ❌ Plot Title
- ❌ Data Table
- ❌ Width/Height
- ❌ Colors
- ❌ Axis Settings
- ❌ Font Settings
- ❌ Spacing

**Remember**: Switch tabs to see different settings!

---

## 📊 Common Scenarios

### Scenario A: Compare Two Groups

**Goal**: Show results for men and women separately

1. Plot 1 title: "Men"
2. Add your male data
3. Click "+" for Plot 2
4. Plot 2 title: "Women"
5. Add your female data
6. Layout: **Horizontal** (side-by-side comparison)
7. Main Title: "Gender-Stratified Analysis"
8. Export!

**Time needed**: 5 minutes

---

### Scenario B: Multiple Outcomes

**Goal**: Display 3 different outcome measures

1. Plot 1: "Mortality"
2. Plot 2: "Hospitalization"
3. Plot 3: "Quality of Life"
4. Layout: **Vertical** (easy to read)
5. Main Title: "Treatment Effects on Multiple Outcomes"
6. Export!

**Time needed**: 10 minutes

---

### Scenario C: Sensitivity Analysis

**Goal**: Main analysis + 2 sensitivity checks

1. Plot 1: "Main Analysis (All Studies)"
2. Plot 2: "Sensitivity: Fixed Effects"
3. Plot 3: "Sensitivity: High Quality Only"
4. Layout: **Vertical**
5. Keep same axis range for all (easy comparison)
6. Export!

**Time needed**: 15 minutes

---

## 💡 Pro Tips

### Tip 1: Use Descriptive Titles
❌ Bad: "Plot 1", "Plot 2", "Plot 3"  
✅ Good: "6 Months", "12 Months", "24 Months"

The tab labels update automatically!

### Tip 2: Match Your Dimensions
For professional appearance:
- Set same **Width** for all plots
- Set same **Height** for all plots
- Example: All 1000 × 600 px

### Tip 3: Consistent Axis Ranges
When comparing plots:
1. Go to Plot 1
2. Note the axis range (e.g., 0.1 to 10)
3. Switch to Plot 2
4. Set **Manual X-Axis** with same range
5. Repeat for other plots

Makes visual comparison much easier!

### Tip 4: Color Coordination
- Use similar colors for similar variables across plots
- OR use the same "auto" color for simplicity
- Helps readers track related data

### Tip 5: Save Early, Save Often
- Click **"Save Project"** after major changes
- One file holds ALL plots
- Load it anytime to continue working

---

## 🔄 Switching from v2.x.x?

**Good news**: Your old projects work perfectly!

1. Click **"Load Project"**
2. Select your v2.x.x .json file
3. It automatically converts:
   - Your single plot becomes "Plot 1"
   - All data and settings preserved
   - Ready to add more plots!

**No manual migration needed!**

---

## 📋 Checklist for a Great Multi-Plot

Before exporting, verify:

- [ ] All plots have descriptive titles
- [ ] Main title clearly explains the figure
- [ ] Data is correct in each plot (check by clicking tabs)
- [ ] Layout choice makes sense (vertical or horizontal?)
- [ ] Plots have consistent dimensions (if needed)
- [ ] Axis ranges are appropriate (manual if comparing)
- [ ] Colors look professional
- [ ] Preview looks good
- [ ] Project saved!

---

## ⚠️ Common Mistakes

### Mistake 1: Forgetting to Switch Tabs
**Problem**: Editing same plot repeatedly, thinking you're on different plots  
**Solution**: Always check which tab is active before entering data!

### Mistake 2: Inconsistent Formatting
**Problem**: Each plot looks completely different  
**Solution**: Set up Plot 1 formatting, then manually match in other plots

### Mistake 3: Too Many Plots
**Problem**: 20+ plots in one project, app runs slowly  
**Solution**: Stick to 5-10 plots per project for best performance

### Mistake 4: Wrong Layout Choice
**Problem**: Horizontal layout makes plots too small  
**Solution**: Use vertical for 3+ plots; horizontal works best for 2 plots

### Mistake 5: Not Saving
**Problem**: Lose work when app closes  
**Solution**: Save after every major edit!

---

## 🎓 Progressive Learning Path

### Level 1: Beginner (Week 1)
✅ Create 2-plot project with vertical layout  
✅ Add main title  
✅ Export to PNG  
✅ Save and load project

### Level 2: Intermediate (Week 2)
✅ Create 3-4 plot project  
✅ Use horizontal layout  
✅ Match axis ranges across plots  
✅ Coordinate colors between plots  
✅ Use section groups effectively

### Level 3: Advanced (Week 3+)
✅ Create complex multi-outcome figures (5+ plots)  
✅ Use manual axis control for precision  
✅ Optimize spacing for publication  
✅ Create presentation-ready layouts  
✅ Develop personal templates

---

## 🆘 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Can't see my new plot | Click the new tab at the top |
| Plots too small | Increase Width & Height in each plot's settings |
| Plots overlap | Use Vertical layout instead |
| Wrong data showing | Check which tab is active |
| Can't delete plot | Must keep at least one plot |
| Lost my changes | Click "Save Project" regularly |
| Export looks different | Check preview before exporting |

---

## 📖 Next Steps

**Ready to dive deeper?**
- Read **NEW_FEATURES_v3.0.0.md** for comprehensive guide
- Check **CHANGELOG_v3.0.0.md** for technical details
- Review **EXCEL_IMPORT_GUIDE.md** for data import tips

**Want to see examples?**
- Try the scenarios in this guide
- Experiment with different layouts
- Test importing Excel data into multiple plots

**Need help?**
- Review the FAQ in NEW_FEATURES_v3.0.0.md
- Check troubleshooting section above
- Make sure you're on v3.0.0 (Help → About)

---

## 🎉 You're Ready!

You now know:
- ✅ How to create multiple plots
- ✅ How to switch between them
- ✅ How to choose layouts
- ✅ How to export combined images
- ✅ How to save your work

**Start creating amazing multi-plot forest plots today!** 🌲📊

---

**Happy plotting!**  
*Forest Plot Generator v3.0.0*
