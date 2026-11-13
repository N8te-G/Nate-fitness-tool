// Service worker for Nate's HeartMatch: lets the installed app open offline.
// - The app's own files (page, stylesheet, libraries, icons) are network-first: when online you always
//   get the current version, so the page and its stylesheet can never get out of step after an update.
//   Saved copies are only used when offline.
// - Web fonts are cache-first (they never change).
// - Map tiles and anything else are left to the network.
const CACHE = 'nft-v18';

const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './icon.svg',
    './vendor/tailwind.css', './vendor/chart.umd.min.js',
    './vendor/leaflet/leaflet.css', './vendor/leaflet/leaflet.js',
    './vendor/leaflet/images/layers.png', './vendor/leaflet/images/layers-2x.png', './vendor/leaflet/images/marker-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        // cache: 'reload' skips the browser's HTTP cache so we never save a stale copy
        await cache.addAll(APP_SHELL.map(url => new Request(url, { cache: 'reload' })));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        // Remove every older cache, including the page's legacy 'nates-fitness-tool-v2' cache
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

// Network first (revalidating with the server), falling back to this worker's saved copy when offline
async function networkFirst(req, fallbackKey) {
    const cache = await caches.open(CACHE);
    try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        if (fresh && fresh.ok) cache.put(fallbackKey || req, fresh.clone());
        return fresh;
    } catch (_) {
        return (await cache.match(fallbackKey || req)) ||
            (await cache.match(req, { ignoreSearch: true })) ||
            Response.error();
    }
}

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    if (url.origin === self.location.origin) {
        // The app page is saved under one key so it opens offline from any start URL
        event.respondWith(networkFirst(req, req.mode === 'navigate' ? './index.html' : undefined));
        return;
    }

    if (FONT_HOSTS.includes(url.hostname)) {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE);
            const cached = await cache.match(req);
            if (cached) return cached;
            try {
                const res = await fetch(req);
                if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
                return res;
            } catch (_) {
                return Response.error();
            }
        })());
    }
    // Everything else (map tiles etc.) goes straight to the network
});
