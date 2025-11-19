# Forest Plot Generator v3.0.0

A professional desktop application for generating publication-ready forest plots with **multi-plot support**, advanced customization options, and smart axis controls.

## 🌟 What's New in v3.0.0

### 🎉 Multi-Plot Feature
**Create multiple forest plots within a single project!**

- **Tabbed Interface**: Easy navigation between unlimited plots
- **Flexible Layouts**: Arrange plots vertically (stacked) or horizontally (side-by-side)
- **Independent Data**: Each plot has its own dataset and settings
- **Global Controls**: Set main title and layout for all plots at once
- **Single Export**: Export all plots as one combined image

Perfect for:
- Comparing subgroups (men vs. women, age groups)
- Showing multiple outcomes (primary, secondary, safety)
- Time-series analyses (6-month, 12-month, 24-month)
- Sensitivity analyses (different models, study qualities)

👉 **See [NEW_FEATURES_v3.0.0.md](NEW_FEATURES_v3.0.0.md) for complete multi-plot guide**  
👉 **See [MIGRATION_GUIDE_v3.0.0.md](MIGRATION_GUIDE_v3.0.0.md) for upgrade instructions**

---

## 📊 Core Features

### Data Management
- **Manual Entry**: Easy-to-use table interface for entering data
- **Excel Import**: Step-by-step wizard for importing from .xlsx files with column mapping
- **CSV Import**: Quick import from CSV files
- **Project Save/Load**: Save entire multi-plot projects (data + settings) as JSON
- **Smart Column Detection**: Automatically identifies data columns in Excel

### Multi-Plot Organization (NEW in v3.0.0)
- **Unlimited Plots**: Create as many plots as needed in one project
- **Tab Navigation**: Switch between plots with single click
- **Vertical Layout**: Stack plots one above another (default)
- **Horizontal Layout**: Display plots side-by-side for comparison
- **Plot Management**: Add, remove, and rename plots easily
- **Data Isolation**: Complete independence between plots

### Section Organization
- **Group/Section Support**: Organize variables into labeled sections
- **Section Headers**: Automatically displayed in bold, larger font
- **Customizable Spacing**: Control gap before/after section titles
- **Manual Positioning**: Set custom display order within sections
- Perfect for organizing by outcome types (e.g., "Mortality", "Morbidity", "Safety")

### Advanced Formatting
- **P-Value Display**: Optional p-values next to confidence intervals
- **Variable Alignment**: Choose left or right alignment for variable names
- **Section Title Font Size**: Independent font size for section headers (8-48px)
- **Flexible Spacing**: Fine-tune spacing including negative values for ultra-tight layouts
- **Exact Number Formatting**: Display numbers exactly as entered (no extra zeros)

### Color Customization
- **55+ Color Options** organized by family:
  - Grays, Blues, Greens, Reds/Pinks
  - Oranges/Yellows, Purples, Browns
  - Specialty colors like Turquoise, Salmon, Silver
- **Auto Mode**: Automatically colors significant vs. non-significant results
- **Per-Variable Control**: Set custom colors for individual variables
- **Per-Plot Colors**: Each plot can have its own color scheme

### Smart Axis Controls

#### Automatic Mode (Recommended)
- Intelligent range calculation with 15% padding
- Smart tick mark generation
- Optimized for both linear and logarithmic scales
- Always includes OR=1.0 when relevant
- Crash-proof with comprehensive validation

#### Manual Mode
- Set custom X-axis minimum and maximum values
- Specify exact tick mark positions (comma-separated)
- Full control over axis appearance
- Perfect for standardizing across multiple plots
- Input validation prevents crashes

### Visualization Options
- **Scale Types**: Linear or Logarithmic
- **Gridlines**: Optional dashed gridlines at tick marks
- **Meta-Analysis Mode**: Display pooled effect with diamond marker
- **Custom Dimensions**: Adjustable plot width and height per plot
- **Font Selection**: 6 professional fonts available
- **Adjustable Font Size**: Fine-tune text sizing for each plot

### Export Options
- **SVG Export**: Vector graphics for infinite scalability (all plots combined)
- **High-Resolution PNG**: 800 DPI for publication quality (all plots combined)
- **Multi-Plot Export**: Single image contains all plots in chosen layout
- **Project Files**: Save/load complete multi-plot projects with all settings

---

## 🚀 Getting Started

### Installation
1. Download the latest release (v3.0.0)
2. Run the installer (Windows or macOS)
3. Launch Forest Plot Generator

### Quick Start (Single Plot)
1. Choose **Manual Entry** or import from **Excel/CSV**
2. Enter your data (Variable name, OR, Lower CI, Upper CI)
3. (Optional) Add section names in the Group/Section column
4. Customize settings (colors, fonts, axis range)
5. Export as SVG or PNG

### Quick Start (Multi-Plot) - NEW!
1. Create your first plot as above
2. Click the **"+"** button to add Plot 2
3. Switch between plots using tabs
4. Each plot has independent data and settings
5. Choose layout in **Global Settings** (Vertical or Horizontal)
6. Add a **Main Title** to label the entire figure
7. Export - all plots combined in one image!

👉 **Complete tutorial: [QUICKSTART_v3.0.0.md](QUICKSTART_v3.0.0.md)**

---

## 📝 Data Format

### Required Fields
- **Variable**: Name or label for each row
- **OR**: Odds Ratio (or other effect measure)
- **Lower CI**: Lower confidence interval bound
- **Upper CI**: Upper confidence interval bound

### Optional Fields
- **P-Value**: Statistical significance (displayed if "Show P-Values" enabled)
- **Sample Size**: Number of observations
- **Group/Section**: Section name for grouping
- **Position**: Custom sort order within sections
- **Color**: Custom color (or "Auto" for automatic)

### Excel/CSV Format Example
```
Variable,OR,Lower CI,Upper CI,P-Value,Sample Size,Group/Section,Position
Alcohol,7.34,3.42,14.94,0.001,250,Mortality,1
Chronic Hep C,3.34,1.10,8.47,0.032,250,Mortality,2
Chronic Hep B,0.24,0.03,0.96,0.045,250,Mortality,3
ICU Admission,2.15,1.20,3.85,0.010,250,Morbidity,1
```

---

## 🎨 Use Cases

### Single-Plot Mode (Classic)
- **Clinical Research**: Display odds ratios, relative risks, hazard ratios
- **Meta-Analysis**: Show pooled effects across multiple studies
- **Systematic Reviews**: Present individual study results
- **Epidemiological Studies**: Display risk factors and associations

### Multi-Plot Mode (NEW in v3.0.0)
- **Subgroup Analysis**: Compare men vs. women, young vs. old
- **Multiple Outcomes**: Primary, secondary, and safety outcomes side-by-side
- **Time-Series**: Show progression at 6, 12, 24 months
- **Sensitivity Analysis**: Main analysis + various sensitivity checks
- **Publication Figures**: Create multi-panel figures without external editing
- **Comparative Studies**: Different treatments, populations, or time periods

---

## 🎨 Customization Tips

### For Publication (Single or Multi-Plot)
- Use **Linear scale** for narrow ranges (0.5-2.0)
- Use **Logarithmic scale** for wide ranges (0.1-10+)
- Enable **Gridlines** for easier value reading
- Choose **Arial** or **Times New Roman** for formal publications
- Match axis ranges across plots when comparing
- Export as **SVG** for journal submissions

### For Presentations
- Use **larger font sizes** (16-18)
- Enable **bold colors** for key findings
- Use **section grouping** to organize by outcome type
- Use **horizontal layout** for side-by-side comparisons
- Export as **high-res PNG** for PowerPoint/Keynote

### For Multi-Plot Projects
- **Consistent Dimensions**: Use same width/height across all plots
- **Matched Scales**: Set manual axis ranges to align plots
- **Color Coordination**: Use similar colors for related variables
- **Descriptive Titles**: Name each plot clearly
- **Meaningful Main Title**: Use global title to tie plots together

### For Wide Data Ranges
- Switch to **Logarithmic scale**
- Use **Manual axis mode** to set sensible bounds
- Specify **custom tick marks** (e.g., 0.1, 0.5, 1, 2, 5, 10)

---

## 🔧 Advanced Features

### Multi-Plot Management (v3.0.0)
Create complex figures with multiple plots:
- **Add Plots**: Click "+" button in tab bar
- **Remove Plots**: Click "×" on plot tab (minimum 1 plot required)
- **Switch Plots**: Click any tab to edit that plot
- **Rename Plots**: Change title field - tab updates automatically
- **Global Settings**: Control main title and layout for all plots
- **Independent Settings**: Each plot has its own data, colors, fonts, axes

### Section Grouping
Group variables by category (e.g., mortality outcomes, morbidity outcomes, laboratory findings):
- Displays section headers in bold
- Adjustable spacing before/after section titles
- Maintains order as entered
- Independent font size for section titles
- Manual position control within sections

### Smart Axis Scaling
The automatic mode intelligently:
- Calculates optimal min/max values
- Adds appropriate padding (15%)
- Rounds to "nice" numbers
- Generates evenly-spaced tick marks
- Adapts to linear or logarithmic scales
- Validates input to prevent crashes

### Manual Axis Control
For precise control:
1. Set **Axis Mode** to "Manual Control"
2. Enter **Min Value** (e.g., 0.1)
3. Enter **Max Value** (e.g., 20)
4. (Optional) Enter **Tick Values**: `0.1, 0.5, 1, 2, 5, 10, 20`
5. Comprehensive validation prevents crashes

### P-Value Display
Enable p-values to show statistical significance:
- Format: "OR (95% CI) p=value"
- Shows "p=<0.001" for very small p-values
- Displays exact values as entered
- Automatic margin adjustment to fit text

---

## 📖 Documentation

### v3.0.0 Documentation
- **[QUICKSTART_v3.0.0.md](QUICKSTART_v3.0.0.md)** - 5-minute tutorial for multi-plot
- **[NEW_FEATURES_v3.0.0.md](NEW_FEATURES_v3.0.0.md)** - Complete multi-plot guide
- **[CHANGELOG_v3.0.0.md](CHANGELOG_v3.0.0.md)** - Technical changelog
- **[MIGRATION_GUIDE_v3.0.0.md](MIGRATION_GUIDE_v3.0.0.md)** - Upgrade from v2.x.x

### Previous Versions
- **[CHANGELOG.md](CHANGELOG.md)** - Complete version history
- **[NEW_FEATURES_v2.3.0.md](NEW_FEATURES_v2.3.0.md)** - v2.3.0 features
- **[EXCEL_IMPORT_GUIDE.md](EXCEL_IMPORT_GUIDE.md)** - Excel import tutorial

---

## 📋 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### v3.0.0 (Current) - Multi-Plot Release
- **Multi-plot system** with tabbed interface
- **Flexible layouts** (vertical/horizontal)
- **Global settings** panel
- **Individual plot settings** per plot
- **Enhanced data isolation**
- **Improved spacing logic**
- **Better label positioning**
- **Backward compatible** with v2.x.x projects

### v2.3.0
- Multi-plot feature development (internal)

### v2.2.3
- Critical crash fix for invalid X-axis ranges
- Comprehensive input validation
- Error display instead of crashes

### v2.2.2
- Exact number formatting (no extra zeros)

### v2.2.1
- Independent section title font size
- Negative spacing values allowed

### v2.2.0
- Manual position control
- Enhanced spacing controls
- P-value display
- Variable alignment option

### v2.1.0
- Section/group support
- Extended color palette (55+ colors)
- Smart automatic axis scaling
- Manual X-axis controls

### v2.0.0
- Excel import wizard
- Project save/load
- Meta-analysis mode
- Multiple customization options

---

## 🆘 Support & Help

### Quick Help
- **Getting Started**: [QUICKSTART_v3.0.0.md](QUICKSTART_v3.0.0.md)
- **Multi-Plot Guide**: [NEW_FEATURES_v3.0.0.md](NEW_FEATURES_v3.0.0.md)
- **Upgrading**: [MIGRATION_GUIDE_v3.0.0.md](MIGRATION_GUIDE_v3.0.0.md)

### Troubleshooting
- Check the FAQ section in NEW_FEATURES_v3.0.0.md
- Review MIGRATION_GUIDE_v3.0.0.md for common issues
- Ensure you're running the latest version (v3.0.0)

### Reporting Issues
For bugs, questions, or feature requests:
1. Check existing documentation
2. Verify issue persists in latest version
3. Contact development team with details

---

## 🔐 System Requirements

- **Windows**: Windows 10 or later (64-bit)
- **macOS**: macOS 10.13 or later
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 200MB for installation
- **Display**: 1280×720 minimum resolution

---

## 📄 License

Copyright © 2025 Forest Plot Generator. All rights reserved.

---

## 🙏 Acknowledgments

Built with modern web technologies for a native desktop experience:
- **Electron** - Cross-platform desktop framework
- **React** - User interface library
- **XLSX.js** - Excel file processing
- **PapaParse** - CSV parsing
- **Lucide Icons** - Beautiful icon set

---

**Version:** 3.0.0 - Multi-Plot Release  
**Release Date:** January 2025  
**Platform:** Windows & macOS  
**Build:** Electron 28

---

## 🚀 Get Started Now!

1. **Download** the latest release
2. **Install** on your system
3. **Read** QUICKSTART_v3.0.0.md (5 minutes)
4. **Create** your first multi-plot forest plot!

**Happy plotting! 🌲📊**
