const { useState, useRef, useEffect } = React;
const { Download, Upload, Plus, Trash2 } = lucide;

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

  useEffect(() => {
    if (excelData && selectedSheet) {
      generatePreview();
    }
  }, [selectedSheet, cellRange, hasHeaders]);

  const generatePreview = () => {
    try {
      const worksheet = excelData.workbook.Sheets[selectedSheet];
      const range = XLSX.utils.decode_range(cellRange.start + ':' + cellRange.end);
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        range: range,
        header: hasHeaders ? 1 : undefined,
        defval: ''
      });
      setPreviewData(jsonData.slice(0, 5));
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewData([]);
    }
  };

  const getColumns = () => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  const importData = () => {
    try {
      const worksheet = excelData.workbook.Sheets[selectedSheet];
      const range = XLSX.utils.decode_range(cellRange.start + ':' + cellRange.end);
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        range: range,
        header: hasHeaders ? 1 : undefined,
        defval: ''
      });

      const parsed = jsonData.map((row, idx) => ({
        id: idx + 1,
        variable: row[columnMapping.variable] || `Variable ${idx + 1}`,
        or: parseFloat(row[columnMapping.or]) || 1.0,
        lowerCI: parseFloat(row[columnMapping.lowerCI]) || 0.8,
        upperCI: parseFloat(row[columnMapping.upperCI]) || 1.2,
        pValue: parseFloat(row[columnMapping.pValue]) || 0.05,
        sampleSize: row[columnMapping.sampleSize] || '',
        group: row[columnMapping.group] || '',
        color: 'auto',
        position: idx + 1
      }));

      onImport(parsed, selectedSheet);
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
              onClick: () => { setSelectedSheet(sheet); setStep(2); },
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
  const [globalSettings, setGlobalSettings] = useState({
    mainTitle: 'Forest Plot',
    layout: 'vertical', // 'vertical' or 'horizontal'
    plotWidth: 800,
    plotHeight: 600
  });

  // Array of plots, each with its own data and settings
  const [plots, setPlots] = useState([
    {
      id: 1,
      title: 'Plot 1',
      data: [
        { id: 1, variable: 'Variable 1', or: 1.5, lowerCI: 1.2, upperCI: 1.9, pValue: 0.001, sampleSize: '', group: '', color: 'auto', position: 1 }
      ],
      settings: {
        scale: 'linear',
        font: 'Arial',
        fontSize: 14,
        groupTitleFontSize: 16,
        showGridlines: false,
        metaAnalysis: false,
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
      }
    }
  ]);

  const [activePlotId, setActivePlotId] = useState(1);
  const [excelData, setExcelData] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);

  // Helper to get active plot
  const activePlot = plots.find(p => p.id === activePlotId) || plots[0];
  const data = activePlot.data;
  const settings = activePlot.settings;

  // Helper to update active plot
  const updateActivePlot = (updates) => {
    setPlots(plots.map(p => p.id === activePlotId ? { ...p, ...updates } : p));
  };

  // Helper to update active plot settings
  const updateActiveSettings = (newSettings) => {
    updateActivePlot({ settings: { ...settings, ...newSettings } });
  };

  const svgRef = useRef(null);

  const addPlot = () => {
    const newId = Math.max(...plots.map(p => p.id), 0) + 1;
    const newPlot = {
      id: newId,
      title: `Plot ${newId}`,
      data: [
        { id: 1, variable: 'Variable 1', or: 1.0, lowerCI: 0.8, upperCI: 1.2, pValue: 0.5, sampleSize: '', group: '', color: 'auto', position: 1 }
      ],
      settings: { ...plots[0].settings, title: `Plot ${newId}` }
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

  const updateRow = (id, field, value) => {
    const newData = data.map(d => d.id === id ? { ...d, [field]: value } : d);
    updateActivePlot({ data: newData });
  };

  const handleExcelImport = (parsed, sheetName) => {
    updateActivePlot({ data: parsed });
    setShowExcelImport(false);
    setExcelData(null);
    alert(`Successfully imported ${parsed.length} rows from ${sheetName}`);
  };

  const handleExcelCancel = () => {
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

              const parsed = rawData.map((row, idx) => ({
                id: idx + 1,
                variable: row[headers[0]] || `Variable ${idx + 1}`,
                or: parseFloat(row[headers[1]]) || 1.0,
                lowerCI: parseFloat(row[headers[2]]) || 0.8,
                upperCI: parseFloat(row[headers[3]]) || 1.2,
                pValue: parseFloat(row[headers[4]]) || 0.05,
                sampleSize: row[headers[5]] || '',
                group: row[headers[6]] || '',
                color: 'auto',
                position: idx + 1
              }));
              updateActivePlot({ data: parsed });
              setInputMode('manual');
              alert(`Successfully imported ${parsed.length} rows from CSV file`);
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
        console.log('Starting Excel file upload...');

        if (typeof XLSX === 'undefined' || typeof XLSX.read !== 'function') {
          throw new Error('XLSX library not loaded properly. Please refresh and try again.');
        }

        console.log('Reading Excel file...');
        const arrayBuffer = await file.arrayBuffer();
        console.log('File read, size:', arrayBuffer.byteLength);

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        console.log('Workbook loaded, sheets:', workbook.SheetNames);

        setExcelData({
          workbook: workbook,
          sheets: workbook.SheetNames,
          filename: file.name
        });
        setShowExcelImport(true);
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error uploading file: ' + error.message);
    }

    e.target.value = '';
  };

  const isSignificant = (lowerCI, upperCI) => {
    return !(lowerCI <= 1.0 && upperCI >= 1.0);
  };

  const isValidData = (row) => {
    const { or, lowerCI, upperCI } = row;
    if (isNaN(or) || isNaN(lowerCI) || isNaN(upperCI)) return false;
    if (or === null || lowerCI === null || upperCI === null) return false;
    if (or === undefined || lowerCI === undefined || upperCI === undefined) return false;
    if (or <= 0 || lowerCI <= 0 || upperCI <= 0) return false;
    if (lowerCI >= upperCI) return false;
    return true;
  };

  const getBarColor = (row) => {
    if (row.color !== 'auto') return row.color;
    return isSignificant(row.lowerCI, row.upperCI) ? '#000000' : '#808080';
  };

  const scaleValue = (value, scaleType) => {
    if (scaleType === 'log') {
      return Math.log(value);
    }
    return value;
  };

  const groupDataBySections = (currentData) => {
    const groups = {};

    currentData.forEach(row => {
      const groupName = row.group || 'Ungrouped';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(row);
    });

    // Sort rows within each group by position
    Object.keys(groups).forEach(groupName => {
      groups[groupName].sort((a, b) => {
        const posA = a.position !== undefined ? a.position : a.id;
        const posB = b.position !== undefined ? b.position : b.id;
        return posA - posB;
      });
    });

    return groups;
  };

  // Generate smart tick marks based on data range
  const generateSmartTicks = (minVal, maxVal, scale) => {
    if (scale === 'log') {
      // For log scale, use powers and half-powers
      const logMin = Math.log10(minVal);
      const logMax = Math.log10(maxVal);
      const ticks = [];

      // Generate major ticks at powers of 10
      let power = Math.floor(logMin);
      while (Math.pow(10, power) <= maxVal * 1.1) {
        const val = Math.pow(10, power);
        if (val >= minVal * 0.9) {
          ticks.push(val);
        }
        power++;
      }

      // Add intermediate ticks (0.5, 2, 5 pattern)
      const intermediate = [];
      for (let i = 0; i < ticks.length - 1; i++) {
        const start = ticks[i];
        const end = ticks[i + 1];
        if (start * 2 < end && start * 2 >= minVal * 0.9 && start * 2 <= maxVal * 1.1) {
          intermediate.push(start * 2);
        }
        if (start * 5 < end && start * 5 >= minVal * 0.9 && start * 5 <= maxVal * 1.1) {
          intermediate.push(start * 5);
        }
      }

      return [...ticks, ...intermediate].sort((a, b) => a - b).filter(v => v >= minVal * 0.9 && v <= maxVal * 1.1);
    } else {
      // For linear scale
      const range = maxVal - minVal;
      let step;

      // Determine nice step size
      const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
      const normalized = range / magnitude;

      if (normalized < 1.5) step = 0.2 * magnitude;
      else if (normalized < 3) step = 0.5 * magnitude;
      else if (normalized < 7) step = 1 * magnitude;
      else step = 2 * magnitude;

      const ticks = [];
      let tick = Math.ceil(minVal / step) * step;
      while (tick <= maxVal) {
        ticks.push(tick);
        tick += step;
      }

      // Always include 1.0 if it's in range
      if (minVal < 1.0 && maxVal > 1.0 && !ticks.includes(1.0)) {
        ticks.push(1.0);
        ticks.sort((a, b) => a - b);
      }

      return ticks;
    }
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
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const dpi = 800;
    const scaleFactor = dpi / 96;
    canvas.width = settings.plotWidth * scaleFactor;
    canvas.height = settings.plotHeight * scaleFactor;
    ctx.scale(scaleFactor, scaleFactor);

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'forest-plot.png';
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const saveProject = () => {
    const project = {
      version: '2.0',
      plots,
      globalSettings
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'forest-plot-project.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target.result);

        // Handle new version
        if (project.version === '2.0' && project.plots) {
          setPlots(project.plots);
          if (project.globalSettings) {
            setGlobalSettings(project.globalSettings);
          }
          setActivePlotId(project.plots[0].id);
        }
        // Handle legacy version
        else if (project.data) {
          // Add position field if missing (backward compatibility)
          const dataWithPositions = project.data.map((row, idx) => ({
            ...row,
            position: row.position !== undefined ? row.position : idx + 1
          }));

          // Migrate legacy settings
          const legacySettings = project.settings || {};
          const newSettings = { ...plots[0].settings, ...legacySettings };

          // Extract global settings from legacy settings
          const newGlobalSettings = {
            mainTitle: legacySettings.title || 'Forest Plot',
            layout: 'vertical',
            plotWidth: legacySettings.plotWidth || 800,
            plotHeight: legacySettings.plotHeight || 600
          };

          setPlots([{
            id: 1,
            title: 'Plot 1',
            data: dataWithPositions,
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
  };

  // Format p-value to match user input exactly (no unnecessary trailing zeros)
  const formatPValue = (pValue) => {
    if (pValue < 0.001) return '<0.001';
    // Convert to string and remove trailing zeros after decimal point
    const str = pValue.toString();
    // If it's already in the format we want, return it
    if (!str.includes('.')) return str;
    // Remove trailing zeros
    return str.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  };

  // Format OR/CI values to match user input exactly (no unnecessary trailing zeros)
  const formatNumber = (num) => {
    // Convert to string and remove trailing zeros after decimal point
    const str = num.toString();
    // If it's already in the format we want, return it
    if (!str.includes('.')) return str;
    // Remove trailing zeros
    return str.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  };

  const renderSinglePlot = (plotData, plotSettings, isSubPlot = false) => {
    // CRASH FIX v2.2.3: Validate manual X-axis settings before rendering
    if (plotSettings.xAxisMode === 'manual') {
      const minVal = parseFloat(plotSettings.xAxisMin);
      const maxVal = parseFloat(plotSettings.xAxisMax);

      // Check if values are valid numbers
      if (plotSettings.xAxisMin !== '' && isNaN(minVal)) {
        return React.createElement('div', { className: 'p-8 text-center text-red-600' },
          React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ Invalid X-Axis Configuration'),
          React.createElement('p', null, 'Minimum value must be a valid number.'),
          React.createElement('p', { className: 'mt-2 text-sm' }, 'Please check your X-Axis settings.')
        );
      }

      if (plotSettings.xAxisMax !== '' && isNaN(maxVal)) {
        return React.createElement('div', { className: 'p-8 text-center text-red-600' },
          React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ Invalid X-Axis Configuration'),
          React.createElement('p', null, 'Maximum value must be a valid number.'),
          React.createElement('p', { className: 'mt-2 text-sm' }, 'Please check your X-Axis settings.')
        );
      }

      // Check if both values are provided
      if (plotSettings.xAxisMin !== '' && plotSettings.xAxisMax !== '') {
        // Check if min < max
        if (minVal >= maxVal) {
          return React.createElement('div', { className: 'p-8 text-center text-red-600' },
            React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ Invalid X-Axis Range'),
            React.createElement('p', null, `Minimum value (${minVal}) must be less than maximum value (${maxVal}).`),
            React.createElement('p', { className: 'mt-2 text-sm' }, 'Please adjust your X-Axis settings.')
          );
        }

        // Check if values are positive
        if (minVal <= 0 || maxVal <= 0) {
          return React.createElement('div', { className: 'p-8 text-center text-red-600' },
            React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ Invalid X-Axis Range'),
            React.createElement('p', null, 'X-Axis values must be positive numbers greater than 0.'),
            React.createElement('p', { className: 'mt-2 text-sm' }, `Current range: ${minVal} to ${maxVal}`),
            React.createElement('p', { className: 'mt-2 text-sm' }, 'For log scale, all values must be > 0.')
          );
        }

        // Check for extremely small ranges that might cause issues
        const range = maxVal - minVal;
        if (range < 0.01) {
          return React.createElement('div', { className: 'p-8 text-center text-red-600' },
            React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ X-Axis Range Too Small'),
            React.createElement('p', null, 'The difference between min and max is too small.'),
            React.createElement('p', { className: 'mt-2 text-sm' }, `Current range: ${range.toFixed(6)}`),
            React.createElement('p', { className: 'mt-2 text-sm' }, 'Please use a larger range. Minimum recommended: 0.1')
          );
        }

        // For log scale, check if range is reasonable
        if (plotSettings.scale === 'log') {
          const logRange = Math.log10(maxVal) - Math.log10(minVal);
          if (logRange < 0.1) {
            return React.createElement('div', { className: 'p-8 text-center text-orange-600' },
              React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ Warning: Narrow Logarithmic Scale'),
              React.createElement('p', null, 'The logarithmic scale range is very narrow.'),
              React.createElement('p', { className: 'mt-2 text-sm' }, `Current range: ${minVal} to ${maxVal}`),
              React.createElement('p', { className: 'mt-2 text-sm' }, 'Consider using a wider range or linear scale.')
            );
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
      const plotWidth = globalSettings.plotWidth - margin.left - margin.right;
      const plotHeight = globalSettings.plotHeight - margin.top - margin.bottom;

      const validData = plotData.filter(d => isValidData(d));
      const allValues = validData.flatMap(d => [d.lowerCI, d.or, d.upperCI]);

      // Determine X-axis range
      let minVal, maxVal;
      if (plotSettings.xAxisMode === 'manual' && plotSettings.xAxisMin !== '' && plotSettings.xAxisMax !== '') {
        minVal = parseFloat(plotSettings.xAxisMin);
        maxVal = parseFloat(plotSettings.xAxisMax);
      } else {
        // Auto mode - better calculation
        if (allValues.length === 0) {
          minVal = 0.1;
          maxVal = 10;
        } else {
          const dataMin = Math.min(...allValues);
          const dataMax = Math.max(...allValues);
          const range = dataMax - dataMin;

          // Add 15% padding on each side for better visualization
          const padding = range * 0.15;
          minVal = Math.max(0.01, dataMin - padding);
          maxVal = dataMax + padding;

          // Round to nice numbers
          if (plotSettings.scale === 'log') {
            minVal = Math.pow(10, Math.floor(Math.log10(minVal)));
            maxVal = Math.pow(10, Math.ceil(Math.log10(maxVal)));
          } else {
            const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
            minVal = Math.floor(minVal / magnitude) * magnitude;
            maxVal = Math.ceil(maxVal / magnitude) * magnitude;
          }
        }
      }

      const xScale = (val) => {
        const scaled = scaleValue(val, plotSettings.scale);
        const minScaled = scaleValue(minVal, plotSettings.scale);
        const maxScaled = scaleValue(maxVal, plotSettings.scale);
        return margin.left + (scaled - minScaled) / (maxScaled - minScaled) * plotWidth;
      };

      // Generate tick marks
      let tickValues;
      if (plotSettings.xAxisMode === 'manual' && plotSettings.xAxisTicks !== '') {
        tickValues = plotSettings.xAxisTicks.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v) && v >= minVal && v <= maxVal);
      } else {
        tickValues = generateSmartTicks(minVal, maxVal, plotSettings.scale);
      }

      // Group data into sections
      const groupedData = groupDataBySections(plotData);
      const groupNames = Object.keys(groupedData);

      // Calculate total data rows (excluding section headers)
      let totalDataRows = plotData.length;
      if (plotSettings.metaAnalysis) totalDataRows += 1;

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
          x: globalSettings.plotWidth - margin.right + 10,
          y: margin.top - 20,
          textAnchor: 'start',
          fontWeight: 'bold'
        }, 'OR (95% CI)')
      );

      // Vertical line at OR=1 (only if 1 is in range)
      if (minVal < 1.0 && maxVal > 1.0) {
        elements.push(
          React.createElement('line', {
            key: 'vertical-line',
            x1: xScale(1),
            y1: margin.top,
            x2: xScale(1),
            y2: globalSettings.plotHeight - margin.bottom,
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
                y2: globalSettings.plotHeight - margin.bottom,
                stroke: '#ddd',
                strokeWidth: '1',
                strokeDasharray: '3,3'
              })
            );
          }
        });
      }

      // Render each group/section
      groupNames.forEach((groupName, groupIdx) => {
        const groupRows = groupedData[groupName];

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
        groupRows.forEach((row, rowIdx) => {
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
                  x: globalSettings.plotWidth - margin.right + 10,
                  y: y + 5,
                  textAnchor: 'start',
                  fill: '#FF0000',
                  fontStyle: 'italic'
                }, 'Invalid OR/CI')
              )
            );
          } else {
            const x1 = xScale(Math.max(row.lowerCI, minVal));
            const x2 = xScale(Math.min(row.upperCI, maxVal));
            const xCenter = xScale(row.or);
            const color = getBarColor(row);

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

                React.createElement('line', {
                  x1: x1,
                  y1: y - 5,
                  x2: x1,
                  y2: y + 5,
                  stroke: color,
                  strokeWidth: '2'
                }),

                React.createElement('line', {
                  x1: x2,
                  y1: y - 5,
                  x2: x2,
                  y2: y + 5,
                  stroke: color,
                  strokeWidth: '2'
                }),

                React.createElement('rect', {
                  x: xCenter - 4,
                  y: y - 4,
                  width: 8,
                  height: 8,
                  fill: color
                }),

                React.createElement('text', {
                  x: globalSettings.plotWidth - margin.right + 10,
                  y: y + 5,
                  textAnchor: 'start'
                }, plotSettings.showPValues ?
                  `${formatNumber(row.or)} (${formatNumber(row.lowerCI)}-${formatNumber(row.upperCI)}) p=${formatPValue(row.pValue)}` :
                  `${formatNumber(row.or)} (${formatNumber(row.lowerCI)}-${formatNumber(row.upperCI)})`
                )
              )
            );
          }

          currentY += baseRowHeight;
        });
      });

      // Meta-analysis pooled effect
      if (plotSettings.metaAnalysis) {
        const validDataForMeta = plotData.filter(d => isValidData(d));
        if (validDataForMeta.length > 0) {
          const pooledOR = validDataForMeta.reduce((sum, d) => sum + d.or, 0) / validDataForMeta.length;
          const pooledLower = validDataForMeta.reduce((sum, d) => sum + d.lowerCI, 0) / validDataForMeta.length;
          const pooledUpper = validDataForMeta.reduce((sum, d) => sum + d.upperCI, 0) / validDataForMeta.length;
          const y = currentY + baseRowHeight / 2;
          const xCenter = xScale(pooledOR);

          elements.push(
            React.createElement('g', { key: 'pooled-effect' },
              React.createElement('text', {
                x: plotSettings.alignVariablesLeft ? 10 : margin.left - 10,
                y: y + 5,
                textAnchor: plotSettings.alignVariablesLeft ? 'start' : 'end',
                fontWeight: 'bold'
              }, 'Pooled Effect'),

              React.createElement('path', {
                d: `M ${xCenter} ${y - 8} L ${xCenter + 8} ${y} L ${xCenter} ${y + 8} L ${xCenter - 8} ${y} Z`,
                fill: '#000'
              }),

              React.createElement('text', {
                x: globalSettings.plotWidth - margin.right + 10,
                y: y + 5,
                textAnchor: 'start',
                fontWeight: 'bold'
              }, plotSettings.showPValues ?
                `${formatNumber(pooledOR)} (${formatNumber(pooledLower)}-${formatNumber(pooledUpper)}) p=pooled` :
                `${formatNumber(pooledOR)} (${formatNumber(pooledLower)}-${formatNumber(pooledUpper)})`
              )
            )
          );
        }
      }

      // X-axis labels
      tickValues.forEach((val, idx) => {
        const displayVal = plotSettings.scale === 'log' ?
          (val >= 1 ? val.toFixed(0) : val.toFixed(2)) :
          (val >= 10 ? val.toFixed(0) : val.toFixed(1));

        elements.push(
          React.createElement('text', {
            key: `xaxis-${idx}`,
            x: xScale(val),
            y: globalSettings.plotHeight - margin.bottom + 20,
            textAnchor: 'middle',
            fontSize: plotSettings.fontSize - 2
          }, displayVal)
        );
      });

      // Footnote
      elements.push(
        React.createElement('text', {
          key: 'footnote',
          x: margin.left + plotWidth / 2,
          y: globalSettings.plotHeight - 20,
          textAnchor: 'middle',
          fontSize: plotSettings.fontSize - 2,
          fontStyle: 'italic'
        }, plotSettings.footnote)
      );

      return React.createElement('svg', {
        ref: svgRef,
        width: globalSettings.plotWidth,
        height: globalSettings.plotHeight,
        style: { fontFamily: plotSettings.font, fontSize: plotSettings.fontSize }
      },
        React.createElement('rect', {
          key: 'background',
          width: globalSettings.plotWidth,
          height: globalSettings.plotHeight,
          fill: 'white'
        }),
        ...elements
      );
    } catch (error) {
      console.error('Error rendering forest plot:', error);
      return React.createElement('div', { className: 'p-8 text-center text-red-600' },
        React.createElement('h3', { className: 'text-xl font-bold mb-2' }, '⚠️ Error Rendering Forest Plot'),
        React.createElement('p', null, 'An error occurred while generating the plot.'),
        React.createElement('p', { className: 'mt-2 text-sm font-mono bg-red-50 p-2 rounded' }, error.message),
        React.createElement('p', { className: 'mt-4 text-sm' }, 'Please check your settings and data, then try again.'),
        React.createElement('p', { className: 'mt-2 text-sm' }, 'Common issues:'),
        React.createElement('ul', { className: 'list-disc list-inside text-left mt-2 ml-4' },
          React.createElement('li', null, 'Invalid X-axis range'),
          React.createElement('li', null, 'Very small or very large numbers'),
          React.createElement('li', null, 'Negative values with log scale'),
          React.createElement('li', null, 'Invalid data in variables')
        )
      );
    }
  };

  const renderAllPlots = () => {
    const isHorizontal = globalSettings.layout === 'horizontal';
    const totalWidth = isHorizontal ? globalSettings.plotWidth * plots.length : globalSettings.plotWidth;
    const totalHeight = isHorizontal ? globalSettings.plotHeight : globalSettings.plotHeight * plots.length;

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
        const xOffset = isHorizontal ? index * globalSettings.plotWidth : 0;
        const yOffset = (isHorizontal ? 0 : index * globalSettings.plotHeight) + mainTitleHeight;

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
                  onChange: (e) => setGlobalSettings({ ...globalSettings, plotWidth: parseInt(e.target.value) }),
                  className: 'w-full px-3 py-2 border rounded',
                  placeholder: 'Width'
                }),
                React.createElement('input', {
                  type: 'number',
                  value: globalSettings.plotHeight,
                  onChange: (e) => setGlobalSettings({ ...globalSettings, plotHeight: parseInt(e.target.value) }),
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
                  data.map(row =>
                    React.createElement('tr', { key: row.id },
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          value: row.position !== undefined ? row.position : row.id,
                          onChange: (e) => updateRow(row.id, 'position', parseInt(e.target.value)),
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
                          onChange: (e) => updateRow(row.id, 'or', parseFloat(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.01',
                          value: row.lowerCI,
                          onChange: (e) => updateRow(row.id, 'lowerCI', parseFloat(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.01',
                          value: row.upperCI,
                          onChange: (e) => updateRow(row.id, 'upperCI', parseFloat(e.target.value)),
                          className: 'w-full px-2 py-1 border rounded'
                        })
                      ),
                      React.createElement('td', { className: 'border p-2' },
                        React.createElement('input', {
                          type: 'number',
                          step: '0.001',
                          value: row.pValue,
                          onChange: (e) => updateRow(row.id, 'pValue', parseFloat(e.target.value)),
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
                onChange: (e) => updateActiveSettings({ fontSize: parseInt(e.target.value) }),
                className: 'w-full px-3 py-2 border rounded'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Section Title Font Size'),
              React.createElement('input', {
                type: 'number',
                value: settings.groupTitleFontSize,
                onChange: (e) => updateActiveSettings({ groupTitleFontSize: parseInt(e.target.value) }),
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
                onChange: (e) => updateActiveSettings({ groupSpacing: parseInt(e.target.value) }),
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
                onChange: (e) => updateActiveSettings({ spacingBeforeGroupTitle: parseInt(e.target.value) }),
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
                onChange: (e) => updateActiveSettings({ spacingAfterGroupTitle: parseInt(e.target.value) }),
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

ReactDOM.render(
  React.createElement(ForestPlotGenerator),
  document.getElementById('root')
);
