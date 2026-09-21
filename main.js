const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const XLSX = require('xlsx');

// Spreadsheet parsing runs here rather than in the renderer, which has no Node
// access. Workbooks are kept behind a handle so only plain rows are ever sent
// across IPC.
const workbooks = new Map();
let nextHandle = 1;

// This runs in the main process, so an unbounded read freezes the entire app,
// window included. A sheet can declare any '!ref' it likes and the range fields
// are user-editable, so both are treated as untrusted and capped.
const MAX_ROWS = 50000;
const MAX_COLS = 256;

const getEntry = (handle) => {
  const entry = workbooks.get(handle);
  if (!entry) throw new Error('That spreadsheet is no longer open.');
  return entry;
};

const getSheet = (handle, sheetName) => {
  const worksheet = getEntry(handle).workbook.Sheets[sheetName];
  if (!worksheet) throw new Error(`Sheet "${sheetName}" is not in this file.`);
  return worksheet;
};

// A renderer that navigates or reloads loses its handles, so the workbooks it
// opened would otherwise sit in memory for the life of the process. The
// ErrorBoundary's reload and Ctrl+R in development both do exactly that.
const releaseFor = (webContentsId) => {
  for (const [handle, entry] of workbooks) {
    if (entry.owner === webContentsId) workbooks.delete(handle);
  }
};

// Intersects the requested range with the sheet's real extent, then caps it.
const clampRange = (worksheet, start, end) => {
  let requested;
  try {
    requested = XLSX.utils.decode_range(String(start) + ':' + String(end));
  } catch {
    throw new Error('That cell range is not valid.');
  }

  const ref = worksheet['!ref'];
  const extent = ref ? XLSX.utils.decode_range(ref) : requested;

  const range = {
    s: {
      r: Math.max(requested.s.r, extent.s.r, 0),
      c: Math.max(requested.s.c, extent.s.c, 0)
    },
    e: {
      r: Math.min(requested.e.r, extent.e.r),
      c: Math.min(requested.e.c, extent.e.c)
    }
  };

  let truncated = range.e.r < requested.e.r || range.e.c < requested.e.c;

  if (range.e.r - range.s.r + 1 > MAX_ROWS) {
    range.e.r = range.s.r + MAX_ROWS - 1;
    truncated = true;
  }
  if (range.e.c - range.s.c + 1 > MAX_COLS) {
    range.e.c = range.s.c + MAX_COLS - 1;
    truncated = true;
  }

  const empty = range.e.r < range.s.r || range.e.c < range.s.c;
  return { range, truncated, empty };
};

function registerSpreadsheetHandlers() {
  ipcMain.handle('xlsx:open', (event, arrayBuffer) => {
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const handle = nextHandle++;
    // One file open at a time per window; opening another releases the last.
    releaseFor(event.sender.id);
    workbooks.set(handle, { workbook, owner: event.sender.id });
    return { handle, sheets: workbook.SheetNames };
  });

  ipcMain.handle('xlsx:usedRange', (event, handle, sheetName) => {
    const worksheet = getSheet(handle, sheetName);
    const ref = worksheet['!ref'];
    if (!ref || !ref.includes(':')) return { start: 'A1', end: 'E10' };
    const { range } = clampRange(worksheet, ...ref.split(':'));
    return {
      start: XLSX.utils.encode_cell(range.s),
      end: XLSX.utils.encode_cell(range.e)
    };
  });

  // SheetJS's `header: 1` means "give me arrays of arrays", NOT "row 1 is the
  // header". Omitting the option is what makes it key each row by header text.
  ipcMain.handle('xlsx:readRows', (event, handle, sheetName, start, end, hasHeaders) => {
    const worksheet = getSheet(handle, sheetName);
    const { range, truncated, empty } = clampRange(worksheet, start, end);
    if (empty) return { rows: [], truncated: false };

    const options = { range, defval: '' };
    if (!hasHeaders) options.header = 1;
    return { rows: XLSX.utils.sheet_to_json(worksheet, options), truncated };
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

  // Captured now: reading it back after the window is gone would throw.
  const webContentsId = win.webContents.id;
  win.webContents.on('did-start-navigation', (event, url, isInPlace, isMainFrame) => {
    if (isMainFrame) releaseFor(webContentsId);
  });
  win.on('closed', () => releaseFor(webContentsId));

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
