// Offline: everything is served from the cache, and refreshed in the background when online.
// Bump VERSION when files are added, so the new list is cached.
const VERSION = 'v2';
const FILES = ['./', 'index.html', 'units/b3.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response('בלי קליטה, והקובץ הזה עוד לא נשמר.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
