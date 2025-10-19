# Version 2.1.0 - New Features Guide

## 🎯 Section Grouping

### What is it?
Organize your forest plot variables into labeled sections (like "Exitus", "ICU Admission", etc.) with automatic section headers and spacing.

### How to use:
1. In the data table, fill in the **"Group/Section"** column
2. Variables with the same section name will be grouped together
3. Section headers appear in **bold, larger font** above each group
4. Adjust **"Section Spacing"** in settings to control the gap between sections

### Example:
```
Variable          | Group/Section
------------------|----------------
Alcohol           | Exitus
Chronic Hep C     | Exitus
Chronic Hep B     | Exitus
Alcohol           | ICU Admission
Chronic Hep C     | ICU Admission
```

Result: Two sections with headers "Exitus" and "ICU Admission"

---

## 🎨 Extended Color Palette

### What's new?
Expanded from 6 colors to **55+ colors** organized by family!

### Available Colors:
- **Grays**: Black, Dark Gray, Medium Gray, Light Gray
- **Blues**: Navy Blue, Royal Blue, Blue, Sky Blue, Teal, Cyan, and more
- **Greens**: Dark Green, Forest Green, Lime Green, Olive, Mint, Emerald
- **Reds/Pinks**: Maroon, Dark Red, Red, Crimson, Coral, Pink, Magenta, Rose
- **Oranges/Yellows**: Dark Orange, Orange, Gold, Yellow, Amber, Mustard
- **Purples**: Indigo, Purple, Violet, Lavender, Plum, Orchid
- **Browns**: Brown, Chocolate, Sienna, Tan, Beige
- **Specialty**: Turquoise, Salmon, Peach, Khaki, Silver

### How to use:
1. For each row in the data table, click the **"Color"** dropdown
2. Select from 55+ colors or choose **"Auto"** for automatic coloring
3. Auto mode: Black for significant results, Gray for non-significant

---

## 📏 Smart Axis Controls

### Two Modes:

#### 1. Automatic Mode (Default) ✨
**Recommended for most users!**

The app automatically:
- Calculates the optimal X-axis range based on your data
- Adds 15% padding for better visualization
- Rounds to "nice" numbers (1, 2, 5, 10, etc.)
- Generates smart tick marks
- Works great for both linear and logarithmic scales

**Just enter your data and go!**

#### 2. Manual Mode 🎛️
**For precise control over axis appearance**

##### When to use:
- You want consistent axes across multiple plots
- You need specific tick mark positions
- You're working with unusual data ranges
- You want to emphasize certain values

##### How to use:
1. In settings, change **"Axis Mode"** to **"Manual Control"**
2. Set **"Min Value"** (e.g., `0.1`)
3. Set **"Max Value"** (e.g., `20`)
4. (Optional) Enter **"Tick Values"**: `0.1, 0.5, 1, 2, 5, 10, 20`
   - Leave empty to auto-generate based on min/max
5. The plot updates instantly!

##### Examples:

**Example 1: Small ORs (0.1 to 2)**
```
Min Value: 0.1
Max Value: 2
Tick Values: 0.1, 0.25, 0.5, 1, 1.5, 2
Scale: Linear
```

**Example 2: Wide Range (0.1 to 100)**
```
Min Value: 0.1
Max Value: 100
Tick Values: 0.1, 1, 10, 100
Scale: Logarithmic
```

**Example 3: Tight Range (0.8 to 1.3)**
```
Min Value: 0.7
Max Value: 1.4
Tick Values: 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4
Scale: Linear
```

**Example 4: Custom Emphasis**
```
Min Value: 0.5
Max Value: 10
Tick Values: 0.5, 1, 2, 3, 5, 10
Scale: Linear
(Emphasizes values 2, 3, 5)
```

---

## 💡 Pro Tips

### For Best Results:

1. **Start with Automatic Mode**
   - Let the app calculate the optimal range
   - See what looks good automatically
   - Then switch to Manual if you need adjustments

2. **Logarithmic Scale for Wide Ranges**
   - If your data spans more than 10× (e.g., 0.1 to 5)
   - Use logarithmic scale
   - Tick marks: 0.1, 0.5, 1, 2, 5, 10

3. **Consistent Axes Across Multiple Plots**
   - Use Manual mode
   - Set the same Min/Max for all plots
   - Save your project settings

4. **Section Organization**
   - Group by outcome type (mortality, morbidity, lab values)
   - Use consistent section names across projects
   - Adjust section spacing for visual clarity (default: 30 pixels)

5. **Color Strategy**
   - Use Auto mode for standard significant/non-significant display
   - Use custom colors to highlight specific variables
   - Keep it professional: stick to 2-3 colors per plot

---

## 🔄 Workflow Recommendations

### Standard Workflow:
1. Import data from Excel or enter manually
2. Add section names in Group/Section column
3. Preview with automatic axis mode
4. Adjust colors if needed
5. Fine-tune with manual axis controls (optional)
6. Export as SVG or high-res PNG

### Multi-Plot Workflow:
1. Create first plot with automatic mode
2. Note the axis range that looks good
3. Switch to manual mode
4. Use same Min/Max for all subsequent plots
5. Save project settings for consistency

### Publication Workflow:
1. Use Arial or Times New Roman font
2. Enable gridlines for easier reading
3. Use consistent section spacing across figures
4. Export as SVG for journal submission
5. Keep a copy of the project file for revisions

---

## 🆘 Troubleshooting

**Q: My sections aren't showing up**
A: Make sure the Group/Section field is not empty and contains text

**Q: The axis range seems too wide/narrow**
A: Switch to Manual mode and set custom Min/Max values

**Q: Custom tick values aren't appearing**
A: Make sure they're comma-separated and within your Min/Max range

**Q: Colors not changing**
A: Check if "Auto" is selected - change to a specific color if needed

**Q: Section spacing too small/large**
A: Adjust the "Section Spacing" slider (0-100 pixels) in settings

---

## 📞 Need Help?

If you encounter any issues or have questions about the new features, please refer to:
- **README.md** for complete documentation
- **CHANGELOG.md** for version history
- Contact support for technical assistance
