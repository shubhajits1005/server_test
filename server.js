const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_FILE = path.join(__dirname, 'data.json');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

/* ---- Read/write data.json ---- */
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return { news: [], videos: [], credentials: { username: 'admin', password: 'admin123' }, prefs: { linkTarget: '_blank' } };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/* ---- Parse JSON body ---- */
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve(null); }
    });
  });
}

/* ---- Handle API routes ---- */
async function handleAPI(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'news']
  if (parts.length < 2 || parts[0] !== 'api') return false;

  const resource = parts[1]; // 'news', 'videos', 'credentials', 'prefs'
  const data = readData();

  if (req.method === 'GET') {
    if (resource === 'news')           return sendJSON(res, data.news);
    if (resource === 'videos')         return sendJSON(res, data.videos);
    if (resource === 'credentials')    return sendJSON(res, data.credentials);
    if (resource === 'prefs')          return sendJSON(res, data.prefs);
    return sendJSON(res, { error: 'unknown resource' }, 404);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    if (body === null) return sendJSON(res, { error: 'invalid JSON' }, 400);

    if (resource === 'news') {
      data.news = body;
      writeData(data);
      return sendJSON(res, { ok: true });
    }
    if (resource === 'videos') {
      data.videos = body;
      writeData(data);
      return sendJSON(res, { ok: true });
    }
    if (resource === 'credentials') {
      data.credentials = body;
      writeData(data);
      return sendJSON(res, { ok: true });
    }
    if (resource === 'prefs') {
      data.prefs = body;
      writeData(data);
      return sendJSON(res, { ok: true });
    }
    return sendJSON(res, { error: 'unknown resource' }, 404);
  }

  return sendJSON(res, { error: 'method not allowed' }, 405);
}

function sendJSON(res, obj, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

/* ---- Serve static files ---- */
function serveStatic(req, res) {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/* ---- Start server ---- */
const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    await handleAPI(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Short News server running at http://localhost:${PORT}`);
});
