// Offline-Speicher für Morse-Blasen.
// Bei einer neuen Version des Spiels VERSION hochzählen, damit alle Geräte die Dateien neu laden.
const VERSION = 'v1';
const CACHE = 'morse-blasen-' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
               './icon-maskable-512.png', './apple-touch-icon.png', './favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('morse-blasen-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Sofort aus dem Speicher laden (funktioniert offline), im Hintergrund nach Updates sehen.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const update = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) { e.waitUntil(update); return cached; }
    return update;
  })());
});
