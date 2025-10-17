# Excel Import Guide - Forest Plot Generator

## What's New - Version 2.0 🎉

### Complete Excel Import Wizard
The Excel import feature has been completely redesigned with a 3-step wizard that gives you full control:

## 🔧 Step-by-Step Process

### Step 1: **Select Sheet**
- Upload your Excel file (.xlsx)
- See all sheets in your workbook
- Click on the sheet you want to import from
- Works with multiple sheets

### Step 2: **Define Cell Range**  
- Specify exact cell range (e.g., A1:E10)
- Enter Start Cell (e.g., "A1")
- Enter End Cell (e.g., "E10")
- Check/uncheck "First row contains headers"
- **Live Preview** shows your data as you adjust the range
- See exactly what data will be imported

### Step 3: **Map Columns**
- Map each column to the correct field:
  - **Required:** Variable Name, OR, Lower CI, Upper CI
  - **Optional:** P-Value, Sample Size, Group
- Dropdown shows ALL columns from your selected range
- No more "only one option" bug!

## ✨ Key Features

### Multi-Sheet Support
- Import from any sheet in your workbook
- Each sheet listed clearly
- Easy navigation between sheets

### Precise Cell Selection
- Define exact ranges (A1:E10, B5:F20, etc.)
- No guessing which data to import
- Full control over what gets imported

### Live Preview
- See your data before importing
- Verify the range is correct
- Check headers are detected properly

### Smart Column Detection
- All columns in your range appear in dropdowns
- Map any column to any field
- Handles any Excel structure

## 📊 Example Usage

### Single Forest Plot from Excel

**Your Excel file has:**
- Sheet: "Study Results"
- Data in cells A1:E15
- Headers in row 1

**Steps:**
1. Click "Excel Upload"
2. Select "Study Results" sheet
3. Enter range: Start "A1", End "E15"
4. Check "First row contains headers"
5. Preview shows your data ✓
6. Map columns:
   - Variable Name → "Study"
   - OR → "Odds Ratio"
   - Lower CI → "Lower_CI"
   - Upper CI → "Upper_CI"
7. Click "Import Data"

### Multiple Forest Plots (Coming Soon)
Future updates will allow:
- Importing multiple ranges from same file
- Creating multiple forest plots
- Switching between datasets

## 🐛 Bug Fixes

### Fixed Issues:
✅ XLSX library now loads from node_modules (not CDN)  
✅ Dropdown shows ALL columns (not just one)  
✅ Excel.read function works properly  
✅ Column mapping is intuitive and clear  
✅ Multi-sheet support works perfectly  
✅ Cell range selection is precise  

## 💡 Tips

1. **Headers:** Always use the "First row contains headers" checkbox if your data has headers
2. **Range:** Be precise with your range to avoid importing empty rows
3. **Preview:** Use the preview to verify your range before mapping
4. **Mapping:** Required fields MUST be mapped before you can import

## 🚀 Getting Started

1. **Close the app** if running
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the app:**
   ```bash
   npm start
   ```
4. **Upload Excel file** and follow the 3-step wizard!

## 📝 Excel File Format

Your Excel file can have ANY format. The wizard will adapt to your structure:

**Example 1: Standard Format**
| Variable | OR | Lower CI | Upper CI | P-Value |
|----------|----|---------  |----------|---------|
| Age      | 1.5| 1.2      | 1.9      | 0.001   |
| Gender   | 2.1| 1.8      | 2.5      | 0.000   |

**Example 2: Custom Format**
| Study Name | Odds | LL | UL | Pval | N |
|------------|------|----|-------|------|---|
| Study A    | 1.3  | 1.1| 1.6   | 0.02 | 500 |

**Example 3: Partial Range**
You can select ANY range from your sheet:
- Data in B5:F20 → Use Start: "B5", End: "F20"
- Data in A10:D25 → Use Start: "A10", End: "D25"

## 🎯 Next Steps

The foundation is now in place for:
- Multiple datasets per Excel file
- Saving/loading different imports
- Comparing multiple forest plots
- Advanced data management

---

**Version:** 2.0  
**Last Updated:** October 2025  
**Developer Mode:** DevTools opens automatically to see logs
