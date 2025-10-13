const { useState, useRef } = React;
const { Download, Upload, Plus, Trash2 } = lucide;

function ForestPlotGenerator() {
  const [inputMode, setInputMode] = useState('manual');
  const [data, setData] = useState([
    { id: 1, variable: 'Variable 1', or: 1.5, lowerCI: 1.2, upperCI: 1.9, pValue: 0.001, sampleSize: '', group: '', color: 'auto' }
  ]);
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

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map((row, idx) => ({
            id: idx + 1,
            variable: row.Variable || row.variable || row.name || `Variable ${idx + 1}`,
            or: parseFloat(row.OR || row.or || row.odds_ratio) || 1.0,
            lowerCI: parseFloat(row.LowerCI || row.lower_ci || row.lower) || 0.8,
            upperCI: parseFloat(row.UpperCI || row.upper_ci || row.upper) || 1.2,
            pValue: parseFloat(row.PValue || row.p_value || row.pvalue || row.p) || 0.05,
            sampleSize: row.SampleSize || row.sample_size || row.n || '',
            group: row.Group || row.group || '',
            color: 'auto'
          }));
          setData(parsed);
        }
      });
    } else if (type === 'xlsx') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const parsed = jsonData.map((row, idx) => ({
        id: idx + 1,
        variable: row.Variable || row.variable || row.name || `Variable ${idx + 1}`,
        or: parseFloat(row.OR || row.or || row.odds_ratio) || 1.0,
        lowerCI: parseFloat(row.LowerCI || row.lower_ci || row.lower) || 0.8,
        upperCI: parseFloat(row.UpperCI || row.upper_ci || row.upper) || 1.2,
        pValue: parseFloat(row.PValue || row.p_value || row.pvalue || row.p) || 0.05,
        sampleSize: row.SampleSize || row.sample_size || row.n || '',
        group: row.Group || row.group || '',
        color: 'auto'
      }));
      setData(parsed);
    }
  };

  const isSignificant = (lowerCI, upperCI) => {
    return !(lowerCI <= 1.0 && upperCI >= 1.0);
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
    
    const allValues = data.flatMap(d => [d.lowerCI, d.or, d.upperCI]);
    const minVal = Math.min(...allValues, 0.1);
    const maxVal = Math.max(...allValues, 10);
    
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
        const pooledOR = data.reduce((sum, d) => sum + d.or, 0) / data.length;
        const pooledLower = data.reduce((sum, d) => sum + d.lowerCI, 0) / data.length;
        const pooledUpper = data.reduce((sum, d) => sum + d.upperCI, 0) / data.length;
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
    React.createElement('div', { className: 'max-w-7xl mx-auto' },
      React.createElement('div', { className: 'bg-white rounded-lg shadow-lg p-6 mb-6' },
        React.createElement('h1', { className: 'text-3xl font-bold mb-6 text-gray-800' }, 'Forest Plot Generator'),
        
        React.createElement('div', { className: 'flex gap-4 mb-6' },
          React.createElement('button', {
            onClick: () => setInputMode('manual'),
            className: `px-4 py-2 rounded ${inputMode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`
          }, 'Manual Entry'),
          
          React.createElement('label', {
            className: `px-4 py-2 rounded cursor-pointer ${inputMode === 'csv' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`
          },
            'CSV Upload',
            React.createElement('input', {
              type: 'file',
              accept: '.csv',
              className: 'hidden',
              onChange: (e) => { setInputMode('csv'); handleFileUpload(e, 'csv'); }
            })
          ),
          
          React.createElement('label', {
            className: `px-4 py-2 rounded cursor-pointer ${inputMode === 'xlsx' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`
          },
            'Excel Upload',
            React.createElement('input', {
              type: 'file',
              accept: '.xlsx',
              className: 'hidden',
              onChange: (e) => { setInputMode('xlsx'); handleFileUpload(e, 'xlsx'); }
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