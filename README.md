# Forest Plot Generator v2.1.0

A professional desktop application for generating publication-ready forest plots with advanced features including section grouping, extensive customization options, and smart axis controls.

## 🌟 Key Features

### Data Management
- **Manual Entry**: Easy-to-use table interface for entering data
- **Excel Import**: Step-by-step wizard for importing from .xlsx files with column mapping
- **CSV Import**: Quick import from CSV files
- **Project Save/Load**: Save your entire project (data + settings) as JSON

### Section Organization
- **Group/Section Support**: Organize your variables into labeled sections
- **Section Headers**: Automatically displayed in bold, larger font
- **Customizable Spacing**: Control the gap between sections (0-100 pixels)
- Perfect for organizing by outcome types (e.g., "Exitus", "ICU Admission", "Acute Hepatic Failure")

### Color Customization
- **55+ Color Options** organized by family:
  - Grays, Blues, Greens, Reds/Pinks
  - Oranges/Yellows, Purples, Browns
  - Specialty colors like Turquoise, Salmon, Peach
- **Auto Mode**: Automatically colors significant vs. non-significant results
- **Per-Variable Control**: Set custom colors for individual variables

### Smart Axis Controls

#### Automatic Mode (Recommended)
- Intelligent range calculation with 15% padding
- Smart tick mark generation
- Optimized for both linear and logarithmic scales
- Always includes OR=1.0 when relevant

#### Manual Mode
- Set custom X-axis minimum and maximum values
- Specify exact tick mark positions (comma-separated)
- Full control over axis appearance
- Perfect for standardizing across multiple plots

### Visualization Options
- **Scale Types**: Linear or Logarithmic
- **Gridlines**: Optional dashed gridlines at tick marks
- **Meta-Analysis Mode**: Display pooled effect with diamond marker
- **Custom Dimensions**: Adjustable plot width and height
- **Font Selection**: 6 professional fonts available
- **Adjustable Font Size**: Fine-tune text sizing

### Export Options
- **SVG Export**: Vector graphics for infinite scalability
- **High-Resolution PNG**: 800 DPI for publication quality
- **Project Files**: Save/load complete projects with all settings

## 📊 Use Cases

- **Clinical Research**: Display odds ratios, relative risks, hazard ratios
- **Meta-Analysis**: Show pooled effects across multiple studies
- **Systematic Reviews**: Compare multiple outcomes or subgroups
- **Epidemiological Studies**: Present risk factors and associations

## 🚀 Getting Started

### Installation
1. Download the latest release
2. Run the installer
3. Launch Forest Plot Generator

### Quick Start
1. Choose **Manual Entry** or import from **Excel/CSV**
2. Enter your data (Variable name, OR, Lower CI, Upper CI)
3. (Optional) Add section names in the Group/Section column
4. Customize settings (colors, fonts, axis range)
5. Export as SVG or PNG

## 📝 Data Format

### Required Fields
- **Variable**: Name or label for each row
- **OR**: Odds Ratio (or other effect measure)
- **Lower CI**: Lower confidence interval bound
- **Upper CI**: Upper confidence interval bound

### Optional Fields
- **P-Value**: Statistical significance
- **Sample Size**: Number of observations
- **Group/Section**: Section name for grouping
- **Color**: Custom color (or "Auto" for automatic)

### Excel/CSV Format Example
```
Variable,OR,Lower CI,Upper CI,P-Value,Sample Size,Group/Section
Alcohol,7.34,3.42,14.94,0.001,250,Exitus
Chronic Hep C,3.34,1.10,8.47,0.032,250,Exitus
Chronic Hep B,0.24,0.03,0.96,0.045,250,Exitus
Hepatic Insufficiency,5.82,1.91,15.89,0.001,250,Exitus
```

## 🎨 Customization Tips

### For Publication
- Use **Linear scale** for narrow ranges (0.5-2.0)
- Use **Logarithmic scale** for wide ranges (0.1-10+)
- Enable **Gridlines** for easier value reading
- Choose **Arial** or **Times New Roman** for formal publications
- Export as **SVG** for journal submissions

### For Presentations
- Use **larger font sizes** (16-18)
- Enable **bold colors** for key findings
- Use **section grouping** to organize by outcome type
- Export as **high-res PNG** for PowerPoint/Keynote

### For Wide Data Ranges
- Switch to **Logarithmic scale**
- Use **Manual axis mode** to set sensible bounds
- Specify **custom tick marks** (e.g., 0.1, 0.5, 1, 2, 5, 10)

## 🔧 Advanced Features

### Section Grouping
Group your variables by category (e.g., mortality outcomes, morbidity outcomes, laboratory findings). The app automatically:
- Displays section headers in bold
- Adds customizable spacing between sections
- Maintains order as entered

### Smart Axis Scaling
The automatic mode intelligently:
- Calculates optimal min/max values
- Adds appropriate padding (15%)
- Rounds to "nice" numbers
- Generates evenly-spaced tick marks
- Adapts to linear or logarithmic scales

### Manual Axis Control
For precise control:
1. Set **Axis Mode** to "Manual Control"
2. Enter **Min Value** (e.g., 0.1)
3. Enter **Max Value** (e.g., 20)
4. (Optional) Enter **Tick Values**: `0.1, 0.5, 1, 2, 5, 10, 20`

## 📖 Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### v2.1.0 (Current)
- Section/group support
- Extended color palette (55+ colors)
- Smart automatic axis scaling
- Manual X-axis controls

### v2.0.0
- Excel import wizard
- Project save/load
- Meta-analysis mode
- Multiple customization options

## 🤝 Support

For issues, questions, or feature requests, please contact the development team.

## 📄 License

Copyright © 2025 Forest Plot Generator. All rights reserved.

---

**Built with:** Electron, React, XLSX.js, PapaParse  
**Version:** 2.1.0  
**Platform:** Windows (macOS version available)
