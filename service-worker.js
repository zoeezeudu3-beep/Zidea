const CACHE_NAME = 'zidea-shell-v2';
const APP_FILES = [
  '',
  'index.html',
  'arcade.css',
  'zidea-home.css',
  'arcade.js',
  'zidea-kb.js',
  'assets/dashboard-avatar.png',
  'assets/landing-hero-art.png',
  'assets/landing-share-ideas.png',
  'assets/landing-play-games.png',
  'assets/landing-chat-call.png'
].map(file => new URL(file, self.registration.scope).href);
const APP_SHELL_URL = new URL('index.html', self.registration.scope).href;
const API_PATH = new URL('api/', self.registration.scope).pathname;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('zidea-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname.startsWith(API_PATH)) return;

  if (url.origin !== self.location.origin &&
      url.hostname === 'www.gstatic.com' &&
      url.pathname.startsWith('/firebasejs/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        await cache.put(request, response.clone());
      }
      return response;
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const appShell = await cache.match(APP_SHELL_URL);
        if (appShell) return appShell;
      }
      throw error;
    }
  })());
});
