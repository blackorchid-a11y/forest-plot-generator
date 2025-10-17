const { useState, useRef, useEffect } = React;
const { Download, Upload, Plus, Trash2 } = lucide;

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
            group: 'Group (Optional)'
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
  const [excelData, setExcelData] = useState(null); // Store full Excel workbook
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [datasets, setDatasets] = useState([{ id: 1, name: 'Dataset 1', data: [] }]); // Multiple datasets
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
    plotHeight: 600
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
              
              // Simple import for CSV - just map first columns
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
    // Check if OR and CI values are valid numbers
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
    const minVal = allValues.length > 0 ? Math.min(...allValues, 0.1) : 0.1;
    const maxVal = allValues.length > 0 ? Math.max(...allValues, 10) : 10;
    
    const xScale = (val) => {
      const scaled = scaleValue(val);
      const minScaled = scaleValue(minVal * 0.8);
      const maxScaled = scaleValue(maxVal * 1.2);
      return margin.left + (scaled - minScaled) / (maxScaled - minScaled) * plotWidth;
    };
    
    const rowHeight = plotHeight / (data.length + (settings.metaAnalysis ? 1 : 0));
    
    return React.createElement('svg', {
      ref: svgRef,
      width: settings.plotWidth,
      height: settings.plotHeight,
      style: { fontFamily: settings.font, fontSize: settings.fontSize }
    },
      React.createElement('rect', { width: settings.plotWidth, height: settings.plotHeight, fill: 'white' }),
      
      React.createElement('text', {
        x: settings.plotWidth / 2,
        y: 30,
        textAnchor: 'middle',
        fontSize: settings.fontSize + 4,
        fontWeight: 'bold'
      }, settings.title),
      
      React.createElement('text', {
        x: margin.left - 10,
        y: margin.top - 20,
        textAnchor: 'end',
        fontWeight: 'bold'
      }, 'Variable'),
      
      React.createElement('text', {
        x: settings.plotWidth - margin.right + 10,
        y: margin.top - 20,
        textAnchor: 'start',
        fontWeight: 'bold'
      }, 'OR (95% CI)'),
      
      React.createElement('line', {
        x1: xScale(1),
        y1: margin.top,
        x2: xScale(1),
        y2: settings.plotHeight - margin.bottom,
        stroke: '#000',
        strokeWidth: '1.5'
      }),
      
      settings.showGridlines && [0.5, 2, 5].map(val => {
        if (val >= minVal && val <= maxVal) {
          return React.createElement('line', {
            key: val,
            x1: xScale(val),
            y1: margin.top,
            x2: xScale(val),
            y2: settings.plotHeight - margin.bottom,
            stroke: '#ddd',
            strokeWidth: '1'
          });
        }
        return null;
      }),
      
      data.map((row, idx) => {
        const y = margin.top + (idx + 0.5) * rowHeight;
        const isValid = isValidData(row);

        // For invalid data, only show the variable name and "Invalid" status
        if (!isValid) {
          return React.createElement('g', { key: row.id },
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
          );
        }

        // For valid data, render normally
        const x1 = xScale(row.lowerCI);
        const x2 = xScale(row.upperCI);
        const xCenter = xScale(row.or);
        const color = getBarColor(row);

        return React.createElement('g', { key: row.id },
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
        );
      }),
      
      settings.metaAnalysis && (() => {
        const validDataForMeta = data.filter(d => isValidData(d));
        if (validDataForMeta.length === 0) return null;

        const pooledOR = validDataForMeta.reduce((sum, d) => sum + d.or, 0) / validDataForMeta.length;
        const pooledLower = validDataForMeta.reduce((sum, d) => sum + d.lowerCI, 0) / validDataForMeta.length;
        const pooledUpper = validDataForMeta.reduce((sum, d) => sum + d.upperCI, 0) / validDataForMeta.length;
        const y = margin.top + (data.length + 0.5) * rowHeight;
        const xCenter = xScale(pooledOR);
        
        return React.createElement('g', null,
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
        );
      })(),
      
      settings.scale === 'linear' && React.createElement('g', null,
        [minVal, 1, maxVal].map((val, idx) =>
          React.createElement('text', {
            key: idx,
            x: xScale(val),
            y: settings.plotHeight - margin.bottom + 20,
            textAnchor: 'middle',
            fontSize: settings.fontSize - 2
          }, val.toFixed(1))
        )
      ),
      
      settings.scale === 'log' && React.createElement('g', null,
        [0.1, 0.5, 1, 2, 5, 10].filter(v => v >= minVal && v <= maxVal).map(val =>
          React.createElement('text', {
            key: val,
            x: xScale(val),
            y: settings.plotHeight - margin.bottom + 20,
            textAnchor: 'middle',
            fontSize: settings.fontSize - 2
          }, val)
        )
      ),
      
      React.createElement('text', {
        x: settings.plotWidth / 2,
        y: settings.plotHeight - 20,
        textAnchor: 'middle',
        fontSize: settings.fontSize - 2,
        fontStyle: 'italic'
      }, settings.footnote)
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
                  React.createElement('th', { className: 'border p-2' }, 'Group'),
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
                        className: 'w-full px-2 py-1 border rounded'
                      })
                    ),
                    React.createElement('td', { className: 'border p-2' },
                      React.createElement('select', {
                        value: row.color,
                        onChange: (e) => updateRow(row.id, 'color', e.target.value),
                        className: 'w-full px-2 py-1 border rounded'
                      },
                        React.createElement('option', { value: 'auto' }, 'Auto'),
                        React.createElement('option', { value: '#000000' }, 'Black'),
                        React.createElement('option', { value: '#808080' }, 'Gray'),
                        React.createElement('option', { value: '#FF0000' }, 'Red'),
                        React.createElement('option', { value: '#0000FF' }, 'Blue'),
                        React.createElement('option', { value: '#00AA00' }, 'Green')
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