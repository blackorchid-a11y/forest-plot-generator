# Changelog - Forest Plot Generator

## Version 2.3.0 (November 18, 2025)

### 🎉 Major New Features
- **Multi-Plot Support**: Create multiple forest plots in a single file
  - Add unlimited plots with "+ Add Plot" button
  - Each plot has independent dataset and subtitle
  - Visual tab interface for switching between plots
  - Plot counter shows number of variables in each plot

- **Layout Options**: Choose how to arrange multiple plots
  - **Vertical Layout**: Stack plots below each other
  - **Horizontal Layout**: Arrange plots side-by-side
  - Instant layout switching

- **Plot Editor Modal**: Full-screen interface for editing individual plots
  - Complete data table with all editing features
  - CSV/Excel import per plot
  - Subtitle editing
  - Add/delete rows
  - Color and group management
  - Save/cancel functionality

- **Combined Download**: Single-file export for multiple plots
  - SVG and PNG support
  - Automatic arrangement based on layout choice
  - Main title + individual subtitles
  - Proper spacing and alignment
  - Shared footnote

### ✨ Enhancements
- Auto-save when switching between plots
- Plot management with edit (✏️) and delete (🗑️) buttons
- Visual indicators for active plot
- Project files now include all plots and layout settings
- Backward compatibility with v2.2.x project files
- Version number in saved project files

### 🔧 Technical Improvements
- UseEffect hook for data synchronization
- State management for multiple plots
- Plot switching logic with data preservation
- Enhanced save/load functionality
- Modular component architecture

### 📚 Documentation
- Comprehensive multi-plot feature guide
- Usage examples and workflows
- Best practices for layout selection
- Troubleshooting section

---

## Version 2.2.3 (Previous Release)

### 🐛 Bug Fixes
- CRASH FIX: Comprehensive validation for manual X-axis settings
- Prevents crashes from invalid min/max values
- Validates positive numbers and proper ranges
- Clear error messages for invalid configurations
- Prevents extremely small ranges that cause rendering issues

### 🛡️ Input Validation
- X-axis minimum must be valid number
- X-axis maximum must be valid number
- Minimum must be less than maximum
- Both values must be positive (> 0)
- Range must be >= 0.01
- Logarithmic scale range warnings

---

## Version 2.2.2

### ✨ New Features
- P-value display option next to OR (95% CI)
- Left-aligned variable names option
- Enhanced data management with manual position control

---

## Version 2.2.1

### ✨ New Features
- Independent font sizing for section/group titles
- Fine-grained spacing controls:
  - Space before group title
  - Space after group title (before variables)
- Variable position control within groups

### 🔧 Improvements
- Backward compatibility for spacing settings
- Automatic migration of old groupSpacing values
- Preserved spacing behavior for existing projects

---

## Version 2.2.0

### ✨ New Features
- Advanced X-Axis Control:
  - Auto mode: Intelligent scaling with 15% padding
  - Manual mode: Custom min/max values
  - Custom tick marks (comma-separated)
- Smart tick generation for both linear and logarithmic scales
- Always includes 1.0 tick mark when in range

### 🎨 Enhancements
- 55+ color palette options organized by color families
- Improved section grouping with bold headers
- Better visual hierarchy

---

## Version 2.1.0

### ✨ New Features
- Excel Import Wizard:
  - Multi-step import process
  - Sheet selection
  - Cell range specification
  - Column mapping interface
  - Data preview
- CSV import support
- Section grouping for variables
- Enhanced color customization

### 🔧 Improvements
- Logarithmic scale support
- Grid lines toggle
- Customizable fonts
- Plot dimension controls
- Better error handling

---

## Version 2.0.0

### Initial Features
- Basic forest plot generation
- Manual data entry
- Odds ratios with confidence intervals
- Statistical significance detection
- SVG and PNG export
- Project save/load

---

## Version History Summary

- **v2.3.0**: Multi-plot support, layout options, combined downloads
- **v2.2.3**: Crash prevention with X-axis validation
- **v2.2.2**: P-values display, left-align variables option
- **v2.2.1**: Independent group title fonts, advanced spacing
- **v2.2.0**: Custom X-axis control, expanded color palette
- **v2.1.0**: Excel import wizard, grouping, CSV support
- **v2.0.0**: Initial release with core features

---

**Note**: Each version maintains backward compatibility with project files from previous versions. The application automatically migrates settings when loading older project files.
