const path = require('path');
const Database = require('better-sqlite3');

let db;
let dbPathCached;

function initDatabase(userDataPath) {
  dbPathCached = path.join(userDataPath || __dirname, 'finance.db');
  db = new Database(dbPathCached);

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: add source_email_id for dedupe
  migrateTransactionsForEmailDedupe();

  seedInitialData();
}

function migrateTransactionsForEmailDedupe() {
  const cols = db.prepare('PRAGMA table_info(transactions)').all();
  const hasSource = cols.some((c) => c.name === 'source_email_id');
  if (!hasSource) {
    db.exec('ALTER TABLE transactions ADD COLUMN source_email_id TEXT;');
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_source_email_id ON transactions(source_email_id);');
}

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : null;
}

function setSetting(key, value) {
  const upsert = db.prepare(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  upsert.run(key, value);
  return { success: true };
}

function seedInitialData() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (existing.count > 0) return;

  const insertCategory = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
  const categories = [
    ['Groceries', '#22C55E'],
    ['Rent', '#3B82F6'],
    ['Utilities', '#F97316'],
    ['Transport', '#A855F7'],
    ['Entertainment', '#EF4444'],
    ['Salary', '#10B981']
  ];
  const insertMany = db.transaction((rows) => {
    for (const [name, color] of rows) insertCategory.run(name, color);
  });
  insertMany(categories);

  const categoryMap = {};
  db.prepare('SELECT id, name FROM categories').all().forEach((c) => {
    categoryMap[c.name] = c.id;
  });

  const insertTx = db.prepare(`
    INSERT INTO transactions (date, description, category_id, amount, type)
    VALUES (?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const sampleDate = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return d.toISOString().slice(0, 10);
  };

  const transactions = [
    [sampleDate(1), 'Supermarket', categoryMap['Groceries'], 65.5, 'expense'],
    [sampleDate(2), 'Monthly Rent', categoryMap['Rent'], 1200, 'expense'],
    [sampleDate(3), 'Electricity Bill', categoryMap['Utilities'], 90.25, 'expense'],
    [sampleDate(4), 'Bus Pass', categoryMap['Transport'], 40, 'expense'],
    [sampleDate(5), 'Streaming Subscription', categoryMap['Entertainment'], 15.99, 'expense'],
    [sampleDate(6), 'Company Payroll', categoryMap['Salary'], 3200, 'income']
  ];

  const insertTxMany = db.transaction((rows) => {
    for (const row of rows) insertTx.run(...row);
  });
  insertTxMany(transactions);
}

function getDashboardSummary() {
  const totals = db.prepare(`
    SELECT
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome
    FROM transactions
  `).get();

  const savings = (totals.totalIncome || 0) - (totals.totalExpense || 0);

  const byCategory = db.prepare(`
    SELECT c.name as category, c.color as color, SUM(t.amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense'
    GROUP BY t.category_id
  `).all();

  const trend = db.prepare(`
    SELECT date, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    GROUP BY date
    ORDER BY date ASC
  `).all();

  const recent = db.prepare(`
    SELECT t.id, t.date, t.description, t.amount, t.type, c.name AS category
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ORDER BY t.date DESC, t.id DESC
    LIMIT 5
  `).all();

  return {
    totalExpense: totals.totalExpense || 0,
    totalIncome: totals.totalIncome || 0,
    savings,
    byCategory,
    trend,
    recent
  };
}

function getTransactions(filters) {
  let query = `
    SELECT t.id, t.date, t.description, t.amount, t.type, t.category_id, c.name AS category
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE 1 = 1
  `;
  const params = [];

  if (filters.search) {
    query += ' AND (t.description LIKE ?)';
    params.push(`%${filters.search}%`);
  }

  if (filters.categoryId) {
    query += ' AND t.category_id = ?';
    params.push(filters.categoryId);
  }

  if (filters.startDate) {
    query += ' AND t.date >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND t.date <= ?';
    params.push(filters.endDate);
  }

  query += ' ORDER BY t.date DESC, t.id DESC';

  return db.prepare(query).all(...params);
}

function updateTransaction({ id, amount, categoryId }) {
  const stmt = db.prepare(`
    UPDATE transactions
    SET amount = ?, category_id = ?
    WHERE id = ?
  `);
  stmt.run(amount, categoryId, id);
  return { success: true };
}

function getCategoriesWithTotals() {
  const categories = db.prepare(`
    SELECT c.id, c.name, c.color,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total
    FROM categories c
    LEFT JOIN transactions t ON t.category_id = c.id
    GROUP BY c.id
    ORDER BY total DESC
  `).all();
  return categories;
}

function getSettingsEmail() {
  return getSetting('email');
}

function setSettingsEmail(email) {
  return setSetting('email', email);
}

module.exports = {
  initDatabase,
  getDashboardSummary,
  getTransactions,
  updateTransaction,
  getCategoriesWithTotals,
  getSettingsEmail,
  setSettingsEmail,
  getSetting,
  setSetting
};

