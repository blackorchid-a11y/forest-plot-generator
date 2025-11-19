# Forest Plot Generator v2.3.0 - Multi-Plot Feature Guide

## Overview
Version 2.3.0 introduces the ability to create **multiple forest plots in a single file**, allowing you to compare different analyses side-by-side or arrange them vertically.

## Key Features

### 🎯 Multi-Plot Management
- **Add Multiple Plots**: Click "+ Add Plot" to create additional forest plots
- **Individual Data**: Each plot has its own independent dataset
- **Plot Subtitles**: Each plot can have a unique subtitle
- **Main Title**: One main title applies to the entire figure

### 📊 Plot Organization
- **Plot Tabs**: Switch between plots using the tab interface
- **Easy Editing**: Click the ✏️ icon to edit any plot's data
- **Quick Delete**: Remove plots you don't need (minimum 1 plot required)
- **Visual Indicators**: See data count for each plot at a glance

### 🎨 Layout Options
Choose how to arrange your plots:
- **⬇️ Below (Vertical)**: Stack plots one under another
- **➡️ Side-by-Side (Horizontal)**: Place plots next to each other

### 📥 Single Download
- All plots are combined into **one SVG or PNG file**
- Automatically arranged based on your layout choice
- Main title and individual subtitles included
- Perfect for manuscripts, presentations, and reports

## How to Use

### Creating Multiple Plots

1. **Start with First Plot**
   - Enter data for your first forest plot as usual
   - Optionally add a subtitle in the plot management section

2. **Add Additional Plots**
   - Click "+ Add Plot" button
   - A new plot tab will appear
   - Switch to the new plot to enter its data

3. **Edit Plot Data**
   - Click the ✏️ edit icon on any plot tab
   - A full-screen editor opens
   - Import CSV/Excel or enter data manually
   - Set the plot subtitle
   - Click "Save Plot" when done

4. **Organize Layout**
   - Choose "⬇️ Below" for vertical stacking
   - Choose "➡️ Side-by-Side" for horizontal arrangement
   - Layout updates immediately in preview

### Editing Plots

**Full-Screen Plot Editor:**
- Opens when you click ✏️ on a plot tab
- Complete data table with all features
- Import CSV or Excel for this specific plot
- Add/delete rows
- Set colors, groups, positions
- Edit subtitle
- Save or cancel changes

### Downloading

**Automatic Combined Download:**
- Click "Download SVG" or "Download PNG"
- If you have multiple plots, they're automatically combined
- Arranged according to your layout choice (vertical/horizontal)
- Includes:
  - Main title at top
  - Individual plot subtitles
  - All plots with proper spacing
  - Shared footnote at bottom

### Saving Projects

**Project Files (.json):**
- Save all plots at once
- Layout settings preserved
- Individual plot data maintained
- Load later to continue editing

## Tips and Best Practices

### ✅ When to Use Multiple Plots
- **Subgroup Analyses**: Show results for different populations
- **Sensitivity Analyses**: Compare main analysis vs. alternatives
- **Time Periods**: Display different time points or years
- **Different Outcomes**: Show multiple endpoints
- **Model Comparisons**: Unadjusted vs. adjusted models

### 🎨 Layout Recommendations
- **Vertical (Below)**:
  - Best for plots with different variables
  - Easier to compare effect sizes
  - Better for print/PDF format
  - Recommended for most uses

- **Horizontal (Side-by-Side)**:
  - Best when comparing same variables across groups
  - Good for presentations/slides
  - Works well with fewer variables per plot
  - Requires wide display

### 📏 Sizing Tips
- Keep plot dimensions consistent across all plots
- Adjust plot width/height in settings before adding multiple plots
- Wider plots work better for horizontal layout
- Taller plots work better for vertical layout

### 🎯 Subtitle Best Practices
- Keep subtitles concise (1-2 lines max)
- Use descriptive names: "Men (n=500)" instead of "Plot 1"
- Be consistent with formatting across plots
- Include sample sizes when relevant

## Common Workflows

### Workflow 1: Subgroup Analysis
1. Create first plot with overall results, subtitle: "Overall (N=1,000)"
2. Add second plot, subtitle: "Men (n=600)"
3. Add third plot, subtitle: "Women (n=400)"
4. Choose vertical layout
5. Download combined figure

### Workflow 2: Sensitivity Analysis  
1. Main analysis plot, subtitle: "Primary Analysis"
2. Second plot, subtitle: "Excluding Missing Data"
3. Third plot, subtitle: "Alternative Definition"
4. Vertical layout
5. Single download for manuscript

### Workflow 3: Side-by-Side Comparison
1. First plot: "2020 Data"
2. Second plot: "2021 Data"
3. Horizontal layout for direct comparison
4. Same variables in both plots
5. Download for presentation

## Keyboard Shortcuts
- **Tab**: Switch between plot editing fields
- **Ctrl+S**: N/A (use Save Plot button in editor)
- **Esc**: Close plot editor modal

## Technical Notes
- Each plot maintains independent data and settings
- Main settings (font, scale, colors) apply to all plots
- Plot-specific: data, subtitle
- Global: title, footnote, dimensions, font settings
- Project files are backward compatible (v2.2.x files still load)

## Troubleshooting

**Q: Can I have different X-axis ranges for different plots?**
A: Currently, all plots share the same X-axis settings. This ensures consistent comparison across plots.

**Q: How many plots can I add?**
A: No hard limit, but 2-4 plots work best for readability.

**Q: Can I reorder plots?**
A: Not currently. Create plots in the order you want them to appear.

**Q: What happens to the current data when I switch plots?**
A: Your data is automatically saved when switching between plots. No need to manually save.

**Q: Can I delete all plots?**
A: No, at least one plot is required. You can edit or replace the last plot.

## What's New in v2.3.0
- ✨ Multi-plot support with unlimited plots
- 🎨 Vertical and horizontal layout options  
- ✏️ Full-screen plot editor modal
- 🏷️ Individual plot subtitles
- 📥 Automatic combined download (SVG/PNG)
- 💾 Enhanced project save/load with multi-plot support
- 🔄 Seamless plot switching with auto-save
- 📊 Plot management interface with tabs

## Known Limitations
- X-axis settings are shared across all plots
- Font and dimension settings apply globally
- Plots cannot be reordered after creation (workaround: delete and recreate)
- Combined download uses current plot's rendering (will be enhanced in future)

For questions or feature requests, refer to the main documentation or create an issue on GitHub.

---

**Version:** 2.3.0  
**Release Date:** November 18, 2025  
**Compatibility:** Backward compatible with v2.2.x project files
