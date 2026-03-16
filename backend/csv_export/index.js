const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportTransactionsCsv({ userDataPath, outputPath }) {
  const dbPath = path.join(userDataPath || process.cwd(), 'finance.db');
  const db = new Database(dbPath, { readonly: true });

  const rows = db.prepare(`
    SELECT t.date as date,
           COALESCE(NULLIF(t.description, ''), '-') as merchant,
           t.amount as amount,
           COALESCE(c.name, '') as category
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ORDER BY t.date DESC, t.id DESC
  `).all();

  const target = outputPath || path.join(process.cwd(), 'database', 'transactions.csv');
  const dir = path.dirname(target);
  fs.mkdirSync(dir, { recursive: true });

  const header = 'date,merchant,amount,category\n';
  const lines = rows.map((r) => {
    return [
      escapeCsv(r.date),
      escapeCsv(r.merchant),
      escapeCsv(r.amount),
      escapeCsv(r.category)
    ].join(',');
  });

  fs.writeFileSync(target, header + lines.join('\n') + '\n', 'utf8');
  db.close();
  return { outputPath: target, rowCount: rows.length };
}

module.exports = {
  exportTransactionsCsv
};

