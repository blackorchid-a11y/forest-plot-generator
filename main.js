const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('xlsx');

// Spreadsheet parsing runs here rather than in the renderer, which has no Node
// access. Workbooks are kept behind a handle so only plain rows are ever sent
// across IPC.
const workbooks = new Map();
let nextHandle = 1;

const getWorkbook = (handle) => {
  const workbook = workbooks.get(handle);
  if (!workbook) throw new Error('That spreadsheet is no longer open.');
  return workbook;
};

function registerSpreadsheetHandlers() {
  ipcMain.handle('xlsx:open', (event, arrayBuffer) => {
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const handle = nextHandle++;
    workbooks.set(handle, workbook);
    return { handle, sheets: workbook.SheetNames };
  });

  ipcMain.handle('xlsx:usedRange', (event, handle, sheetName) => {
    const worksheet = getWorkbook(handle).Sheets[sheetName];
    const ref = worksheet && worksheet['!ref'];
    if (!ref || !ref.includes(':')) return { start: 'A1', end: 'E10' };
    const [start, end] = ref.split(':');
    return { start, end };
  });

  // SheetJS's `header: 1` means "give me arrays of arrays", NOT "row 1 is the
  // header". Omitting the option is what makes it key each row by header text.
  ipcMain.handle('xlsx:readRows', (event, handle, sheetName, start, end, hasHeaders) => {
    const worksheet = getWorkbook(handle).Sheets[sheetName];
    const options = {
      range: XLSX.utils.decode_range(start + ':' + end),
      defval: ''
    };
    if (!hasHeaders) options.header = 1;
    return XLSX.utils.sheet_to_json(worksheet, options);
  });

  ipcMain.handle('xlsx:close', (event, handle) => {
    workbooks.delete(handle);
    return true;
  });
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  // Without an Edit menu, macOS leaves Cmd+C/V/X/A/Z dead in every input, and
  // without the app menu it has no Quit. Reload is a developer-only tool here:
  // there is no autosave, so Ctrl+R in a shipped build silently discards every
  // unsaved plot.
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        ...(app.isPackaged ? [] : [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' }
        ]),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' }
  ];

  return Menu.buildFromTemplate(template);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      // The renderer gets no Node access; spreadsheet parsing goes through the
      // narrow bridge in preload.js.
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
  win.maximize();

  if (!app.isPackaged) {
    win.webContents.openDevTools();
  }

  // The menu is set for its accelerators; the bar itself stays hidden on
  // Windows and Linux. This has to come after setApplicationMenu, which would
  // otherwise bring the bar back.
  Menu.setApplicationMenu(buildMenu());
  if (process.platform !== 'darwin') {
    win.autoHideMenuBar = true;
    win.setMenuBarVisibility(false);
  }
}

app.whenReady().then(() => {
  registerSpreadsheetHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
