require('dotenv').config();
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

const {
  initDatabase,
  getDashboardSummary,
  getTransactions,
  updateTransaction,
  getCategoriesWithTotals,
  getSettingsEmail,
  setSettingsEmail,
  getSetting,
  setSetting
} = require('./sqlite');

const { authenticateOAuth2, fetchRecentTransactionEmails } = require('../backend/gmail_fetch');
const { parseTransactionEmail } = require('../backend/email_parser');
const { insertFromEmails } = require('../backend/transaction_extractor');
const { exportTransactionsCsv } = require('../backend/csv_export');

let mainWindow;
let userDataPathCached;

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

  // 🔧 Open Electron DevTools automatically
  mainWindow.webContents.openDevTools();

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  userDataPathCached = app.getPath('userData');
  initDatabase(userDataPathCached);
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

ipcMain.handle('gmail:fetchNewTransactions', async () => {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectPort = process.env.GMAIL_REDIRECT_PORT
    ? Number(process.env.GMAIL_REDIRECT_PORT)
    : 42813;

  const storedTokenJson = getSetting('gmail_token');

  const { oauth2Client, tokenJson } = await authenticateOAuth2({
    clientId,
    clientSecret,
    redirectPort,
    storedTokenJson,
    openExternalUrl: (url) => shell.openExternal(url)
  });

  if (tokenJson && tokenJson !== storedTokenJson) {
    setSetting('gmail_token', tokenJson);
  }

  const emails = await fetchRecentTransactionEmails({
    oauth2Client,
    maxResults: 25
  });

  const extractedRows = emails.map((e) => {
    const parsed = parseTransactionEmail({
      bodyText: e.bodyText,
      internalDate: e.internalDate
    });

    return {
      sourceEmailId: e.id,
      date: parsed.date,
      merchant: parsed.merchant,
      amount: parsed.amount,
      bodyText: parsed.bodyText
    };
  });

  const insertResult = insertFromEmails({
    userDataPath: userDataPathCached,
    extractedRows
  });

  const csvResult = exportTransactionsCsv({
    userDataPath: userDataPathCached,
    outputPath: path.join(process.cwd(), 'database', 'transactions.csv')
  });

  return {
    fetchedEmailCount: emails.length,
    insertedCount: insertResult.insertedCount,
    csv: csvResult
  };
});