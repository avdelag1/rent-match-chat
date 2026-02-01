import { createServer } from 'http';
import { readFileSync, existsSync, statSync, createReadStream } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;
const PORT = process.env.PORT || 3000;
const DIST = join(__dirname, 'dist');

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css',
  '.js':    'application/javascript',
  '.json':  'application/json',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.gif':   'image/gif',
  '.svg':   'image/svg+xml',
  '.webp':  'image/webp',
  '.ico':   'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
  '.ttf':   'font/ttf',
};

createServer((req, res) => {
  let filePath = join(DIST, decodeURIComponent(req.url));

  // If path doesn't exist or is a directory, fall back to index.html (SPA routing)
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(DIST, 'index.html');
  }

  const contentType = MIME[extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
