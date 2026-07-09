const CACHE_NAME = 'neurosync-chromatic-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './sincronizador.html',
    './css/style.css',
    './js/chromatic-bg.js',
    './js/auth.js',
    './js/audio-engine.js',
    './icon.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // For local assets, cache-first with network fallback
    e.respondWith(
        caches.match(e.request).then((cached) => {
            return cached || fetch(e.request);
        }).catch(() => {
            if (e.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});
