# Changelog

All notable changes to the Forest Plot Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.2] - 2025-01-XX

### Added
- **Exact Number Formatting**: OR and CI values now display exactly as entered
  - No unnecessary trailing zeros added
  - 0.4 displays as "0.4" instead of "0.40"
  - 1.5 displays as "1.5" instead of "1.50"
  - 2 displays as "2" instead of "2.00"
  - Preserves exact user input precision

### Improved
- Consistent number formatting across all displays (OR, CI, and p-values)
- Cleaner, more professional appearance
- Numbers display exactly as entered in data table
- Applies to regular variables and pooled effect in meta-analysis mode

## [2.2.1] - 2025-01-XX

### Added
- **Independent Section Title Font Size**: Separate font size control for section/group titles
  - New "Section Title Font Size" setting (default: 16px)
  - Range: 8-48 pixels
  - Section titles can now be larger or smaller than variable names
  - Regular variables use the standard "Font Size" setting
  
- **Enhanced Spacing Control**: Negative values now allowed for "Space After Section Title"
  - New range: -20 to 100 pixels (previously 0 to 100)
  - Negative values create ultra-tight layouts with section titles very close to variables
  - Useful for compact forest plots with minimal spacing

### Improved
- Better control over section title prominence through independent sizing
- More flexible layout options with negative spacing values
- Backward compatibility with v2.2.0 projects (auto-assigns default section title font size)

## [2.2.0] - 2025-01-XX

### Added
- **Manual Position Control**: Set custom display order for variables within groups
  - New "Position" column in data entry table
  - Variables sorted by position number within each section
  - Independent positioning for each group/section
  - Automatic position assignment for new rows
  
- **Enhanced Spacing Controls**: Separate controls for section title spacing
  - "Space Before Section Title": Adjust gap above section headers (default: 20px)
  - "Space After Section Title": Adjust gap below section headers (default: 5px)
  - Replace old single spacing control with more flexible dual controls
  - Better visual separation between sections
  
- **P-Value Display**: Optional p-value display next to OR (95% CI)
  - New "Show P-Values" checkbox in settings
  - Displays exact p-value as entered (no unnecessary trailing zeros)
  - Format: "1.50 (1.20-1.90) p=0.341"
  - Shows "p=<0.001" for very small p-values
  - Automatic margin adjustment to accommodate p-value text
  
- **Variable Alignment Option**: Choose left or right alignment for variable names
  - New "Align Variables Left" checkbox in settings
  - Default: Right-aligned (text ends at plot edge)
  - Optional: Left-aligned (text starts at left margin)
  - Applies to all left-side text including section titles

### Improved
- Automatic right margin expansion when p-values are enabled (150px → 220px)
- Backward compatibility with old project files (auto-migration of settings)
- Better handling of missing position and spacing fields in legacy files
- Enhanced data import with automatic position assignment

### Fixed
- Section spacing now properly calculated using separate before/after values
- P-value formatting preserves user input precision

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
