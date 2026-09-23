// Runs in the isolated preload context, which is sandboxed: it can use
// ipcRenderer but cannot require npm packages. Spreadsheet parsing therefore
// happens outside the renderer (see xlsx-worker.js), and the renderer gets only
// this narrow, data-only API. Workbooks never cross into the renderer; it holds
// a handle.
const { contextBridge, ipcRenderer } = require('electron');

// Electron prefixes every IPC rejection with "Error invoking remote method
// 'xlsx:open': Error: ", which would otherwise land verbatim in the user's alert.
const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args).catch((error) => {
  const message = String(error && error.message)
    .replace(/^Error invoking remote method '[^']*': (Error: )?/, '');
  throw new Error(message);
});

contextBridge.exposeInMainWorld('xlsxBridge', {
  // Parses a file and resolves to its handle plus sheet names.
  open: (arrayBuffer) => invoke('xlsx:open', arrayBuffer),

  // The range a sheet declares it uses, so the importer need not guess.
  usedRange: (handle, sheetName) => invoke('xlsx:usedRange', handle, sheetName),

  readRows: (handle, sheetName, start, end, hasHeaders) =>
    invoke('xlsx:readRows', handle, sheetName, start, end, hasHeaders),

  close: (handle) => invoke('xlsx:close', handle)
});
