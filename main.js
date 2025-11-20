const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  win.setMenuBarVisibility(false);
  win.maximize();

  // Open DevTools automatically in development
  win.webContents.openDevTools();

  // Handle zoom shortcuts manually since menu bar is hidden
  win.webContents.on('before-input-event', (event, input) => {
    if (input.control) {
      if (input.key === '+' || input.key === '=') {
        win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 1);
        event.preventDefault();
      } else if (input.key === '-') {
        win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 1);
        event.preventDefault();
      } else if (input.key === '0') {
        win.webContents.setZoomLevel(0);
        event.preventDefault();
      }
    }
  });
}

app.whenReady().then(createWindow);

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