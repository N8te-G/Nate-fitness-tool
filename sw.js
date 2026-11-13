// Service worker for Nate's HeartMatch: lets the installed app open offline.
// - The app page is network-first, so updates show up as soon as you're online.
// - Libraries (stored in ./vendor) and web fonts are served from cache and refreshed in the background.
// - Map tiles and anything else are left to the network.
const CACHE = 'nft-v9';

const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './icon.svg',
    './vendor/tailwind.css', './vendor/chart.umd.min.js',
    './vendor/leaflet/leaflet.css', './vendor/leaflet/leaflet.js',
    './vendor/leaflet/images/layers.png', './vendor/leaflet/images/layers-2x.png', './vendor/leaflet/images/marker-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await cache.addAll(APP_SHELL);
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('nft-') && k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // App page: network first, cached copy when offline
    if (req.mode === 'navigate' && url.origin === self.location.origin) {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(req);
                const cache = await caches.open(CACHE);
                cache.put('./index.html', fresh.clone());
                return fresh;
            } catch (_) {
                return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
            }
        })());
        return;
    }

    // Own files and web fonts: cache first, refresh in the background
    if (url.origin === self.location.origin || FONT_HOSTS.includes(url.hostname)) {
        event.respondWith((async () => {
            const cache = await caches.open(CACHE);
            const cached = await caches.match(req);
            const refresh = fetch(req).then(res => {
                if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
                return res;
            }).catch(() => null);
            if (cached) {
                event.waitUntil(refresh);
                return cached;
            }
            return (await refresh) || Response.error();
        })());
    }
    // Everything else (map tiles etc.) goes straight to the network
});
