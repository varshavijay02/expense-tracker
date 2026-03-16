const path = require('path');
const Database = require('better-sqlite3');

function ensureSchema(db) {
  // Add source_email_id for dedupe if it doesn't exist.
  const cols = db.prepare(`PRAGMA table_info(transactions)`).all();
  const hasSource = cols.some((c) => c.name === 'source_email_id');
  if (!hasSource) {
    db.exec(`ALTER TABLE transactions ADD COLUMN source_email_id TEXT;`);
  }
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_source_email_id ON transactions(source_email_id);`);
}

function openDb(userDataPath) {
  const dbPath = path.join(userDataPath || process.cwd(), 'finance.db');
  const db = new Database(dbPath);
  ensureSchema(db);
  return db;
}

function normalizeExtracted({ date, merchant, amount, bodyText }) {
  return {
    date,
    merchant: merchant || 'Unknown',
    description: merchant ? `${merchant}` : 'Email transaction',
    amount,
    bodyText: bodyText || ''
  };
}

function insertFromEmails({ userDataPath, extractedRows }) {
  const db = openDb(userDataPath);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO transactions (date, description, category_id, amount, type, source_email_id)
    VALUES (?, ?, NULL, ?, 'expense', ?)
  `);

  const tx = db.transaction((rows) => {
    let inserted = 0;
    for (const row of rows) {
      if (!row || !row.sourceEmailId) continue;
      if (!row.date || !row.amount) continue;
      const norm = normalizeExtracted(row);
      const info = insert.run(norm.date, norm.description, norm.amount, row.sourceEmailId);
      if (info.changes > 0) inserted += 1;
    }
    return inserted;
  });

  const insertedCount = tx(extractedRows);
  db.close();
  return { insertedCount };
}

module.exports = {
  insertFromEmails,
  normalizeExtracted
};

