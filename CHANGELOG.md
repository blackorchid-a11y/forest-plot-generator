# Changelog

All notable changes to the Forest Plot Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-XX

### Added
- **Section/Group Support**: Organize forest plot data into labeled sections
  - New "Group/Section" column in data entry table
  - Section headers displayed in bold, larger font above each group
  - Customizable section spacing control (0-100 pixels)
  - Excel/CSV import now supports group field mapping
  
- **Extended Color Palette**: Expanded from 6 to 55+ colors
  - Blues: Navy, Royal Blue, Sky Blue, Teal, Cyan, and more
  - Greens: Dark Green, Forest Green, Lime, Olive, Mint, Emerald
  - Reds/Pinks: Maroon, Crimson, Coral, Pink, Magenta, Rose
  - Oranges/Yellows: Dark Orange, Gold, Amber, Mustard
  - Purples: Indigo, Violet, Lavender, Orchid, Plum
  - Browns: Brown, Chocolate, Sienna, Tan, Beige
  - And more specialty colors
  
- **Smart Axis Scaling**: Intelligent automatic X-axis range calculation
  - Linear scale: Adds 15% padding and rounds to nice numbers
  - Logarithmic scale: Uses powers of 10 with smart intermediate ticks
  - Always includes OR=1.0 when within data range
  
- **Manual X-Axis Controls**: Full control over X-axis display
  - Set custom minimum and maximum values
  - Specify custom tick mark values (comma-separated)
  - Auto-generate ticks based on min/max when custom ticks not provided
  - Switch between automatic and manual modes
  
### Improved
- Better tick mark generation for both linear and logarithmic scales
- Smarter number formatting (whole numbers for large values, decimals for small)
- Enhanced gridline appearance (dashed lines for better readability)
- Values outside axis range are now properly clipped
- More intuitive axis behavior for wide data ranges

### Fixed
- Logarithmic scale now handles intermediate values (0.2, 0.5, 2, 5) correctly
- Better handling of edge cases in axis range calculation

## [2.0.0] - 2025-01-XX

### Added
- Excel import wizard with step-by-step column mapping
- CSV file upload support
- Project save/load functionality (JSON format)
- Meta-analysis mode with pooled effect calculation
- Customizable plot dimensions
- Multiple font options (Arial, Times New Roman, Calibri, Comfortaa, Georgia, Verdana)
- Adjustable font size
- Linear and logarithmic scale options
- Optional gridlines
- Customizable title and footnote
- Color customization per variable
- High-resolution PNG export (800 DPI)
- SVG export for vector graphics

### Changed
- Complete UI redesign with modern interface
- Improved data entry table with inline editing
- Better visual feedback for invalid data

## [1.0.0] - Initial Release

### Added
- Basic forest plot generation
- Manual data entry
- Simple export options
