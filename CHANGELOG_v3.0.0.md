# Changelog for Version 3.0.0

## [3.0.0] - 2025-01-XX

### 🎉 Major New Features

#### **Multi-Plot System**
- **Multiple Forest Plots in One Project**: Create and manage unlimited forest plots within a single project file
- **Tabbed Interface**: Easy navigation between plots with intuitive tab controls
  - Add new plots with the "+" button
  - Remove plots individually (cannot delete the last plot)
  - Switch between plots with a single click
  - Each tab shows the plot's title for easy identification
- **Flexible Layout Options**: 
  - **Vertical Layout**: Stack plots one above another (default)
  - **Horizontal Layout**: Display plots side-by-side
  - Global layout control applies to all plots simultaneously
- **Individual Plot Settings**: Each plot maintains its own:
  - Dataset (variables, OR values, confidence intervals, p-values)
  - Plot title and footnote
  - Axis settings (scale, range, tick marks)
  - Color scheme and formatting
  - Section/group organization
  - Font size and spacing preferences
- **Global Settings Panel**: Control project-wide settings:
  - Main project title (displays above all plots)
  - Layout arrangement (vertical vs. horizontal)
  - Quick access to all plots from one location

### 🔧 Improvements

#### **Enhanced Layout Control**
- **Refined Spacing Logic**: Section titles no longer force excessive gaps
  - More precise control over space before and after section titles
  - Tighter, more compact layouts possible
  - Better visual balance in grouped data
- **Improved Label Positioning**: Fixed alignment issues
  - "OR (95% CI)" header correctly positioned in all layouts
  - P-value labels properly aligned when enabled
  - Consistent spacing across all plot elements

#### **Better Data Management**
- **Complete Data Isolation**: Each plot's data is fully independent
  - Editing one plot no longer affects others
  - Copy/paste between plots without interference
  - Safe deletion of plots without impacting remaining data
- **Project File Compatibility**: 
  - Backward compatible with v2.x.x single-plot projects
  - Automatic migration of old projects to multi-plot format
  - Preserves all settings and data during upgrade

### 🐛 Bug Fixes
- Fixed issue where editing data in one plot could affect other plots
- Corrected "OR (95% CI)" label positioning in various layouts
- Resolved spacing inconsistencies with section titles
- Improved group spacing calculation for more predictable layouts

### 💾 File Format
- Project files now store multiple plots in a unified structure
- Each plot saved with complete settings and data
- Global layout preferences preserved across sessions
- Full support for saving and loading multi-plot projects

### ⚙️ Technical Changes
- Refactored state management to support multiple independent plots
- Enhanced rendering engine for flexible layout arrangements
- Improved memory efficiency for large multi-plot projects
- Better error handling for plot operations

---

## Migration Notes for v2.x.x Users

**Your existing projects will continue to work!** When you load a v2.x.x project file:
- It will automatically convert to the new multi-plot format
- Your single plot will become "Plot 1" in the new system
- All your data, settings, and customizations are preserved
- You can immediately start adding more plots if desired

**No action required** - just open your old projects and they'll work seamlessly in v3.0.0.

---

## What's Next?

This multi-plot foundation opens possibilities for future enhancements:
- Plot templates for quick setup
- Bulk operations across multiple plots
- Advanced plot comparison features
- Enhanced export options for multi-plot documents
