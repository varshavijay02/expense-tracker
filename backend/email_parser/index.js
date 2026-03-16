function firstMatch(regex, text) {
  const m = regex.exec(text);
  return m ? m[1] : null;
}

function normalizeMerchant(raw) {
  if (!raw) return null;
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s&.'-]/g, '')
    .trim();
}

function parseAmount(bodyText) {
  if (!bodyText) return null;
  const amt = firstMatch(/INR\s*([\d,]+(?:\.\d+)?)/i, bodyText);
  if (!amt) return null;
  const n = Number(String(amt).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function parseMerchant(bodyText) {
  if (!bodyText) return null;

  // Examples:
  // "INR 450 spent at SWIGGY"
  // "UPI txn of INR 230 to UBER"
  // Allow mixed case and merchant names with spaces.
  const at = firstMatch(/\bspent\s+at\s+([A-Z0-9 &.'-]{2,})\b/i, bodyText);
  if (at) return normalizeMerchant(at);

  const to = firstMatch(/\bto\s+([A-Z0-9 &.'-]{2,})\b/i, bodyText);
  if (to) return normalizeMerchant(to);

  return null;
}

function parseDate(bodyText) {
  if (!bodyText) return null;
  // Example regex requested: (\d{2}-\w+-\d{4}) e.g. 12-Mar-2026
  const d = firstMatch(/(\d{2}-[A-Za-z]{3}-\d{4})/, bodyText);
  return d || null;
}

function toIsoDateFromEmail(internalDateMs) {
  if (!internalDateMs) return null;
  const d = new Date(internalDateMs);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function toIsoDateFromPattern(dateStr) {
  if (!dateStr) return null;
  // "12-Mar-2026" -> ISO "2026-03-12"
  const m = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(dateStr.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const mon = m[2].toLowerCase();
  const year = Number(m[3]);
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  if (!(mon in months)) return null;
  const d = new Date(Date.UTC(year, months[mon], day));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function parseTransactionEmail({ bodyText, internalDate }) {
  const amount = parseAmount(bodyText);
  const merchant = parseMerchant(bodyText);
  const dateRaw = parseDate(bodyText);
  const date = toIsoDateFromPattern(dateRaw) || toIsoDateFromEmail(internalDate);

  return {
    amount,
    merchant,
    date,
    dateRaw,
    bodyText: bodyText || ''
  };
}

module.exports = {
  parseTransactionEmail
};

