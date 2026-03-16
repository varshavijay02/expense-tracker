const http = require('http');
const { google } = require('googleapis');

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

function base64UrlDecode(input) {
  if (!input) return '';
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64').toString('utf8');
}

function pickHeader(headers, name) {
  const found = (headers || []).find((h) => (h.name || '').toLowerCase() === name.toLowerCase());
  return found ? found.value : '';
}

function extractBodyText(payload) {
  if (!payload) return '';

  // Prefer text/plain when available, otherwise fall back to first body found.
  const stack = [payload];
  const candidates = [];

  while (stack.length) {
    const part = stack.pop();
    const mimeType = part.mimeType || '';
    const bodyData = part.body && part.body.data ? part.body.data : null;

    if (bodyData) {
      candidates.push({ mimeType, text: base64UrlDecode(bodyData) });
    }

    const parts = part.parts || [];
    for (const p of parts) stack.push(p);
  }

  const plain = candidates.find((c) => c.mimeType === 'text/plain');
  if (plain && plain.text) return plain.text;

  const any = candidates.find((c) => c.text);
  return any ? any.text : '';
}

async function authenticateOAuth2({ clientId, clientSecret, redirectPort, storedTokenJson, openExternalUrl }) {
  if (!clientId || !clientSecret) {
    throw new Error('Missing Gmail OAuth2 credentials. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.');
  }

  const port = redirectPort || 42813;
  const redirectUri = `http://localhost:${port}/oauth2callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  if (storedTokenJson) {
    try {
      oauth2Client.setCredentials(JSON.parse(storedTokenJson));
      return { oauth2Client, tokenJson: storedTokenJson, didAuth: false };
    } catch {
      // ignore bad token; fall through to interactive auth
    }
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [GMAIL_SCOPE],
    prompt: 'consent'
  });

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, redirectUri);
        if (url.pathname !== '/oauth2callback') {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const authCode = url.searchParams.get('code');
        if (!authCode) {
          res.writeHead(400);
          res.end('Missing code');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h3>Gmail connected. You can close this window.</h3>');
        server.close();
        resolve(authCode);
      } catch (e) {
        reject(e);
      }
    });

    server.on('error', reject);
    server.listen(port, () => {
      if (typeof openExternalUrl === 'function') openExternalUrl(authUrl);
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  return { oauth2Client, tokenJson: JSON.stringify(tokens), didAuth: true };
}

async function fetchRecentTransactionEmails({ oauth2Client, maxResults = 25 }) {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Gmail search query avoids fetching unrelated emails.
  const q = '(subject:"UPI txn" OR subject:"Account update for your HDFC Bank A/c")';

  const list = await gmail.users.messages.list({
    userId: 'me',
    q,
    maxResults
  });

  const messages = list.data.messages || [];

  const results = [];
  for (const m of messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: m.id,
      format: 'full'
    });

    const payload = full.data.payload;
    const headers = payload ? payload.headers : [];
    const subject = pickHeader(headers, 'Subject');
    const bodyText = extractBodyText(payload);

    // Extra guard: subject contains required phrases.
    const subj = (subject || '').toLowerCase();
    const ok =
      subj.includes('upi txn') ||
      subj.includes('account update for your hdfc bank a/c');
    if (!ok) continue;

    results.push({
      id: full.data.id,
      threadId: full.data.threadId,
      internalDate: full.data.internalDate ? Number(full.data.internalDate) : null,
      subject,
      bodyText
    });
  }

  return results;
}

module.exports = {
  GMAIL_SCOPE,
  authenticateOAuth2,
  fetchRecentTransactionEmails
};

