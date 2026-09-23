# Changelog

All notable changes to the Forest Plot Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Random-effects meta-analysis.** Under *Meta-analysis Mode*, each plot can pool with a fixed-effect (inverse variance, as before) or a DerSimonian–Laird random-effects model. The pooled row names its model, and with two or more studies a heterogeneity line reports I², the Cochran's Q p-value and, for random effects, τ². Existing projects keep fixed effect.
- **Crash-screen backup.** If the editor ever hits an error, the crash screen offers *Download backup*: your project as it was just before the error.

### Fixed
- **Negative "Space After Section Title" works again.** Since 3.1.0 a negative value silently fell back to 5, making spacing wider instead of tighter.
- **Axis labels show their real values.** An axis around 1 read `0.9, 1.0, 1.0, 1.1, 1.1` (0.95 printed as `1.0`), and log ticks below 0.005 read `0.00`. 1 was also sometimes drawn twice.
- **The automatic axis no longer clips data.** It never went below 0.01, so rare-event ratios were pinned to the edge of a log axis, and a linear axis whose values were all below 0.01 came out backwards. It now covers all the data, the pooled interval, and the line of no effect.
- **The line of no effect is drawn when the axis starts or ends exactly at 1**, which is where a log axis usually starts.
- **Wide log axes no longer print colliding tick labels** (`0.0010.002`); past three decades only powers of ten are labelled.
- **Dropping a file onto the window no longer replaces the app** and discards unsaved work.
- **European p-values are read.** `0,025`, `0,001` and `-0,125` were dropped; only an ambiguous thousands group such as `1,520` is still refused. A p-value that cannot be read (`ns`, `<0.05`) is now reported in the import summary instead of vanishing.
- **More confidence-limit headers are recognised**: `Lower 95% CI`, `95% CI upper`, `LL`/`UL` and similar.
- **Excel import wizard**: recognised columns are pre-selected; the choices reset when the columns change (they used to keep pointing at columns that no longer existed); a slow preview can no longer overwrite a newer one; and a sheet that cannot be read shows an error instead of leaving the wizard stuck.
- **An empty or header-only CSV, or an empty Excel range, no longer wipes the current plot.** Malformed CSV lines are reported.
- **No dangling `p=`** on rows without a p-value, and very small p-values read `p<0.001` rather than `p=<0.001`.
- **Hand-edited or old project files are cleaned up on load**: an object where text belongs used to crash the editor, a non-object row is rejected with its location, and rows or plots sharing an id no longer edit together.
- The crash screen no longer claims "your last action has not been applied".

### Security
- **SheetJS upgraded from 0.18.5 to 0.20.3**, fixing CVE-2023-30533 (prototype pollution from a crafted file) and CVE-2024-22363 (ReDoS). SheetJS publishes 0.20.x only on its own CDN, so it is installed through the npm alias `xlsx` → `@e965/xlsx@0.20.3`, a republish of the official build whose integrity hash is pinned in `package-lock.json`. To install from SheetJS directly instead: `npm i xlsx@https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.
- **Spreadsheets are parsed in an isolated process** (`xlsx-worker.js`, one Electron utility process per open file) rather than the main process. A parser bug triggered by a crafted file stays in that process, and a parse that hangs is stopped after a timeout instead of freezing the app.
- The window refuses to navigate away from the app or open new windows.

### Changed
- CI installs with `npm ci`, so builds use exactly the locked dependencies.

## [3.1.0] - 2026-09-21

### Fixed
- **PNG export now works.** It read plot dimensions from the wrong settings object, so the canvas came out zero-sized and "Download PNG (800 DPI)" silently did nothing. Multi-plot figures now export in full instead of being cropped to one plot.
- **Plot error messages are visible.** The X-axis validation messages were built as HTML inside the `<svg>`, so they rendered nothing: an invalid axis produced a blank preview with no explanation.
- **Pooled effect is a real meta-analysis.** It averaged the odds ratios and the confidence limits with every study weighted equally. It now uses fixed-effect inverse-variance weighting on the log scale and reports an actual p-value instead of the text `p=pooled`.
- **The app works offline.** React, Tailwind, PapaParse and Lucide were fetched from CDNs at runtime, so the app showed a blank window without internet access. All libraries are now bundled.
- **Imports no longer invent numbers.** Unreadable cells became OR 1.0, CI 0.8-1.2, p 0.05. They are now left empty and reported. European decimals (`1,52`) are understood.
- **CSV columns are matched by name**, so a file whose columns are in a different order no longer imports silently swapped values.
- **The import range follows the sheet**, instead of a fixed A1:E10 that truncated anything larger.
- **Malformed project files no longer white-screen the app**; they are validated before anything is loaded, and an error boundary catches anything else.
- **Clearing a numeric field no longer blanks the plot.**
- **Confidence intervals that run past the axis are drawn with arrowheads**, so they are no longer indistinguishable from intervals that genuinely end there.
- **The Position column orders sections too**, and the editing table now shows the same order as the plot.
- **DevTools no longer opens in shipped builds**, and Ctrl+R (which discards unsaved work) is limited to development.
- **Edit menu restored**, so Cmd+C/V/X/A/Z and Quit work on macOS.

### Changed
- **The Excel "first row contains column headers" checkbox now does what it says.** It was inverted: ticking it named the columns `0,1,2,3` and imported the header row as data, while unticking it gave the intended result. If you had learned to untick it, tick it from now on.
- The renderer runs sandboxed with no Node access; spreadsheet parsing moved to the main process.

### Added
- Unit tests (`npm test`), an end-to-end smoke test (`npm run test:smoke`) and linting (`npm run lint`), all run in CI before any installer is built.

## [3.0.2] - 2025-11-20

### Fixed
- Fixed zoom shortcuts (`Ctrl +`, `Ctrl -`, `Ctrl 0`) not working by implementing native application menu roles.

## [3.0.1] - 2025-11-20

### Fixed
- Fixed an issue where custom plot titles ("A", "B", etc.) were not being displayed in the rendered plots.

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

## [2.2.3] - 2025-01-XX

### Fixed
- **Critical Crash Fix**: App no longer crashes with invalid X-axis ranges
  - Fixed crash when entering very small minimum values (e.g., 0.02)
  - Fixed "RangeError: Invalid array length" error
  - No more data loss from crashes
  
### Added
- **Comprehensive X-Axis Validation**: Input validation prevents crashes
  - Validates min < max before rendering
  - Ensures all values are positive (> 0)
  - Checks for excessively small ranges
  - Detects invalid number inputs
  - Shows clear error messages with current values
  
- **Error Display**: Friendly error messages instead of crashes
  - Specific error messages for each validation failure
  - Displays current problematic values
  - Provides suggestions for fixing issues
  - App continues running (no crash!)
  
- **Infinite Loop Prevention**: Added safeguards in tick generation
  - Maximum iteration limits (20-100 iterations)
  - Validation for infinite/NaN values
  - Fallback tick values if generation fails
  - Prevents division by zero errors

### Improved
- Better error handling throughout rendering process
- More robust tick generation algorithm
- Safer number parsing and validation
- Data preservation during errors

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
