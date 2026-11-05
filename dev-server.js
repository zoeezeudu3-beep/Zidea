const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const publicFiles = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/arcade.css', ['arcade.css', 'text/css; charset=utf-8']],
  ['/zidea-home.css', ['zidea-home.css', 'text/css; charset=utf-8']],
  ['/arcade.js', ['arcade.js', 'text/javascript; charset=utf-8']],
  ['/zidea-kb.js', ['zidea-kb.js', 'text/javascript; charset=utf-8']],
  ['/service-worker.js', ['service-worker.js', 'text/javascript; charset=utf-8']]
]);
const publicImages = new Set([
  'dashboard-avatar.png',
  'landing-hero-art.png',
  'landing-share-ideas.png',
  'landing-play-games.png',
  'landing-chat-call.png'
]);

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Invalid URL');
    return;
  }

  if (pathname.startsWith('/api/')) {
    response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({
      error: 'The local preview serves the app shell only. Sign-in and synced features require the ZIDEA API and an internet connection.'
    }));
    return;
  }

  let filename;
  let contentType;
  const publicFile = publicFiles.get(pathname);
  if (publicFile) {
    [filename, contentType] = publicFile;
  } else if (pathname.startsWith('/assets/')) {
    const imageName = path.basename(pathname);
    if (!publicImages.has(imageName) || pathname !== `/assets/${imageName}`) {
      response.writeHead(404).end('Not found');
      return;
    }
    filename = path.join('assets', imageName);
    contentType = 'image/png';
  } else {
    response.writeHead(404).end('Not found');
    return;
  }

  const absolutePath = path.join(root, filename);
  fs.readFile(absolutePath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Could not read the requested app file');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': filename === 'service-worker.js' ? 'no-cache' : 'no-store'
    });
    response.end(contents);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Zidea local preview: http://localhost:${port}`);
  console.log('Offline app-shell preview only; sign-in and synced features need the Zidea API.');
});
