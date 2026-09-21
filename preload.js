// Runs in the isolated preload context, which is sandboxed: it can use
// ipcRenderer but cannot require npm packages. Spreadsheet parsing therefore
// happens in the main process, and the renderer gets only this narrow,
// data-only API. Workbooks never cross into the renderer; it holds a handle.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('xlsxBridge', {
  // Parses a file and resolves to its handle plus sheet names.
  open: (arrayBuffer) => ipcRenderer.invoke('xlsx:open', arrayBuffer),

  // The range a sheet declares it uses, so the importer need not guess.
  usedRange: (handle, sheetName) => ipcRenderer.invoke('xlsx:usedRange', handle, sheetName),

  readRows: (handle, sheetName, start, end, hasHeaders) =>
    ipcRenderer.invoke('xlsx:readRows', handle, sheetName, start, end, hasHeaders),

  close: (handle) => ipcRenderer.invoke('xlsx:close', handle)
});
