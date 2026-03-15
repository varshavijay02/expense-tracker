const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { initDatabase, getDashboardSummary, getTransactions, updateTransaction, getCategoriesWithTotals, getSettingsEmail, setSettingsEmail } = require('./sqlite');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#0F172A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initDatabase(app.getPath('userData'));
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('dashboard:getSummary', async () => {
  return getDashboardSummary();
});

ipcMain.handle('transactions:getAll', async (_event, filters) => {
  return getTransactions(filters || {});
});

ipcMain.handle('transactions:update', async (_event, payload) => {
  return updateTransaction(payload);
});

ipcMain.handle('categories:getWithTotals', async () => {
  return getCategoriesWithTotals();
});

ipcMain.handle('settings:getEmail', async () => {
  return getSettingsEmail();
});

ipcMain.handle('settings:setEmail', async (_event, email) => {
  return setSettingsEmail(email);
});

