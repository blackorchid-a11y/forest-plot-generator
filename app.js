const { useState, useRef, useEffect } = React;

// Pure logic lives in lib/core.js so it can be unit tested under Node.
const {
  computePooledEffect, describeHeterogeneity, poolingModelLabel, isSignificant, isValidData, scaleValue,
  computeAutoAxis, generateSmartTicks, formatTickLabel,
  formatNumber, formatEstimate, formatPValue,
  parseNumericInput, toNumber,
  buildRowsFromRecords, buildRowsWithMapping, describeImportProblems, describeMapping,
  resolveColumns,
  normalizeSettings, validateProject, sortRowsByPosition, groupRowsIntoSections
} = ForestPlotCore;

// Every plot's settings start from these. Projects written by older versions
// are merged over them on load, so a setting added later is never missing at
// render time -- an absent xAxisTicks used to throw and take the plot down.
const DEFAULT_PLOT_SETTINGS = {
  scale: 'linear',
  font: 'Arial',
  fontSize: 14,
  groupTitleFontSize: 16,
  showGridlines: false,
  metaAnalysis: false,
  poolingModel: 'fixed', // 'fixed' or 'random' (DerSimonian-Laird)
  showPValues: false,
  alignVariablesLeft: false,
  title: 'Forest Plot', // Subtitle for this plot
  footnote: 'Error bars represent 95% confidence intervals',
  groupSpacing: 30,
  spacingBeforeGroupTitle: 20,
  spacingAfterGroupTitle: 5,
  xAxisMode: 'auto',
  xAxisMin: '',
  xAxisMax: '',
  xAxisTicks: ''
};

const DEFAULT_GLOBAL_SETTINGS = {
  mainTitle: 'Forest Plot',
  layout: 'vertical', // 'vertical' or 'horizontal'
  plotWidth: 800,
  plotHeight: 600
};

const PROJECT_FILE_VERSION = '2.0';

// The project as of the last successful render, kept outside React so the
// crash screen can still offer it after the editor has been torn down.
let lastGoodProject = null;

function downloadProjectFile(project, filename) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Comprehensive color palette
const COLOR_PALETTE = [
  { name: 'Auto', value: 'auto' },
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#4A4A4A' },
  { name: 'Medium Gray', value: '#808080' },
  { name: 'Light Gray', value: '#BDBDBD' },

  // Blues
  { name: 'Navy Blue', value: '#001F3F' },
  { name: 'Royal Blue', value: '#0047AB' },
  { name: 'Blue', value: '#2196F3' }, // Material Blue
  { name: 'Sky Blue', value: '#87CEEB' },
  { name: 'Teal', value: '#009688' },
  { name: 'Cyan', value: '#00BCD4' },

  // Greens
  { name: 'Dark Green', value: '#1B5E20' }, // Darker
  { name: 'Forest Green', value: '#2E7D32' },
  { name: 'Green', value: '#4CAF50' }, // Material Green
  { name: 'Lime Green', value: '#76FF03' }, // Brighter
  { name: 'Olive', value: '#827717' }, // True Olive
  { name: 'Mint', value: '#69F0AE' },
  { name: 'Emerald', value: '#00C853' },

  // Reds/Pinks
  { name: 'Maroon', value: '#500000' }, // Darker
  { name: 'Dark Red', value: '#B71C1C' },
  { name: 'Red', value: '#F44336' }, // Material Red
  { name: 'Crimson', value: '#D50000' },
  { name: 'Coral', value: '#FF8A80' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Magenta', value: '#D500F9' },

  // Oranges/Yellows
  { name: 'Dark Orange', value: '#E65100' }, // Burnt Orange
  { name: 'Orange', value: '#FF9800' },
  { name: 'Light Orange', value: '#FFCC80' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Yellow', value: '#FFEB3B' },
  { name: 'Amber', value: '#FFC107' },

  // Purples
  { name: 'Indigo', value: '#3F51B5' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Violet', value: '#673AB7' },
  { name: 'Lavender', value: '#E1BEE7' },

  // Browns
  { name: 'Brown', value: '#5D4037' }, // Darker
  { name: 'Chocolate', value: '#795548' },
  { name: 'Sienna', value: '#A1887F' },
  { name: 'Tan', value: '#D7CCC8' },

  // Others
  { name: 'Turquoise', value: '#00E5FF' },
  { name: 'Salmon', value: '#FF9E80' },
  { name: 'Silver', value: '#9E9E9E' }
];

// Excel Import Wizard Component (must be outside main component)
// SheetJS's `header: 1` means "give me arrays of arrays", NOT "row 1 is the
// header". Passing it when the sheet HAS headers is backwards: it names the
// columns 0,1,2... and imports the header row as data. Omitting the option is
// what makes SheetJS key each row by the header text.
// Spreadsheet parsing lives behind the preload bridge, so the renderer needs no
// Node access. Workbooks stay on the other side; we only hold a handle.
function sheetUsedRange(handle, sheetName) {
  return window.xlsxBridge.usedRange(handle, sheetName);
}

// Resolves to { rows, truncated }; the main process caps how much of a sheet it
// will walk, and says so rather than dropping rows silently.
function readSheetRows(handle, sheetName, cellRange, hasHeaders) {
  return window.xlsxBridge.readRows(handle, sheetName, cellRange.start, cellRange.end, hasHeaders);
}

function ExcelImportWizard({ excelData, onImport, onCancel }) {
  const [step, setStep] = useState(1);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [cellRange, setCellRange] = useState({ start: 'A1', end: 'E10' });
  const [hasHeaders, setHasHeaders] = useState(true);
  const [previewData, setPreviewData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    variable: '',
    or: '',
    lowerCI: '',
    upperCI: '',
    pValue: '',
    sampleSize: '',
    group: ''
  });

  // Every keystroke in the range fields asks for a new preview, and replies can
  // arrive out of order; only the newest request may update the preview.
  const previewRequest = useRef(0);

  useEffect(() => {
    if (excelData && selectedSheet) {
      generatePreview();
    }
  }, [selectedSheet, cellRange, hasHeaders]);

  const generatePreview = async () => {
    const request = ++previewRequest.current;
    try {
      const { rows } = await readSheetRows(excelData.handle, selectedSheet, cellRange, hasHeaders);
      if (request === previewRequest.current) setPreviewData(rows.slice(0, 5));
    } catch (error) {
      console.error('Preview error:', error);
      if (request === previewRequest.current) setPreviewData([]);
    }
  };

  const getColumns = () => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  // When the columns change (another sheet, range, or the headers box), the
  // old choices may name columns that no longer exist. Start again from the
  // ones recognised by name, which also spares mapping every field by hand.
  const columnsKey = JSON.stringify(getColumns());
  useEffect(() => {
    const columns = getColumns();
    const { mapping, matchedByName } = resolveColumns(columns);
    const next = {};
    Object.keys(columnMapping).forEach((field) => {
      next[field] = matchedByName[field] ? mapping[field] : '';
    });
    setColumnMapping(next);
  }, [columnsKey]);

  const chooseSheet = async (sheet) => {
    try {
      const range = await sheetUsedRange(excelData.handle, sheet);
      setSelectedSheet(sheet);
      setCellRange(range);
      setStep(2);
    } catch (error) {
      console.error('Sheet error:', error);
      alert(`Could not read sheet "${sheet}": ${error.message}`);
    }
  };

  const importData = async () => {
    try {
      const { rows, truncated } = await readSheetRows(excelData.handle, selectedSheet, cellRange, hasHeaders);

      if (rows.length === 0) {
        alert('There are no data rows in that range, so nothing was imported.');
        return;
      }

      // The wizard's own mapping wins; unreadable cells become null rather than
      // a plausible default, and are reported back to the user.
      const built = buildRowsWithMapping(rows, columnMapping);
      onImport(built.rows, selectedSheet, { ...built, truncated });
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data: ' + error.message);
    }
  };

  return React.createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  },
    React.createElement('div', {
      className: 'bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'
    },
      // Header
      React.createElement('div', { className: 'mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold' }, 'Import from Excel'),
        React.createElement('div', { className: 'flex gap-2 mt-4' },
          [1, 2, 3].map(s =>
            React.createElement('div', {
              key: s,
              className: `flex-1 h-2 rounded ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`
            })
          )
        ),
        React.createElement('div', { className: 'flex gap-4 mt-2 text-sm text-gray-600' },
          React.createElement('span', { className: step === 1 ? 'font-bold' : '' }, '1. Sheet'),
          React.createElement('span', { className: step === 2 ? 'font-bold' : '' }, '2. Range'),
          React.createElement('span', { className: step === 3 ? 'font-bold' : '' }, '3. Columns')
        )
      ),

      // Step 1: Sheet Selection
      step === 1 && React.createElement('div', null,
        React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 'Select Sheet'),
        React.createElement('div', { className: 'space-y-2' },
          excelData?.sheets.map(sheet =>
            React.createElement('button', {
              key: sheet,
              onClick: () => chooseSheet(sheet),
              className: 'w-full p-4 border rounded hover:bg-blue-50 text-left font-medium'
            }, sheet)
          )
        )
      ),

      // Step 2: Range Selection
      step === 2 && React.createElement('div', null,
        React.createElement('h3', { className: 'text-lg font-semibold mb-4' },
          `Sheet: ${selectedSheet} - Select Data Range`
        ),
        React.createElement('div', { className: 'grid grid-cols-2 gap-4 mb-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-semibold mb-2' }, 'Start Cell (e.g., A1)'),
            React.createElement('input', {
              type: 'text',
              value: cellRange.start,
              onChange: (e) => setCellRange({ ...cellRange, start: e.target.value.toUpperCase() }),
              className: 'w-full px-3 py-2 border rounded',
              placeholder: 'A1'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-semibold mb-2' }, 'End Cell (e.g., E10)'),
            React.createElement('input', {
              type: 'text',
              value: cellRange.end,
              onChange: (e) => setCellRange({ ...cellRange, end: e.target.value.toUpperCase() }),
              className: 'w-full px-3 py-2 border rounded',
              placeholder: 'E10'
            })
          )
        ),
        React.createElement('label', { className: 'flex items-center gap-2 mb-4' },
          React.createElement('input', {
            type: 'checkbox',
            checked: hasHeaders,
            onChange: (e) => setHasHeaders(e.target.checked)
          }),
          React.createElement('span', null, 'First row contains column headers')
        ),
        React.createElement('div', { className: 'mb-4' },
          React.createElement('h4', { className: 'font-semibold mb-2' }, 'Preview'),
          React.createElement('div', { className: 'overflow-x-auto border rounded' },
            React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
              previewData.length > 0 && React.createElement('thead', { className: 'bg-gray-50' },
                React.createElement('tr', null,
                  getColumns().map(col =>
                    React.createElement('th', {
                      key: col,
                      className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase'
                    }, col)
                  )
                )
              ),
              React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
                previewData.map((row, idx) =>
                  React.createElement('tr', { key: idx },
                    getColumns().map(col =>
                      React.createElement('td', {
                        key: col,
                        className: 'px-4 py-2 text-sm'
                      }, String(row[col]))
                    )
                  )
                )
              )
            )
          )
        ),
        React.createElement('div', { className: 'flex gap-4' },
          React.createElement('button', {
            onClick: () => setStep(1),
            className: 'px-6 py-2 rounded font-semibold bg-gray-200 hover:bg-gray-300'
          }, 'Back'),
          React.createElement('button', {
            onClick: () => setStep(3),
            disabled: previewData.length === 0,
            className: `px-6 py-2 rounded font-semibold ${previewData.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`
          }, 'Next')
        )
      ),

      // Step 3: Column Mapping
      step === 3 && React.createElement('div', null,
        React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 'Map Columns to Fields'),
        React.createElement('div', { className: 'space-y-4 mb-6' },
          Object.entries({
            variable: '* Variable Name',
            or: '* Odds Ratio (OR)',
            lowerCI: '* Lower CI',
            upperCI: '* Upper CI',
            pValue: 'P-Value (Optional)',
            sampleSize: 'Sample Size (Optional)',
            group: 'Group/Section (Optional)'
          }).map(([field, label]) =>
            React.createElement('div', { key: field },
              React.createElement('label', { className: 'block font-semibold mb-2' }, label),
              React.createElement('select', {
                value: columnMapping[field],
                onChange: (e) => setColumnMapping({ ...columnMapping, [field]: e.target.value }),
                className: 'w-full px-3 py-2 border rounded'
              },
                React.createElement('option', { value: '' }, '-- Select Column --'),
                getColumns().map(col =>
                  React.createElement('option', { key: col, value: col }, col)
                )
              )
            )
          )
        ),
        React.createElement('div', { className: 'flex gap-4' },
          React.createElement('button', {
            onClick: () => setStep(2),
            className: 'px-6 py-2 rounded font-semibold bg-gray-200 hover:bg-gray-300'
          }, 'Back'),
          React.createElement('button', {
            onClick: importData,
            disabled: !columnMapping.variable || !columnMapping.or || !columnMapping.lowerCI || !columnMapping.upperCI,
            className: `px-6 py-2 rounded font-semibold ${!columnMapping.variable || !columnMapping.or || !columnMapping.lowerCI || !columnMapping.upperCI ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`
          }, 'Import Data')
        )
      ),

      // Cancel button
      React.createElement('button', {
        onClick: onCancel,
        className: 'mt-4 w-full px-6 py-2 rounded font-semibold bg-gray-200 hover:bg-gray-300'
      }, 'Cancel')
    )
  );
}

function ForestPlotGenerator() {
  const [inputMode, setInputMode] = useState('manual');

  // Global settings for the entire project
  const [globalSettings, setGlobalSettings] = useState({ ...DEFAULT_GLOBAL_SETTINGS });

  // Array of plots, each with its own data and settings
  const [plots, setPlots] = useState([
    {
      id: 1,
      title: 'Plot 1',
      data: [
        { id: 1, variable: 'Variable 1', or: 1.5, lowerCI: 1.2, upperCI: 1.9, pValue: 0.001, sampleSize: '', group: '', color: 'auto', position: 1 }
      ],
      settings: { ...DEFAULT_PLOT_SETTINGS }
    }
  ]);

  const [activePlotId, setActivePlotId] = useState(1);
  const [excelData, setExcelData] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [positionDrafts, setPositionDrafts] = useState({});

  // A field being cleared for retyping holds '', so every geometry consumer
  // reads these instead of the raw setting: NaN anywhere in the SVG blanks the
  // entire plot.
  const plotWidthPx = toNumber(globalSettings.plotWidth, 800, 1);
  const plotHeightPx = toNumber(globalSettings.plotHeight, 600, 1);

  // Helper to get active plot
  const activePlot = plots.find(p => p.id === activePlotId) || plots[0];
  // plots should never be empty (loadProject validates before committing), but
  // rendering against an undefined plot would take the whole window down, so
  // fall back instead of throwing.
  const data = activePlot ? activePlot.data : [];
  const settings = activePlot ? activePlot.settings : {};

  // Helper to update active plot
  const updateActivePlot = (updates) => {
    setPlots(plots.map(p => p.id === activePlotId ? { ...p, ...updates } : p));
  };

  // Helper to update active plot settings
  const updateActiveSettings = (newSettings) => {
    updateActivePlot({ settings: { ...settings, ...newSettings } });
  };

  const svgRef = useRef(null);

  // Effects run only after a render has committed, so this always holds a
  // project that rendered. If the next change crashes the editor, the crash
  // screen can hand back the work as it was just before.
  useEffect(() => {
    lastGoodProject = { version: PROJECT_FILE_VERSION, plots, globalSettings };
  }, [plots, globalSettings]);

  const addPlot = () => {
    const newId = Math.max(...plots.map(p => p.id), 0) + 1;
    const newPlot = {
      id: newId,
      title: `Plot ${newId}`,
      data: [
        { id: 1, variable: 'Variable 1', or: 1.0, lowerCI: 0.8, upperCI: 1.2, pValue: 0.5, sampleSize: '', group: '', color: 'auto', position: 1 }
      ],
      settings: { ...DEFAULT_PLOT_SETTINGS, ...plots[0].settings, title: `Plot ${newId}` }
    };
    setPlots([...plots, newPlot]);
    setActivePlotId(newId);
  };

  const removePlot = (id) => {
    if (plots.length <= 1) {
      alert('You must have at least one plot.');
      return;
    }
    const newPlots = plots.filter(p => p.id !== id);
    setPlots(newPlots);
    if (activePlotId === id) {
      setActivePlotId(newPlots[0].id);
    }
  };

  const fonts = ['Arial', 'Times New Roman', 'Calibri', 'Comfortaa', 'Georgia', 'Verdana'];

  const addRow = () => {
    const newId = Math.max(...data.map(d => d.id), 0) + 1;
    const maxPosition = Math.max(...data.map(d => d.position || 0), 0);
    const newData = [...data, {
      id: newId,
      variable: `Variable ${newId}`,
      or: 1.0,
      lowerCI: 0.8,
      upperCI: 1.2,
      pValue: 0.5,
      sampleSize: '',
      group: '',
      color: 'auto',
      position: maxPosition + 1
    }];
    updateActivePlot({ data: newData });
  };

  const deleteRow = (id) => {
    const newData = data.filter(d => d.id !== id);
    updateActivePlot({ data: newData });
  };

  // Typing a position must not reorder the table mid-keystroke (typing "1" on
  // the way to "12" would jump the row), so the field is held as a draft and
  // committed when it loses focus.
  const commitPosition = (id) => {
    const draft = positionDrafts[id];
    const remaining = { ...positionDrafts };
    delete remaining[id];
    setPositionDrafts(remaining);
    if (draft === undefined) return;
    const parsed = parseNumericInput(draft);
    if (parsed === '') return;
    updateRow(id, 'position', parsed);
  };

  const updateRow = (id, field, value) => {
    const newData = data.map(d => d.id === id ? { ...d, [field]: value } : d);
    updateActivePlot({ data: newData });
  };

  const handleExcelImport = (parsed, sheetName, summary = {}) => {
    updateActivePlot({ data: parsed });
    if (excelData && window.xlsxBridge) window.xlsxBridge.close(excelData.handle);
    setShowExcelImport(false);
    setExcelData(null);
    const problems = describeImportProblems(summary);
    alert(
      `Imported ${parsed.length} rows from ${sheetName}.` +
      (summary.truncated
        ? '\n\nThe requested range was larger than the sheet, so only the part ' +
          'containing data was read.'
        : '') +
      (problems ? `\n\n${problems}` : '')
    );
  };

  const handleExcelCancel = () => {
    if (excelData && window.xlsxBridge) window.xlsxBridge.close(excelData.handle);
    setShowExcelImport(false);
    setExcelData(null);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (type === 'csv') {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const rawData = results.data;
              const headers = Object.keys(rawData[0] || {});

              // Columns are matched by name, falling back to the conventional
              // order only for headers that cannot be recognised. Mapping by
              // position alone silently swapped OR and lower CI in any file
              // that did not use the expected column order.
              const built = buildRowsFromRecords(rawData, headers);

              // An empty or header-only file must not wipe the current plot.
              if (built.rows.length === 0) {
                alert('No data rows were found in this CSV file, so nothing was imported.');
                return;
              }

              const malformedLineCount = new Set(
                (results.errors || []).map((error) => error.row)
              ).size;
              const problems = describeImportProblems({ ...built, malformedLineCount });

              updateActivePlot({ data: built.rows });
              setInputMode('manual');
              alert(
                `Imported ${built.rows.length} rows from CSV.\n\nColumns used:\n` +
                describeMapping(built.mapping, built.matchedByName) +
                (problems ? `\n\n${problems}` : '')
              );
            } catch (error) {
              console.error('CSV parsing error:', error);
              alert('Error parsing CSV file: ' + error.message);
            }
          },
          error: (error) => {
            console.error('CSV upload error:', error);
            alert('Error reading CSV file: ' + error.message);
          }
        });
      } else if (type === 'xlsx') {
        if (!window.xlsxBridge) {
          throw new Error('Spreadsheet support is unavailable. Please restart the app.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const { handle, sheets } = await window.xlsxBridge.open(arrayBuffer);

        setExcelData({ handle, sheets, filename: file.name });
        setShowExcelImport(true);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error uploading file: ' + error.message);
    }

    e.target.value = '';
  };

  // " p=0.03" (or " p<0.001") when p-values are shown and the row has one; a
  // row without a p-value used to end in a dangling "p=", and a tiny one read
  // "p=<0.001".
  const pValueSuffixFor = (showPValues) => (pValue) => {
    const text = formatPValue(pValue);
    if (!showPValues || !text) return '';
    return text.startsWith('<') ? ` p${text}` : ` p=${text}`;
  };

  const getBarColor = (row) => {
    if (row.color !== 'auto') return row.color;
    return isSignificant(row.lowerCI, row.upperCI) ? '#000000' : '#808080';
  };

  const downloadSVG = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'forest-plot.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Size the canvas from the rendered SVG itself. plotWidthPx /
    // plotHeight describe a single plot, so using them would crop multi-plot
    // layouts and drop the main title band.
    const width = Number(svgElement.getAttribute('width'));
    const height = Number(svgElement.getAttribute('height'));
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      alert('Cannot export PNG: the plot has invalid dimensions.\n\nCheck the plot width and height under Project Settings.');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const dpi = 800;
    const scaleFactor = dpi / 96;
    canvas.width = Math.round(width * scaleFactor);
    canvas.height = Math.round(height * scaleFactor);
    ctx.scale(scaleFactor, scaleFactor);

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('PNG export failed: the image could not be encoded. Try reducing the plot size.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'forest-plot.png';
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.onerror = () => {
      alert('PNG export failed: the plot could not be rasterized.');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const saveProject = () => {
    downloadProjectFile({ version: PROJECT_FILE_VERSION, plots, globalSettings }, 'forest-plot-project.json');
  };

  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target.result);
        // Validate everything BEFORE touching state. The old code committed
        // setPlots(project.plots) and only then read project.plots[0].id, so a
        // file with an empty plots array left the app rendering against no
        // plots at all: a permanent white window.
        const validated = validateProject(project);

        if (validated.kind === 'current') {
          // Fill in any setting the saving version did not know about, and
          // replace any of the wrong kind.
          setPlots(validated.plots.map((plot) => ({
            ...plot,
            settings: normalizeSettings(plot.settings, DEFAULT_PLOT_SETTINGS)
          })));
          if (validated.globalSettings) {
            setGlobalSettings(normalizeSettings(validated.globalSettings, DEFAULT_GLOBAL_SETTINGS));
          }
          setActivePlotId(validated.plots[0].id);
        } else {
          // Rows already carry positions (validateProject fills them in).
          const legacySettings = validated.settings;
          const newSettings = normalizeSettings(legacySettings, DEFAULT_PLOT_SETTINGS);

          const newGlobalSettings = normalizeSettings({
            mainTitle: legacySettings.title || 'Forest Plot',
            plotWidth: legacySettings.plotWidth || 800,
            plotHeight: legacySettings.plotHeight || 600
          }, DEFAULT_GLOBAL_SETTINGS);

          setPlots([{
            id: 1,
            title: 'Plot 1',
            data: validated.data,
            settings: newSettings
          }]);
          setGlobalSettings(newGlobalSettings);
          setActivePlotId(1);
        }
      } catch (error) {
        console.error('Load error:', error);
        alert('Error loading project file: ' + error.message);
      }
    };
    reader.readAsText(file);
    // Allow the same file to be picked again, e.g. after a rejected load.
    e.target.value = '';
  };

  // Format p-value to match user input exactly (no unnecessary trailing zeros)
  // Error cards render inside the outer <svg>, so they must be built from SVG
  // elements: HTML tags created in that subtree land in the SVG namespace and
  // paint nothing at all. Native <text> also keeps the message visible in PNG
  // and SVG exports, which a <foreignObject> would not.
  const renderPlotErrorCard = (title, lines, color) => {
    const stroke = color || '#dc2626';
    const fill = stroke === '#dc2626' ? '#fef2f2' : '#fff7ed';
    const w = plotWidthPx;
    const h = plotHeightPx;
    const boxHeight = 90 + lines.length * 24;

    return React.createElement('g', null,
      React.createElement('rect', { x: 0, y: 0, width: w, height: h, fill: 'white' }),
      React.createElement('rect', {
        x: 20,
        y: Math.max((h - boxHeight) / 2, 10),
        width: Math.max(w - 40, 40),
        height: boxHeight,
        fill: fill,
        stroke: stroke,
        strokeWidth: 2,
        rx: 8
      }),
      React.createElement('text', {
        x: w / 2,
        y: Math.max((h - boxHeight) / 2, 10) + 40,
        textAnchor: 'middle',
        fill: stroke,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Arial'
      }, title),
      ...lines.map((line, i) => React.createElement('text', {
        key: 'err-line-' + i,
        x: w / 2,
        y: Math.max((h - boxHeight) / 2, 10) + 72 + i * 24,
        textAnchor: 'middle',
        fill: '#374151',
        fontSize: 14,
        fontFamily: 'Arial'
      }, line))
    );
  };

  const renderSinglePlot = (plotData, plotSettings, isSubPlot = false) => {
    // Same reasoning as the plot dimensions: any of these can be '' mid-edit.
    plotSettings = {
      ...plotSettings,
      fontSize: toNumber(plotSettings.fontSize, 14, 1),
      groupTitleFontSize: toNumber(plotSettings.groupTitleFontSize, 16, 1),
      groupSpacing: toNumber(plotSettings.groupSpacing, 30, 0),
      spacingBeforeGroupTitle: toNumber(plotSettings.spacingBeforeGroupTitle, 20, 0),
      // This one is allowed below zero: the input offers down to -20 for tight
      // layouts, and flooring it at 0 silently swapped -10 for the default 5.
      spacingAfterGroupTitle: toNumber(plotSettings.spacingAfterGroupTitle, 5, -20)
    };

    // CRASH FIX v2.2.3: Validate manual X-axis settings before rendering
    if (plotSettings.xAxisMode === 'manual') {
      const minVal = parseFloat(plotSettings.xAxisMin);
      const maxVal = parseFloat(plotSettings.xAxisMax);

      // Check if values are valid numbers
      if (plotSettings.xAxisMin !== '' && !Number.isFinite(minVal)) {
        return renderPlotErrorCard('Invalid X-Axis Configuration', [
          'Minimum value must be a finite number.',
          'Please check your X-Axis settings.'
        ]);
      }

      if (plotSettings.xAxisMax !== '' && !Number.isFinite(maxVal)) {
        return renderPlotErrorCard('Invalid X-Axis Configuration', [
          'Maximum value must be a finite number.',
          'Values such as 1e400 overflow to Infinity.'
        ]);
      }

      // Check if both values are provided
      if (plotSettings.xAxisMin !== '' && plotSettings.xAxisMax !== '') {
        // Check if min < max
        if (minVal >= maxVal) {
          return renderPlotErrorCard('Invalid X-Axis Range', [
            `Minimum value (${minVal}) must be less than maximum value (${maxVal}).`,
            'Please adjust your X-Axis settings.'
          ]);
        }

        // Check if values are positive
        if (minVal <= 0 || maxVal <= 0) {
          return renderPlotErrorCard('Invalid X-Axis Range', [
            'X-Axis values must be positive numbers greater than 0.',
            `Current range: ${minVal} to ${maxVal}`,
            'For log scale, all values must be > 0.'
          ]);
        }

        // Check for extremely small ranges that might cause issues
        const range = maxVal - minVal;
        if (range < 0.01) {
          return renderPlotErrorCard('X-Axis Range Too Small', [
            'The difference between min and max is too small.',
            `Current range: ${range.toFixed(6)}`,
            'Please use a larger range. Minimum recommended: 0.1'
          ]);
        }

        // For log scale, check if range is reasonable
        if (plotSettings.scale === 'log') {
          const logRange = Math.log10(maxVal) - Math.log10(minVal);
          if (logRange < 0.1) {
            return renderPlotErrorCard('Warning: Narrow Logarithmic Scale', [
              'The logarithmic scale range is very narrow.',
              `Current range: ${minVal} to ${maxVal}`,
              'Consider using a wider range or linear scale.'
            ], '#ea580c');
          }
        }
      }
    }

    // Wrap the entire rendering in a try-catch to prevent crashes
    try {
      // Adjust right margin based on whether p-values are shown
      const baseRightMargin = 150;
      const rightMarginWithPValues = 220; // Extra space for p-values
      const margin = {
        top: isSubPlot ? 40 : 80, // Reduce top margin for sub-plots
        right: plotSettings.showPValues ? rightMarginWithPValues : baseRightMargin,
        bottom: 80,
        left: 200
      };
      // Use global width/height if not overridden (though currently we use global for all)
      // But for individual plots in a multi-plot setup, we might want to adjust
      const plotWidth = plotWidthPx - margin.left - margin.right;
      const plotHeight = plotHeightPx - margin.top - margin.bottom;
      // Axis labels and the footnote sit a little below the body text; a font
      // size of 1 or 2 would otherwise give them a zero or negative size.
      const smallFontSize = Math.max(1, plotSettings.fontSize - 2);
      const pValueSuffix = pValueSuffixFor(plotSettings.showPValues);

      const validData = plotData.filter(d => isValidData(d));
      // The pooled estimate is needed up front: a random-effects interval can
      // be wider than every study's, so the automatic axis must include it, and
      // its heterogeneity line takes a row slot of its own.
      const pooled = plotSettings.metaAnalysis
        ? computePooledEffect(validData, plotSettings.poolingModel === 'random' ? 'random' : 'fixed')
        : null;
      const heterogeneityText = describeHeterogeneity(pooled);

      const allValues = validData.flatMap(d => [d.lowerCI, d.or, d.upperCI]);
      if (pooled) allValues.push(pooled.lowerCI, pooled.upperCI);

      // Determine X-axis range
      let minVal, maxVal;
      if (plotSettings.xAxisMode === 'manual' && plotSettings.xAxisMin !== '' && plotSettings.xAxisMax !== '') {
        minVal = parseFloat(plotSettings.xAxisMin);
        maxVal = parseFloat(plotSettings.xAxisMax);
      } else {
        // Auto mode: the whole data range, always including the line of no effect.
        ({ min: minVal, max: maxVal } = computeAutoAxis(allValues, plotSettings.scale));
      }

      // Every drawn x goes through this first: an estimate or a limit outside the
      // axis must be pinned to the edge, never scaled past it and painted over
      // the label columns.
      const clampToAxis = (val) => Math.min(Math.max(val, minVal), maxVal);

      const xScale = (val) => {
        const scaled = scaleValue(val, plotSettings.scale);
        const minScaled = scaleValue(minVal, plotSettings.scale);
        const maxScaled = scaleValue(maxVal, plotSettings.scale);
        return margin.left + (scaled - minScaled) / (maxScaled - minScaled) * plotWidth;
      };

      // Generate tick marks
      let tickValues;
      if (plotSettings.xAxisMode === 'manual' && plotSettings.xAxisTicks) {
        tickValues = String(plotSettings.xAxisTicks).split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v) && v >= minVal && v <= maxVal);
      } else {
        tickValues = generateSmartTicks(minVal, maxVal, plotSettings.scale);
      }

      // Sections and the rows inside them are both ordered by the Position
      // column, so a section moves as a unit when its positions change.
      const sections = groupRowsIntoSections(plotData);
      const groupNames = sections.map(section => section.name);

      // Calculate total data rows (excluding section headers)
      let totalDataRows = plotData.length;
      if (plotSettings.metaAnalysis) totalDataRows += 1;
      if (heterogeneityText) totalDataRows += 1;

      // Calculate total height used by headers and spacing
      let totalHeaderHeight = 0;
      groupNames.forEach(groupName => {
        if (groupName && groupName !== 'Ungrouped' && groupName.trim() !== '') {
          // Height of the text itself (approximate based on font size) + user spacing
          totalHeaderHeight += (plotSettings.groupTitleFontSize * 1.5) + plotSettings.spacingBeforeGroupTitle + plotSettings.spacingAfterGroupTitle;
        }
      });

      // Remaining height for data rows
      const availableHeightForRows = plotHeight - totalHeaderHeight;
      // Ensure we don't divide by zero or have negative height
      const baseRowHeight = totalDataRows > 0 ? Math.max(0, availableHeightForRows / totalDataRows) : 0;

      let currentY = margin.top;

      const elements = [];

      // Header labels
      elements.push(
        React.createElement('text', {
          key: 'header-title',
          x: margin.left + plotWidth / 2,
          y: 30,
          textAnchor: 'middle',
          fontSize: plotSettings.fontSize + 4,
          fontWeight: 'bold'
        }, plotSettings.title)
      );

      elements.push(
        React.createElement('text', {
          key: 'header-var',
          x: plotSettings.alignVariablesLeft ? 10 : margin.left - 10,
          y: margin.top - 20,
          textAnchor: plotSettings.alignVariablesLeft ? 'start' : 'end',
          fontWeight: 'bold'
        }, 'Variable')
      );

      elements.push(
        React.createElement('text', {
          key: 'header-or',
          x: plotWidthPx - margin.right + 10,
          y: margin.top - 20,
          textAnchor: 'start',
          fontWeight: 'bold'
        }, 'OR (95% CI)')
      );

      // Vertical line at OR=1 (only if 1 is on the axis; a log axis often starts
      // exactly at 1, which a strict comparison used to leave without the line)
      if (minVal <= 1 && maxVal >= 1) {
        elements.push(
          React.createElement('line', {
            key: 'vertical-line',
            x1: xScale(1),
            y1: margin.top,
            x2: xScale(1),
            y2: plotHeightPx - margin.bottom,
            stroke: '#000',
            strokeWidth: '1.5'
          })
        );
      }

      // Gridlines
      if (plotSettings.showGridlines) {
        tickValues.forEach((val, idx) => {
          if (val !== 1.0) { // Don't duplicate the main vertical line
            elements.push(
              React.createElement('line', {
                key: `grid-${idx}`,
                x1: xScale(val),
                y1: margin.top,
                x2: xScale(val),
                y2: plotHeightPx - margin.bottom,
                stroke: '#ddd',
                strokeWidth: '1',
                strokeDasharray: '3,3'
              })
            );
          }
        });
      }

      // Render each group/section
      sections.forEach((section, groupIdx) => {
        const groupName = section.name;
        const groupRows = section.rows;

        // Section header
        if (groupName && groupName !== 'Ungrouped' && groupName.trim() !== '') {
          // Add space before the group title
          currentY += plotSettings.spacingBeforeGroupTitle;

          elements.push(
            React.createElement('text', {
              key: `section-${groupIdx}`,
              x: plotSettings.alignVariablesLeft ? 10 : margin.left - 10,
              y: currentY + plotSettings.groupTitleFontSize, // Align baseline roughly
              textAnchor: plotSettings.alignVariablesLeft ? 'start' : 'end',
              fontWeight: 'bold',
              fontSize: plotSettings.groupTitleFontSize,
              fill: '#000000'
            }, groupName)
          );

          // Advance by title height
          currentY += (plotSettings.groupTitleFontSize * 1.5);

          // Add space after the group title (before its variables)
          currentY += plotSettings.spacingAfterGroupTitle;
        }

        // Render rows in this group
        groupRows.forEach((row) => {
          const y = currentY + baseRowHeight / 2;
          const isValid = isValidData(row);

          if (!isValid) {
            elements.push(
              React.createElement('g', { key: `row-${row.id}` },
                React.createElement('text', {
                  x: plotSettings.alignVariablesLeft ? 10 : margin.left - 10,
                  y: y + 5,
                  textAnchor: plotSettings.alignVariablesLeft ? 'start' : 'end'
                }, row.variable),

                React.createElement('text', {
                  x: plotWidthPx - margin.right + 10,
                  y: y + 5,
                  textAnchor: 'start',
                  fill: '#FF0000',
                  fontStyle: 'italic'
                }, 'Invalid OR/CI')
              )
            );
          } else {
            // An interval running past the axis is clamped for drawing, but it
            // must not then look like a bound that genuinely ends there: the
            // clamped end gets an arrowhead instead of a cap.
            const lowerClamped = row.lowerCI < minVal;
            const upperClamped = row.upperCI > maxVal;
            // Both ends clamp into the axis, not just against their own limit:
            // an interval lying entirely off-scale otherwise produced x1 > x2
            // and drew the bar backwards, outside the plot.
            const x1 = xScale(clampToAxis(row.lowerCI));
            const x2 = xScale(clampToAxis(row.upperCI));
            const xCenter = xScale(clampToAxis(row.or));
            const orOnScale = row.or >= minVal && row.or <= maxVal;
            const color = getBarColor(row);
            const capOrArrow = (x, clamped, pointsLeft, key) => clamped
              ? React.createElement('path', {
                  key: key,
                  d: pointsLeft
                    ? `M ${x} ${y} L ${x + 8} ${y - 5} L ${x + 8} ${y + 5} Z`
                    : `M ${x} ${y} L ${x - 8} ${y - 5} L ${x - 8} ${y + 5} Z`,
                  fill: color
                })
              : React.createElement('line', {
                  key: key,
                  x1: x,
                  y1: y - 5,
                  x2: x,
                  y2: y + 5,
                  stroke: color,
                  strokeWidth: '2'
                });

            elements.push(
              React.createElement('g', { key: `row-${row.id}` },
                React.createElement('text', {
                  x: plotSettings.alignVariablesLeft ? 10 : margin.left - 10,
                  y: y + 5,
                  textAnchor: plotSettings.alignVariablesLeft ? 'start' : 'end'
                }, row.variable),

                React.createElement('line', {
                  x1: x1,
                  y1: y,
                  x2: x2,
                  y2: y,
                  stroke: color,
                  strokeWidth: '2'
                }),

                capOrArrow(x1, lowerClamped, true, 'cap-lower'),

                capOrArrow(x2, upperClamped, false, 'cap-upper'),

                // An off-scale estimate would otherwise paint its marker on top
                // of the OR text column; the arrowhead already says "off scale"
                // and the numeric label still carries the true value.
                orOnScale ? React.createElement('rect', {
                  key: 'marker',
                  x: xCenter - 4,
                  y: y - 4,
                  width: 8,
                  height: 8,
                  fill: color
                }) : null,

                React.createElement('text', {
                  x: plotWidthPx - margin.right + 10,
                  y: y + 5,
                  textAnchor: 'start'
                }, `${formatNumber(row.or)} (${formatNumber(row.lowerCI)}-${formatNumber(row.upperCI)})` +
                  pValueSuffix(row.pValue)
                )
              )
            );
          }

          currentY += baseRowHeight;
        });
      });

      // Meta-analysis pooled effect
      if (plotSettings.metaAnalysis) {
        if (pooled) {
          const pooledOR = pooled.or;
          const pooledLower = pooled.lowerCI;
          const pooledUpper = pooled.upperCI;
          const y = currentY + baseRowHeight / 2;
          // Same clamping as the study rows: without it a manual axis narrower
          // than the pooled estimate drew the diamond over the label column.
          const xCenter = xScale(clampToAxis(pooledOR));
          const pooledLowerClamped = pooledLower < minVal;
          const pooledUpperClamped = pooledUpper > maxVal;
          // A very precise pooled estimate can be under a pixel wide, so keep a
          // minimum half-width to leave the marker visible.
          const minHalfWidth = 4;
          const xLeft = Math.min(xScale(clampToAxis(pooledLower)), xCenter - minHalfWidth);
          const xRight = Math.max(xScale(clampToAxis(pooledUpper)), xCenter + minHalfWidth);

          elements.push(
            React.createElement('g', { key: 'pooled-effect' },
              React.createElement('text', {
                x: plotSettings.alignVariablesLeft ? 10 : margin.left - 10,
                y: y + 5,
                textAnchor: plotSettings.alignVariablesLeft ? 'start' : 'end',
                fontWeight: 'bold'
              }, poolingModelLabel(pooled.model)),

              React.createElement('path', {
                key: 'pooled-diamond',
                d: `M ${xLeft} ${y} L ${xCenter} ${y - 8} L ${xRight} ${y} L ${xCenter} ${y + 8} Z`,
                fill: '#000'
              }),

              // A pooled interval running past the axis gets the same arrowheads
              // the study rows use, so it is not mistaken for a real bound.
              pooledLowerClamped ? React.createElement('path', {
                key: 'pooled-arrow-lower',
                d: `M ${xLeft} ${y} L ${xLeft + 8} ${y - 5} L ${xLeft + 8} ${y + 5} Z`,
                fill: '#000'
              }) : null,

              pooledUpperClamped ? React.createElement('path', {
                key: 'pooled-arrow-upper',
                d: `M ${xRight} ${y} L ${xRight - 8} ${y - 5} L ${xRight - 8} ${y + 5} Z`,
                fill: '#000'
              }) : null,

              React.createElement('text', {
                x: plotWidthPx - margin.right + 10,
                y: y + 5,
                textAnchor: 'start',
                fontWeight: 'bold'
              }, `${formatEstimate(pooledOR)} (${formatEstimate(pooledLower)}-${formatEstimate(pooledUpper)})` +
                pValueSuffix(pooled.pValue)
              ),

              // Starts at the left edge and runs under the empty plot area: it is
              // too long for the label column.
              heterogeneityText ? React.createElement('text', {
                key: 'heterogeneity',
                x: 10,
                y: y + baseRowHeight + 5,
                textAnchor: 'start',
                fontSize: smallFontSize,
                fontStyle: 'italic'
              }, heterogeneityText) : null
            )
          );
        }
      }

      // X-axis labels
      tickValues.forEach((val, idx) => {
        elements.push(
          React.createElement('text', {
            key: `xaxis-${idx}`,
            x: xScale(val),
            y: plotHeightPx - margin.bottom + 20,
            textAnchor: 'middle',
            fontSize: smallFontSize
          }, formatTickLabel(val))
        );
      });

      // Footnote
      elements.push(
        React.createElement('text', {
          key: 'footnote',
          x: margin.left + plotWidth / 2,
          y: plotHeightPx - 20,
          textAnchor: 'middle',
          fontSize: smallFontSize,
          fontStyle: 'italic'
        }, plotSettings.footnote)
      );

      return React.createElement('svg', {
        width: plotWidthPx,
        height: plotHeightPx,
        style: { fontFamily: plotSettings.font, fontSize: plotSettings.fontSize }
      },
        React.createElement('rect', {
          key: 'background',
          width: plotWidthPx,
          height: plotHeightPx,
          fill: 'white'
        }),
        ...elements
      );
    } catch (error) {
      console.error('Error rendering forest plot:', error);
      return renderPlotErrorCard('Error Rendering Forest Plot', [
        'An error occurred while generating the plot:',
        error.message,
        'Common causes: invalid X-axis range, very small or very large',
        'numbers, negative values on a log scale, or invalid data in a row.'
      ]);
    }
  };

  const renderAllPlots = () => {
    const isHorizontal = globalSettings.layout === 'horizontal';
    const totalWidth = isHorizontal ? plotWidthPx * plots.length : plotWidthPx;
    const totalHeight = isHorizontal ? plotHeightPx : plotHeightPx * plots.length;

    // Main Title Height (if we want a main title above all plots)
    const mainTitleHeight = 50;
    const finalHeight = totalHeight + mainTitleHeight;

    return React.createElement('svg', {
      ref: svgRef,
      width: totalWidth,
      height: finalHeight,
      viewBox: `0 0 ${totalWidth} ${finalHeight}`,
      style: { backgroundColor: 'white' }
    },
      // Main Title
      React.createElement('text', {
        x: totalWidth / 2,
        y: 35,
        textAnchor: 'middle',
        fontSize: '24',
        fontWeight: 'bold',
        fontFamily: 'Arial'
      }, globalSettings.mainTitle),

      // Render each plot
      plots.map((plot, index) => {
        const xOffset = isHorizontal ? index * plotWidthPx : 0;
        const yOffset = (isHorizontal ? 0 : index * plotHeightPx) + mainTitleHeight;

        return React.createElement('g', {
          key: plot.id,
          transform: `translate(${xOffset}, ${yOffset})`
        },
          renderSinglePlot(plot.data, { ...plot.settings, title: plot.title }, true)
        );
      })
    );
  };

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-4' },
    // Excel Import Wizard
    showExcelImport && excelData && React.createElement(ExcelImportWizard, {
      excelData: excelData,
      onImport: handleExcelImport,
      onCancel: handleExcelCancel
    }),

    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold mb-6 text-gray-800' }, 'Forest Plot Generator'),

        // Global Settings & Plot Management
        React.createElement('div', { className: 'mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200' },
          React.createElement('h2', { className: 'text-xl font-bold mb-4 text-gray-700' }, 'Project Settings & Plots'),

          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-4' },
            // Global Settings
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Main Title'),
              React.createElement('input', {
                type: 'text',
                value: globalSettings.mainTitle,
                onChange: (e) => setGlobalSettings({ ...globalSettings, mainTitle: e.target.value }),
                className: 'w-full px-3 py-2 border rounded'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Layout'),
              React.createElement('select', {
                value: globalSettings.layout,
                onChange: (e) => setGlobalSettings({ ...globalSettings, layout: e.target.value }),
                className: 'w-full px-3 py-2 border rounded'
              },
                React.createElement('option', { value: 'vertical' }, 'Vertical (Stacked)'),
                React.createElement('option', { value: 'horizontal' }, 'Horizontal (Side-by-Side)')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Plot Dimensions'),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('input', {
                  type: 'number',
                  value: globalSettings.plotWidth,
                  onChange: (e) => setGlobalSettings({ ...globalSettings, plotWidth: parseNumericInput(e.target.value) }),
                  className: 'w-full px-3 py-2 border rounded',
                  placeholder: 'Width'
                }),
                React.createElement('input', {
                  type: 'number',
                  value: globalSettings.plotHeight,
                  onChange: (e) => setGlobalSettings({ ...globalSettings, plotHeight: parseNumericInput(e.target.value) }),
                  className: 'w-full px-3 py-2 border rounded',
                  placeholder: 'Height'
                })
              )
            )
          ),

          // Plot Management Tabs
          React.createElement('div', { className: 'flex flex-wrap items-center gap-2 mt-4 border-t pt-4' },
            plots.map(plot =>
              React.createElement('button', {
                key: plot.id,
                onClick: () => setActivePlotId(plot.id),
                className: `px-4 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-2 ${activePlotId === plot.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50 font-bold'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
                  }`
              },
                plot.title || `Plot ${plot.id}`,
                plots.length > 1 && React.createElement('span', {
                  onClick: (e) => { e.stopPropagation(); removePlot(plot.id); },
                  className: 'ml-2 text-red-400 hover:text-red-600 cursor-pointer px-1 rounded hover:bg-red-100'
                }, '×')
              )
            ),
            React.createElement('button', {
              onClick: addPlot,
              className: 'px-3 py-1 ml-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-semibold'
            }, '+ Add Plot')
          )
        ),

        // Active Plot Configuration
        React.createElement('div', { className: 'border-t-4 border-blue-600 pt-6' },
          React.createElement('div', { className: 'flex justify-between items-center mb-6' },
            React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' },
              `Editing: ${activePlot.title}`
            ),
            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('input', {
                type: 'text',
                value: activePlot.title,
                onChange: (e) => updateActivePlot({ title: e.target.value }),
                className: 'px-3 py-1 border rounded text-sm',
                placeholder: 'Plot Subtitle'
              })
            )
          ),

          React.createElement('div', { className: 'flex gap-4 mb-6' },
            React.createElement('button', {
              onClick: () => setInputMode('manual'),
              className: `px-4 py-2 rounded ${inputMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`
            }, 'Manual Entry'),

            React.createElement('label', {
              className: 'px-4 py-2 rounded cursor-pointer bg-green-600 text-white hover:bg-green-700'
            },
              'CSV Upload',
              React.createElement('input', {
                type: 'file',
                accept: '.csv',
                className: 'hidden',
                onChange: (e) => handleFileUpload(e, 'csv')
              })
            ),

            React.createElement('label', {
              className: 'px-4 py-2 rounded cursor-pointer bg-green-600 text-white hover:bg-green-700'
            },
              'Excel Upload',
              React.createElement('input', {
                type: 'file',
                accept: '.xlsx',
                className: 'hidden',
                onChange: (e) => handleFileUpload(e, 'xlsx')
              })
            )
          ),

          inputMode === 'manual' && React.createElement('div', { className: 'mb-6' },
            React.createElement('div', { className: 'overflow-x-auto' },
              React.createElement('table', { className: 'w-full border-collapse' },
                React.createElement('thead', null,
                  React.createElement('tr', { className: 'bg-gray-100' },
                    React.createElement('th', { className: 'border p-2' }, 'Position'),
                    React.createElement('th', { className: 'border p-2' }, 'Variable'),
                    React.createElement('th', { className: 'border p-2' }, 'OR'),
                    React.createElement('th', { className: 'border p-2' }, 'Lower CI'),
                    React.createElement('th', { className: 'border p-2' }, 'Upper CI'),
                    React.createElement('th', { className: 'border p-2' }, 'P-Value'),
                    React.createElement('th', { className: 'border p-2' }, 'Sample Size'),
                    React.createElement('th', { className: 'border p-2' }, 'Group/Section'),
                    React.createElement('th', { className: 'border p-2' }, 'Color'),
                    React.createElement('th', { className: 'border p-2' }, '')
                  )
                ),
                React.createElement('tbody', null,
                  sortRowsByPosition(data).map(row =>
                    React.createElement('tr', { key: row.id },
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          value: positionDrafts[row.id] !== undefined
                            ? positionDrafts[row.id]
                            : (row.position !== undefined ? row.position : row.id),
                          onChange: (e) => setPositionDrafts({ ...positionDrafts, [row.id]: e.target.value }),
                          onBlur: () => commitPosition(row.id),
                          onKeyDown: (e) => { if (e.key === 'Enter') e.target.blur(); },
                          className: 'w-20 px-2 py-1 border rounded text-center',
                          min: '1'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'text',
                          value: row.variable,
                          onChange: (e) => updateRow(row.id, 'variable', e.target.value),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.01',
                          value: row.or,
                          onChange: (e) => updateRow(row.id, 'or', parseNumericInput(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.01',
                          value: row.lowerCI,
                          onChange: (e) => updateRow(row.id, 'lowerCI', parseNumericInput(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.01',
                          value: row.upperCI,
                          onChange: (e) => updateRow(row.id, 'upperCI', parseNumericInput(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.001',
                          value: row.pValue,
                          onChange: (e) => updateRow(row.id, 'pValue', parseNumericInput(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'text',
                          value: row.sampleSize,
                          onChange: (e) => updateRow(row.id, 'sampleSize', e.target.value),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'text',
                          value: row.group,
                          onChange: (e) => updateRow(row.id, 'group', e.target.value),
                          className: 'w-full px-2 py-1 border rounded',
                          placeholder: 'Section name'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('select', {
                          value: row.color,
                          onChange: (e) => updateRow(row.id, 'color', e.target.value),
                          className: 'w-full px-2 py-1 border rounded'
                        },
                          COLOR_PALETTE.map(color =>
                            React.createElement('option', {
                              key: color.value,
                              value: color.value,
                              style: { color: color.value === 'auto' ? 'inherit' : color.value, fontWeight: 'bold' }
                            }, color.value === 'auto' ? 'Auto' : `■ ${color.name}`)
                          )
                        )
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('button', {
                          onClick: () => deleteRow(row.id),
                          className: 'text-red-600 hover:text-red-800'
                        }, '🗑️')
                      )
                    )
                  )
                )
              )
            ),
            React.createElement('button', {
              onClick: addRow,
              className: 'mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2'
            }, '➕ Add Row')
          ),

          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Footnote'),
              React.createElement('input', {
                type: 'text',
                value: settings.footnote,
                onChange: (e) => updateActiveSettings({ footnote: e.target.value }),
                className: 'w-full px-3 py-2 border rounded'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Font'),
              React.createElement('select', {
                value: settings.font,
                onChange: (e) => updateActiveSettings({ font: e.target.value }),
                className: 'w-full px-3 py-2 border rounded'
              },
                fonts.map(font => React.createElement('option', { key: font, value: font }, font))
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Font Size'),
              React.createElement('input', {
                type: 'number',
                value: settings.fontSize,
                onChange: (e) => updateActiveSettings({ fontSize: parseNumericInput(e.target.value) }),
                className: 'w-full px-3 py-2 border rounded'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Section Title Font Size'),
              React.createElement('input', {
                type: 'number',
                value: settings.groupTitleFontSize,
                onChange: (e) => updateActiveSettings({ groupTitleFontSize: parseNumericInput(e.target.value) }),
                className: 'w-full px-3 py-2 border rounded',
                min: '8',
                max: '48'
              }),
              React.createElement('p', { className: 'text-xs text-gray-600 mt-1' }, 'Font size for group/section titles')
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Scale'),
              React.createElement('select', {
                value: settings.scale,
                onChange: (e) => updateActiveSettings({ scale: e.target.value }),
                className: 'w-full px-3 py-2 border rounded'
              },
                React.createElement('option', { value: 'linear' }, 'Linear'),
                React.createElement('option', { value: 'log' }, 'Logarithmic')
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Old Section Spacing (deprecated)'),
              React.createElement('input', {
                type: 'number',
                value: settings.groupSpacing,
                onChange: (e) => updateActiveSettings({ groupSpacing: parseNumericInput(e.target.value) }),
                className: 'w-full px-3 py-2 border rounded bg-gray-100',
                min: '0',
                max: '100',
                disabled: true
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Space Before Section Title'),
              React.createElement('input', {
                type: 'number',
                value: settings.spacingBeforeGroupTitle,
                onChange: (e) => updateActiveSettings({ spacingBeforeGroupTitle: parseNumericInput(e.target.value) }),
                className: 'w-full px-3 py-2 border rounded',
                min: '0',
                max: '100'
              }),
              React.createElement('p', { className: 'text-xs text-gray-600 mt-1' }, 'Space above the section title')
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Space After Section Title'),
              React.createElement('input', {
                type: 'number',
                value: settings.spacingAfterGroupTitle,
                onChange: (e) => updateActiveSettings({ spacingAfterGroupTitle: parseNumericInput(e.target.value) }),
                className: 'w-full px-3 py-2 border rounded',
                min: '-20',
                max: '100'
              }),
              React.createElement('p', { className: 'text-xs text-gray-600 mt-1' }, 'Space below the section title (before variables). Can be negative for very tight spacing.')
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'flex items-center gap-2' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: settings.showGridlines,
                  onChange: (e) => updateActiveSettings({ showGridlines: e.target.checked })
                }),
                React.createElement('span', { className: 'font-semibold' }, 'Show Gridlines')
              ),
              React.createElement('label', { className: 'flex items-center gap-2 mt-2' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: settings.metaAnalysis,
                  onChange: (e) => updateActiveSettings({ metaAnalysis: e.target.checked })
                }),
                React.createElement('span', { className: 'font-semibold' }, 'Meta-analysis Mode')
              ),
              settings.metaAnalysis && React.createElement('label', { className: 'flex items-center gap-2 mt-2 ml-6' },
                React.createElement('span', null, 'Model'),
                React.createElement('select', {
                  value: settings.poolingModel,
                  onChange: (e) => updateActiveSettings({ poolingModel: e.target.value }),
                  className: 'px-2 py-1 border rounded'
                },
                  React.createElement('option', { value: 'fixed' }, 'Fixed effect (inverse variance)'),
                  React.createElement('option', { value: 'random' }, 'Random effects (DerSimonian-Laird)')
                )
              ),
              React.createElement('label', { className: 'flex items-center gap-2 mt-2' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: settings.showPValues,
                  onChange: (e) => updateActiveSettings({ showPValues: e.target.checked })
                }),
                React.createElement('span', { className: 'font-semibold' }, 'Show P-Values')
              ),
              React.createElement('label', { className: 'flex items-center gap-2 mt-2' },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: settings.alignVariablesLeft,
                  onChange: (e) => updateActiveSettings({ alignVariablesLeft: e.target.checked })
                }),
                React.createElement('span', { className: 'font-semibold' }, 'Align Variables Left')
              )
            )
          ),

          // X-Axis Controls Section
          React.createElement('div', { className: 'border-t pt-4 mt-4 mb-6' },
            React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 'X-Axis Controls'),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Axis Mode'),
                React.createElement('select', {
                  value: settings.xAxisMode,
                  onChange: (e) => updateActiveSettings({ xAxisMode: e.target.value }),
                  className: 'w-full px-3 py-2 border rounded'
                },
                  React.createElement('option', { value: 'auto' }, 'Automatic (Smart)'),
                  React.createElement('option', { value: 'manual' }, 'Manual Control')
                )
              ),
              settings.xAxisMode === 'manual' && React.createElement('div', null,
                React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Min Value'),
                React.createElement('input', {
                  type: 'number',
                  step: '0.1',
                  value: settings.xAxisMin,
                  onChange: (e) => updateActiveSettings({ xAxisMin: e.target.value }),
                  className: 'w-full px-3 py-2 border rounded',
                  placeholder: 'e.g., 0.1'
                })
              ),
              settings.xAxisMode === 'manual' && React.createElement('div', null,
                React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Max Value'),
                React.createElement('input', {
                  type: 'number',
                  step: '0.1',
                  value: settings.xAxisMax,
                  onChange: (e) => updateActiveSettings({ xAxisMax: e.target.value }),
                  className: 'w-full px-3 py-2 border rounded',
                  placeholder: 'e.g., 10'
                })
              ),
              settings.xAxisMode === 'manual' && React.createElement('div', { className: 'md:col-span-2' },
                React.createElement('label', { className: 'block mb-2 font-semibold' },
                  'Tick Values (comma-separated, optional)'
                ),
                React.createElement('input', {
                  type: 'text',
                  value: settings.xAxisTicks,
                  onChange: (e) => updateActiveSettings({ xAxisTicks: e.target.value }),
                  className: 'w-full px-3 py-2 border rounded',
                  placeholder: 'e.g., 0.5, 1, 2, 5, 10'
                }),
                React.createElement('p', { className: 'text-sm text-gray-600 mt-1' },
                  'Leave empty for automatic tick generation based on min/max'
                )
              )
            )
          ),

          React.createElement('div', { className: 'flex flex-wrap gap-2 mb-6' },
            React.createElement('button', {
              onClick: downloadSVG,
              className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2'
            }, '⬇️ Download SVG'),

            React.createElement('button', {
              onClick: downloadPNG,
              className: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2'
            }, '⬇️ Download PNG (800 DPI)'),

            React.createElement('button', {
              onClick: saveProject,
              className: 'px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2'
            }, '⬇️ Save Project'),

            React.createElement('label', {
              className: 'px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2 cursor-pointer'
            },
              '⬆️ Load Project',
              React.createElement('input', {
                type: 'file',
                accept: '.json',
                className: 'hidden',
                onChange: loadProject
              })
            )
          )
        )
      ),

      React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-6' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Preview'),
        React.createElement('div', { className: 'overflow-auto' },
          renderAllPlots()
        )
      )
    )
  );
}

// A render error used to unmount the whole tree and leave a blank white window
// with no way back except restarting the app. This keeps the error on screen and
// offers a reset.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    // The editor is gone at this point, and with it any unsaved work -- except
    // the copy kept in lastGoodProject. Say so plainly and offer it first.
    return React.createElement('div', { className: 'min-h-screen bg-gray-50 p-8' },
      React.createElement('div', { className: 'max-w-2xl mx-auto bg-white border border-red-300 rounded-lg p-6' },
        React.createElement('h1', { className: 'text-2xl font-bold text-red-600 mb-3' },
          'Something went wrong'),
        React.createElement('p', { className: 'mb-3' },
          'The editor hit an error and had to stop. ' +
          (lastGoodProject
            ? 'Download a backup of your work as it was just before the error, ' +
              'then start over and load the backup with Load Project.'
            : 'Starting over will clear anything that has not been saved.')),
        React.createElement('p', { className: 'mb-4 text-sm font-mono bg-red-50 p-3 rounded break-words' },
          String(this.state.error && this.state.error.message)),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          lastGoodProject && React.createElement('button', {
            className: 'px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700',
            onClick: () => downloadProjectFile(lastGoodProject, 'forest-plot-backup.json')
          }, 'Download backup'),
          React.createElement('button', {
            className: 'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700',
            onClick: () => window.location.reload()
          }, 'Start a blank project')
        )
      )
    );
  }
}

ReactDOM.render(
  React.createElement(ErrorBoundary, null, React.createElement(ForestPlotGenerator)),
  document.getElementById('root')
);
