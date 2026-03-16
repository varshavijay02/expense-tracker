const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getDashboardSummary: () => ipcRenderer.invoke('dashboard:getSummary'),
  getTransactions: (filters) => ipcRenderer.invoke('transactions:getAll', filters),
  updateTransaction: (payload) => ipcRenderer.invoke('transactions:update', payload),
  getCategoriesWithTotals: () => ipcRenderer.invoke('categories:getWithTotals'),
  getEmail: () => ipcRenderer.invoke('settings:getEmail'),
  setEmail: (email) => ipcRenderer.invoke('settings:setEmail', email),
  fetchNewTransactions: () => ipcRenderer.invoke('gmail:fetchNewTransactions')
});

