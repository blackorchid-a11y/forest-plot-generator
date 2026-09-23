const { app, BrowserWindow, Menu, ipcMain, utilityProcess } = require('electron');
const path = require('path');

// Spreadsheets are parsed in a separate utility process (xlsx-worker.js), one
// per open workbook, never here: a crafted file that trips a parser bug then
// cannot reach the main process, and a parse that hangs is killed on a timeout
// instead of freezing the window. The renderer holds only a handle, and only
// plain rows ever cross back to it.
const WORKER_PATH = path.join(__dirname, 'xlsx-worker.js');
const OPEN_TIMEOUT_MS = 30000;
const READ_TIMEOUT_MS = 15000;

// handle -> { handle, owner, worker, ready, pending, nextId, exited }
const workbooks = new Map();
let nextHandle = 1;

const failPending = (entry, message) => {
  for (const { reject, timer } of entry.pending.values()) {
    clearTimeout(timer);
    reject(new Error(message));
  }
  entry.pending.clear();
};

const release = (handle) => {
  const entry = workbooks.get(handle);
  if (!entry) return;
  workbooks.delete(handle);
  failPending(entry, 'That spreadsheet was closed.');
  if (!entry.exited) entry.worker.kill();
};

// A renderer that navigates or reloads loses its handles, so the workbooks it
// opened would otherwise sit in memory for the life of the process. The
// ErrorBoundary's reload and Ctrl+R in development both do exactly that.
const releaseFor = (webContentsId) => {
  for (const [handle, entry] of workbooks) {
    if (entry.owner === webContentsId) release(handle);
  }
};

const startWorker = (handle, owner) => {
  const worker = utilityProcess.fork(WORKER_PATH, [], { serviceName: 'Spreadsheet reader' });
  const entry = { handle, owner, worker, pending: new Map(), nextId: 1, exited: false };
  // Messages are sent only once the process is up.
  entry.ready = new Promise((resolve) => worker.once('spawn', resolve));

  worker.on('message', (message) => {
    const request = message && entry.pending.get(message.id);
    if (!request) return;
    entry.pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.ok) request.resolve(message.result);
    else request.reject(new Error(message.error));
  });

  worker.on('exit', () => {
    entry.exited = true;
    failPending(entry, 'The spreadsheet reader stopped unexpectedly. Please open the file again.');
    workbooks.delete(handle);
  });

  return entry;
};

const callWorker = (entry, type, payload, timeoutMs) => new Promise((resolve, reject) => {
  if (entry.exited) {
    reject(new Error('The spreadsheet reader has stopped. Please open the file again.'));
    return;
  }
  const id = entry.nextId++;
  const timer = setTimeout(() => {
    entry.pending.delete(id);
    reject(new Error('The spreadsheet took too long to read, so it was closed.'));
    release(entry.handle);
  }, timeoutMs);
  entry.pending.set(id, { resolve, reject, timer });
  entry.ready.then(() => {
    if (!entry.exited) entry.worker.postMessage({ id, type, payload });
  });
});

// Handles are only honoured for the window that opened them.
const getEntry = (handle, owner) => {
  const entry = workbooks.get(handle);
  if (!entry || entry.owner !== owner) throw new Error('That spreadsheet is no longer open.');
  return entry;
};

function registerSpreadsheetHandlers() {
  ipcMain.handle('xlsx:open', async (event, arrayBuffer) => {
    const owner = event.sender.id;
    // One file open at a time per window; opening another releases the last.
    releaseFor(owner);
    const handle = nextHandle++;
    const entry = startWorker(handle, owner);
    workbooks.set(handle, entry);
    try {
      const { sheets } = await callWorker(entry, 'open', { data: new Uint8Array(arrayBuffer) }, OPEN_TIMEOUT_MS);
      return { handle, sheets };
    } catch (error) {
      release(handle);
      throw error;
    }
  });

  ipcMain.handle('xlsx:usedRange', (event, handle, sheetName) =>
    callWorker(getEntry(handle, event.sender.id), 'usedRange', { sheetName }, READ_TIMEOUT_MS));

  ipcMain.handle('xlsx:readRows', (event, handle, sheetName, start, end, hasHeaders) =>
    callWorker(getEntry(handle, event.sender.id), 'readRows',
      { sheetName, start, end, hasHeaders: Boolean(hasHeaders) }, READ_TIMEOUT_MS));

  ipcMain.handle('xlsx:close', (event, handle) => {
    const entry = workbooks.get(handle);
    if (entry && entry.owner === event.sender.id) release(handle);
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
