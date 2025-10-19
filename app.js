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
  { name: 'Blue', value: '#0074D9' },
  { name: 'Sky Blue', value: '#7FDBFF' },
  { name: 'Light Blue', value: '#87CEEB' },
  { name: 'Teal', value: '#39CCCC' },
  { name: 'Cyan', value: '#00BFFF' },
  
  // Greens
  { name: 'Dark Green', value: '#006400' },
  { name: 'Forest Green', value: '#228B22' },
  { name: 'Green', value: '#2ECC40' },
  { name: 'Lime Green', value: '#32CD32' },
  { name: 'Olive', value: '#3D9970' },
  { name: 'Mint', value: '#98FB98' },
  { name: 'Emerald', value: '#50C878' },
  
  // Reds/Pinks
  { name: 'Maroon', value: '#800000' },
  { name: 'Dark Red', value: '#8B0000' },
  { name: 'Red', value: '#FF4136' },
  { name: 'Crimson', value: '#DC143C' },
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Pink', value: '#FF69B4' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Rose', value: '#FF007F' },
  
  // Oranges/Yellows
  { name: 'Dark Orange', value: '#FF8C00' },
  { name: 'Orange', value: '#FF851B' },
  { name: 'Light Orange', value: '#FFA500' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Yellow', value: '#FFDC00' },
  { name: 'Amber', value: '#FFBF00' },
  { name: 'Mustard', value: '#FFDB58' },
  
  // Purples
  { name: 'Indigo', value: '#4B0082' },
  { name: 'Purple', value: '#800080' },
  { name: 'Violet', value: '#B10DC9' },
  { name: 'Lavender', value: '#E6E6FA' },
  { name: 'Plum', value: '#DDA0DD' },
  { name: 'Orchid', value: '#DA70D6' },
  
  // Browns
  { name: 'Brown', value: '#8B4513' },
  { name: 'Chocolate', value: '#D2691E' },
  { name: 'Sienna', value: '#A0522D' },
  { name: 'Tan', value: '#D2B48C' },
  { name: 'Beige', value: '#F5F5DC' },
  
  // Others
  { name: 'Turquoise', value: '#40E0D0' },
  { name: 'Salmon', value: '#FA8072' },
  { name: 'Peach', value: '#FFE5B4' },
  { name: 'Khaki', value: '#F0E68C' },
  { name: 'Silver', value: '#C0C0C0' }
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
        color: 'auto'
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
              onChange: (e) => setCellRange({...cellRange, start: e.target.value.toUpperCase()}),
              className: 'w-full px-3 py-2 border rounded',
              placeholder: 'A1'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block font-semibold mb-2' }, 'End Cell (e.g., E10)'),
            React.createElement('input', {
              type: 'text',
              value: cellRange.end,
              onChange: (e) => setCellRange({...cellRange, end: e.target.value.toUpperCase()}),
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
                onChange: (e) => setColumnMapping({...columnMapping, [field]: e.target.value}),
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
  const [data, setData] = useState([
    { id: 1, variable: 'Variable 1', or: 1.5, lowerCI: 1.2, upperCI: 1.9, pValue: 0.001, sampleSize: '', group: '', color: 'auto' }
  ]);
  const [excelData, setExcelData] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [datasets, setDatasets] = useState([{ id: 1, name: 'Dataset 1', data: [] }]);
  const [activeDatasetId, setActiveDatasetId] = useState(1);
  const [settings, setSettings] = useState({
    scale: 'linear',
    font: 'Arial',
    fontSize: 14,
    showGridlines: false,
    metaAnalysis: false,
    title: 'Forest Plot',
    footnote: 'Error bars represent 95% confidence intervals',
    plotWidth: 800,
    plotHeight: 600,
    groupSpacing: 30,
    // X-axis settings
    xAxisMode: 'auto', // 'auto' or 'manual'
    xAxisMin: '',
    xAxisMax: '',
    xAxisTicks: '' // comma-separated values
  });
  const svgRef = useRef(null);

  const fonts = ['Arial', 'Times New Roman', 'Calibri', 'Comfortaa', 'Georgia', 'Verdana'];

  const addRow = () => {
    const newId = Math.max(...data.map(d => d.id), 0) + 1;
    setData([...data, { 
      id: newId, 
      variable: `Variable ${newId}`, 
      or: 1.0, 
      lowerCI: 0.8, 
      upperCI: 1.2, 
      pValue: 0.5, 
      sampleSize: '', 
      group: '',
      color: 'auto'
    }]);
  };

  const deleteRow = (id) => {
    setData(data.filter(d => d.id !== id));
  };

  const updateRow = (id, field, value) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleExcelImport = (parsed, sheetName) => {
    setData(parsed);
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
                color: 'auto'
              }));
              setData(parsed);
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

  const scaleValue = (value) => {
    if (settings.scale === 'log') {
      return Math.log(value);
    }
    return value;
  };

  const groupDataBySections = () => {
    const groups = {};
    
    data.forEach(row => {
      const groupName = row.group || 'Ungrouped';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(row);
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
    const project = { data, settings };
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
        if (project.data) setData(project.data);
        if (project.settings) setSettings(project.settings);
      } catch (error) {
        alert('Error loading project file');
      }
    };
    reader.readAsText(file);
  };

  const renderForestPlot = () => {
    const margin = { top: 80, right: 150, bottom: 80, left: 200 };
    const plotWidth = settings.plotWidth - margin.left - margin.right;
    const plotHeight = settings.plotHeight - margin.top - margin.bottom;
    
    const validData = data.filter(d => isValidData(d));
    const allValues = validData.flatMap(d => [d.lowerCI, d.or, d.upperCI]);
    
    // Determine X-axis range
    let minVal, maxVal;
    if (settings.xAxisMode === 'manual' && settings.xAxisMin !== '' && settings.xAxisMax !== '') {
      minVal = parseFloat(settings.xAxisMin);
      maxVal = parseFloat(settings.xAxisMax);
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
        if (settings.scale === 'log') {
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
      const scaled = scaleValue(val);
      const minScaled = scaleValue(minVal);
      const maxScaled = scaleValue(maxVal);
      return margin.left + (scaled - minScaled) / (maxScaled - minScaled) * plotWidth;
    };
    
    // Generate tick marks
    let tickValues;
    if (settings.xAxisMode === 'manual' && settings.xAxisTicks !== '') {
      tickValues = settings.xAxisTicks.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v) && v >= minVal && v <= maxVal);
    } else {
      tickValues = generateSmartTicks(minVal, maxVal, settings.scale);
    }
    
    // Group data into sections
    const groupedData = groupDataBySections();
    const groupNames = Object.keys(groupedData);
    
    // Calculate total rows including section headers
    let totalRows = data.length + groupNames.length;
    if (settings.metaAnalysis) totalRows += 1;
    
    const baseRowHeight = (plotHeight - (groupNames.length * settings.groupSpacing)) / totalRows;
    let currentY = margin.top;
    
    const elements = [];
    
    // Header labels
    elements.push(
      React.createElement('text', {
        key: 'header-title',
        x: settings.plotWidth / 2,
        y: 30,
        textAnchor: 'middle',
        fontSize: settings.fontSize + 4,
        fontWeight: 'bold'
      }, settings.title)
    );
    
    elements.push(
      React.createElement('text', {
        key: 'header-var',
        x: margin.left - 10,
        y: margin.top - 20,
        textAnchor: 'end',
        fontWeight: 'bold'
      }, 'Variable')
    );
    
    elements.push(
      React.createElement('text', {
        key: 'header-or',
        x: settings.plotWidth - margin.right + 10,
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
          y2: settings.plotHeight - margin.bottom,
          stroke: '#000',
          strokeWidth: '1.5'
        })
      );
    }
    
    // Gridlines
    if (settings.showGridlines) {
      tickValues.forEach((val, idx) => {
        if (val !== 1.0) { // Don't duplicate the main vertical line
          elements.push(
            React.createElement('line', {
              key: `grid-${idx}`,
              x1: xScale(val),
              y1: margin.top,
              x2: xScale(val),
              y2: settings.plotHeight - margin.bottom,
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
        elements.push(
          React.createElement('text', {
            key: `section-${groupIdx}`,
            x: margin.left - 10,
            y: currentY + 5,
            textAnchor: 'end',
            fontWeight: 'bold',
            fontSize: settings.fontSize + 2,
            fill: '#000000'
          }, groupName)
        );
        
        currentY += baseRowHeight + settings.groupSpacing;
      }
      
      // Render rows in this group
      groupRows.forEach((row, rowIdx) => {
        const y = currentY + baseRowHeight / 2;
        const isValid = isValidData(row);

        if (!isValid) {
          elements.push(
            React.createElement('g', { key: `row-${row.id}` },
              React.createElement('text', {
                x: margin.left - 10,
                y: y + 5,
                textAnchor: 'end'
              }, row.variable),

              React.createElement('text', {
                x: settings.plotWidth - margin.right + 10,
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
                x: margin.left - 10,
                y: y + 5,
                textAnchor: 'end'
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
                x: settings.plotWidth - margin.right + 10,
                y: y + 5,
                textAnchor: 'start'
              }, `${row.or.toFixed(2)} (${row.lowerCI.toFixed(2)}-${row.upperCI.toFixed(2)})`)
            )
          );
        }
        
        currentY += baseRowHeight;
      });
    });
    
    // Meta-analysis pooled effect
    if (settings.metaAnalysis) {
      const validDataForMeta = data.filter(d => isValidData(d));
      if (validDataForMeta.length > 0) {
        const pooledOR = validDataForMeta.reduce((sum, d) => sum + d.or, 0) / validDataForMeta.length;
        const pooledLower = validDataForMeta.reduce((sum, d) => sum + d.lowerCI, 0) / validDataForMeta.length;
        const pooledUpper = validDataForMeta.reduce((sum, d) => sum + d.upperCI, 0) / validDataForMeta.length;
        const y = currentY + baseRowHeight / 2;
        const xCenter = xScale(pooledOR);
        
        elements.push(
          React.createElement('g', { key: 'pooled-effect' },
            React.createElement('text', {
              x: margin.left - 10,
              y: y + 5,
              textAnchor: 'end',
              fontWeight: 'bold'
            }, 'Pooled Effect'),
            
            React.createElement('path', {
              d: `M ${xCenter} ${y - 8} L ${xCenter + 8} ${y} L ${xCenter} ${y + 8} L ${xCenter - 8} ${y} Z`,
              fill: '#000'
            }),
            
            React.createElement('text', {
              x: settings.plotWidth - margin.right + 10,
              y: y + 5,
              textAnchor: 'start',
              fontWeight: 'bold'
            }, `${pooledOR.toFixed(2)} (${pooledLower.toFixed(2)}-${pooledUpper.toFixed(2)})`)
          )
        );
      }
    }
    
    // X-axis labels
    tickValues.forEach((val, idx) => {
      const displayVal = settings.scale === 'log' ? 
        (val >= 1 ? val.toFixed(0) : val.toFixed(2)) :
        (val >= 10 ? val.toFixed(0) : val.toFixed(1));
      
      elements.push(
        React.createElement('text', {
          key: `xaxis-${idx}`,
          x: xScale(val),
          y: settings.plotHeight - margin.bottom + 20,
          textAnchor: 'middle',
          fontSize: settings.fontSize - 2
        }, displayVal)
      );
    });
    
    // Footnote
    elements.push(
      React.createElement('text', {
        key: 'footnote',
        x: settings.plotWidth / 2,
        y: settings.plotHeight - 20,
        textAnchor: 'middle',
        fontSize: settings.fontSize - 2,
        fontStyle: 'italic'
      }, settings.footnote)
    );
    
    return React.createElement('svg', {
      ref: svgRef,
      width: settings.plotWidth,
      height: settings.plotHeight,
      style: { fontFamily: settings.font, fontSize: settings.fontSize }
    },
      React.createElement('rect', { 
        key: 'background', 
        width: settings.plotWidth, 
        height: settings.plotHeight, 
        fill: 'white' 
      }),
      ...elements
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
                            value: color.value 
                          }, color.name)
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
            React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Title'),
            React.createElement('input', {
              type: 'text',
              value: settings.title,
              onChange: (e) => setSettings({...settings, title: e.target.value}),
              className: 'w-full px-3 py-2 border rounded'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Footnote'),
            React.createElement('input', {
              type: 'text',
              value: settings.footnote,
              onChange: (e) => setSettings({...settings, footnote: e.target.value}),
              className: 'w-full px-3 py-2 border rounded'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Font'),
            React.createElement('select', {
              value: settings.font,
              onChange: (e) => setSettings({...settings, font: e.target.value}),
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
              onChange: (e) => setSettings({...settings, fontSize: parseInt(e.target.value)}),
              className: 'w-full px-3 py-2 border rounded'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Scale'),
            React.createElement('select', {
              value: settings.scale,
              onChange: (e) => setSettings({...settings, scale: e.target.value}),
              className: 'w-full px-3 py-2 border rounded'
            },
              React.createElement('option', { value: 'linear' }, 'Linear'),
              React.createElement('option', { value: 'log' }, 'Logarithmic')
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block mb-2 font-semibold' }, 'Section Spacing'),
            React.createElement('input', {
              type: 'number',
              value: settings.groupSpacing,
              onChange: (e) => setSettings({...settings, groupSpacing: parseInt(e.target.value)}),
              className: 'w-full px-3 py-2 border rounded',
              min: '0',
              max: '100'
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'flex items-center gap-2' },
              React.createElement('input', {
                type: 'checkbox',
                checked: settings.showGridlines,
                onChange: (e) => setSettings({...settings, showGridlines: e.target.checked})
              }),
              React.createElement('span', { className: 'font-semibold' }, 'Show Gridlines')
            ),
            React.createElement('label', { className: 'flex items-center gap-2 mt-2' },
              React.createElement('input', {
                type: 'checkbox',
                checked: settings.metaAnalysis,
                onChange: (e) => setSettings({...settings, metaAnalysis: e.target.checked})
              }),
              React.createElement('span', { className: 'font-semibold' }, 'Meta-analysis Mode')
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
                onChange: (e) => setSettings({...settings, xAxisMode: e.target.value}),
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
                onChange: (e) => setSettings({...settings, xAxisMin: e.target.value}),
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
                onChange: (e) => setSettings({...settings, xAxisMax: e.target.value}),
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
                onChange: (e) => setSettings({...settings, xAxisTicks: e.target.value}),
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
      ),

      React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-6' },
        React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, 'Preview'),
        React.createElement('div', { className: 'overflow-auto' },
          renderForestPlot()
        )
      )
    )
  );
}

ReactDOM.render(
  React.createElement(ForestPlotGenerator),
  document.getElementById('root')
);
