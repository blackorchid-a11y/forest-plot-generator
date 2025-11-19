# Forest Plot Generator v3.0.0 - Multi-Plot Feature Guide

Welcome to version 3.0.0! This major update introduces the ability to create and manage **multiple forest plots within a single project**.

---

## 🎯 What's New?

### Multiple Plots in One Project

You can now create as many forest plots as you need within a single project file. This is perfect for:
- **Comparative Studies**: Show different subgroups or time periods side-by-side
- **Comprehensive Reports**: Combine related analyses in one document
- **Publication Figures**: Create multi-panel figures without external image editing
- **Meta-Analyses**: Display multiple outcomes or sensitivity analyses together

---

## 📋 Getting Started with Multi-Plot

### Creating Your First Multi-Plot Project

1. **Start with Plot 1**: When you open the app, you'll see "Plot 1" tab at the top
2. **Add Your Data**: Enter your data as usual in the table below
3. **Customize Plot 1**: Set title, colors, axis settings, etc.
4. **Add More Plots**: Click the **"+"** button next to the tabs
5. **Switch Between Plots**: Click any tab to work on that plot
6. **Arrange Your Layout**: Choose "Vertical" or "Horizontal" in Global Settings

### The Tab Interface

```
┌─────────┬─────────┬─────────┬───┐
│ Plot 1  │ Plot 2  │ Plot 3  │ + │
└─────────┴─────────┴─────────┴───┘
```

- **Active Tab**: Shows which plot you're currently editing
- **Tab Labels**: Display each plot's title (or "Plot 1", "Plot 2", etc.)
- **"+" Button**: Creates a new plot
- **"×" Button**: Removes the current plot (disabled on last plot)

---

## 🎨 Two Ways to Organize Plots

### Vertical Layout (Default)
Plots stack one above another - ideal for:
- ✅ Comparing similar studies
- ✅ Showing progression over time
- ✅ Traditional publication format
- ✅ Easy scrolling through multiple analyses

**Example Use Case**: Display results for different age groups or treatment durations

### Horizontal Layout
Plots appear side-by-side - perfect for:
- ✅ Direct visual comparison
- ✅ Before/after scenarios
- ✅ Different outcome measures
- ✅ Wide-screen presentations

**Example Use Case**: Show primary and secondary outcomes next to each other

---

## ⚙️ Understanding Settings Levels

### Global Settings (Apply to All Plots)
Located in the **Global Settings** panel:
- **Main Title**: Appears above all plots
- **Layout**: Vertical or Horizontal arrangement
- **Project-wide** preferences

### Individual Plot Settings (Unique to Each Plot)
Located in the **Settings & Data** section for each plot:
- **Plot Title**: Specific to this plot
- **Plot Footnote**: Custom note for this plot
- **Data Table**: Independent dataset
- **Dimensions**: Width and height
- **Font Settings**: Size, family, section title size
- **Scale & Axis**: Linear/log, manual/auto ranges
- **Colors**: Individual variable colors
- **Spacing**: Group spacing, title spacing
- **Options**: Gridlines, meta-analysis mode, p-values, alignment

**Key Point**: Change the active tab, and you'll see completely different data and settings for that plot!

---

## 📝 Common Workflows

### Scenario 1: Creating a Comparison Study

**Goal**: Compare treatment effects in men vs. women

1. Start with Plot 1, title it "Men (n=500)"
2. Enter data for male participants
3. Click "+" to add Plot 2
4. Title it "Women (n=480)"
5. Enter data for female participants
6. Choose **Horizontal Layout** to view side-by-side
7. Set a **Main Title**: "Treatment Effects by Gender"
8. Export as single combined image

### Scenario 2: Multiple Outcomes

**Goal**: Show primary and secondary outcomes

1. Plot 1: "Primary Outcome - Mortality"
2. Plot 2: "Secondary Outcome - Hospitalization"
3. Plot 3: "Secondary Outcome - Quality of Life"
4. Use **Vertical Layout** for easy reading
5. Keep consistent axis ranges across plots for comparison
6. Add main title: "Treatment Effects on Multiple Outcomes"

### Scenario 3: Sensitivity Analysis

**Goal**: Display main analysis + sensitivity analyses

1. Plot 1: "Main Analysis (All Studies)"
2. Plot 2: "Sensitivity - High Quality Studies Only"
3. Plot 3: "Sensitivity - Fixed Effects Model"
4. Use same color scheme across all plots
5. Vertical layout works best here

---

## 🔄 Managing Your Plots

### Adding a New Plot
- Click the **"+"** button in the tab bar
- A new plot is created with default settings
- The new plot becomes active automatically
- You can add unlimited plots (within system memory)

### Removing a Plot
- Click the **"×"** button on the plot you want to remove
- Confirmation is not required (undo by reloading project)
- You cannot delete the last remaining plot
- Data for other plots remains untouched

### Switching Between Plots
- Simply click any tab to switch to that plot
- All unsaved changes are preserved in memory
- Each plot remembers its state while you work on others

### Renaming Plots
- Change the "Title" field in the plot's settings
- The tab label updates automatically
- Use descriptive names for easy navigation

---

## 💡 Tips & Best Practices

### Layout Tips
1. **Consistent Dimensions**: Use similar width/height across plots for professional appearance
2. **Matching Scales**: Consider using the same X-axis range for comparable plots
3. **Visual Hierarchy**: Place most important plot first (leftmost or topmost)
4. **Color Coordination**: Use consistent color schemes across related plots

### Organization Tips
1. **Descriptive Titles**: Name plots clearly (avoid "Plot 1", "Plot 2")
2. **Logical Order**: Arrange plots in a meaningful sequence
3. **Main Title**: Use main title to tie all plots together thematically
4. **Footnotes**: Add specific notes to individual plots as needed

### Performance Tips
1. **Large Projects**: 5-10 plots is typical; 20+ plots may slow rendering
2. **Complex Data**: Plots with many variables render slower
3. **Preview Mode**: Work on one plot at a time for faster editing
4. **Save Often**: Save your project file regularly to prevent data loss

---

## 💾 Saving & Loading Multi-Plot Projects

### Saving
- Click **"Save Project"** button
- One .json file contains ALL plots
- Includes all data, settings, and layout preferences
- File size increases with number of plots

### Loading
- Click **"Load Project"** button
- All plots restore exactly as saved
- Tab structure recreates automatically
- Works with v2.x.x single-plot projects (auto-converts)

### Backward Compatibility
- Old v2.x.x projects open seamlessly
- Single plot converts to "Plot 1" in multi-plot format
- All settings preserved during conversion
- No data loss or corruption

---

## 🖼️ Exporting Multi-Plot Projects

### SVG Export
- Exports **all visible plots** in chosen layout
- Vector format - perfect for publications
- Maintains quality at any size
- Editable in Illustrator, Inkscape, etc.

### PNG Export
- High resolution (800 DPI) for print quality
- Captures **all visible plots** as single image
- Ready for Word, PowerPoint, or direct publication
- Larger file size than SVG

### Export Tips
- Preview the arrangement before exporting
- Vertical layout = tall image
- Horizontal layout = wide image
- Consider your publication's requirements

---

## 🚀 Advanced Techniques

### Creating Templates
1. Set up a plot with desired formatting
2. Add new plot (copies default settings, not previous plot)
3. Manually replicate settings, or save as template project
4. Load template and add your data

### Bulk Formatting
Currently, each plot must be formatted individually. Future versions may include:
- "Apply to All Plots" formatting options
- Plot templates with preset styles
- Bulk import from multiple Excel sheets

### Complex Layouts
For more complex arrangements:
1. Export multiple projects separately
2. Combine in image editing software
3. Or, create multiple plots in one project and arrange as needed

---

## ❓ Frequently Asked Questions

**Q: How many plots can I create?**  
A: There's no hard limit, but 5-15 plots is practical for most systems. Very large projects may affect performance.

**Q: Can I rearrange plot order?**  
A: Not yet - plots appear in creation order. You can delete and recreate to change order, or rename for clarity.

**Q: Do all plots need the same data structure?**  
A: No! Each plot is completely independent. Mix different numbers of variables, groups, and settings.

**Q: Can I copy data between plots?**  
A: Not directly in the app. You can copy from the table using standard copy/paste, or prepare multiple datasets in Excel before importing.

**Q: Will my old v2.x projects work?**  
A: Yes! They automatically convert to multi-plot format with your original plot as "Plot 1".

**Q: Can I export plots individually?**  
A: Currently, export captures all visible plots. For individual exports, temporarily keep only the desired plot in your project.

---

## 🎓 Example Use Cases

### 1. Systematic Review with Subgroups
- Plot 1: Overall pooled effect
- Plot 2: Studies in North America
- Plot 3: Studies in Europe
- Plot 4: Studies in Asia
- Main Title: "Geographic Subgroup Analysis"

### 2. Time-Series Meta-Analysis
- Plot 1: 6-month outcomes
- Plot 2: 12-month outcomes
- Plot 3: 24-month outcomes
- Horizontal layout for direct comparison

### 3. Multiple Interventions
- Plot 1: Drug A vs. Placebo
- Plot 2: Drug B vs. Placebo
- Plot 3: Drug A vs. Drug B
- Compare head-to-head results

### 4. Publication-Ready Figure
- Plot 1: Primary outcome
- Plot 2: Secondary outcome
- Plot 3: Safety outcomes
- Single export for manuscript submission

---

## 🆘 Troubleshooting

**Problem**: Changes to one plot affect another  
**Solution**: This was a bug in early development - should not occur in v3.0.0. If it does, reload the project.

**Problem**: Plots don't align properly in horizontal layout  
**Solution**: Ensure plots have similar heights. Adjust the "Height" setting for each plot.

**Problem**: Export cuts off part of the plots  
**Solution**: Increase plot dimensions, or check that all text fits within margins. Preview before exporting.

**Problem**: Too many plots slow down the app  
**Solution**: Consider splitting into multiple project files. Work on one plot at a time by hiding others (future feature).

**Problem**: Lost my plot order  
**Solution**: Plots are saved in tab order. Rename plots with numbers if order is critical (e.g., "1 - Primary", "2 - Secondary").

---

## 🔮 What's Coming Next?

Potential future enhancements based on user feedback:
- Drag-and-drop tab reordering
- Plot duplication/cloning
- "Apply to All" bulk formatting
- Individual plot export
- Plot templates library
- Grid layout (2×2, 3×2, etc.)
- Plot hiding/showing without deletion
- Enhanced copy/paste between plots

---

**Need Help?** Refer to the QUICKSTART_v3.0.0.md for a quick tutorial, or check CHANGELOG_v3.0.0.md for technical details.

**Enjoy creating multi-plot forest plots! 🌲📊**
