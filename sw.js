// Service worker for Nate's Fitness Tool: lets the installed app open offline.
// - The app page is network-first, so updates show up as soon as you're online.
// - Libraries and fonts from CDNs are served from cache and refreshed in the background.
// - Map tiles and anything else are left to the network.
const CACHE = 'nft-v2';

const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './icon.svg'];
const CDN_LIBS = [
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/lucide@1.62.0'
];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await cache.addAll(APP_SHELL);
        // CDN files are cached best-effort; a failure here must not block install
        await Promise.allSettled(CDN_LIBS.map(async url => {
            const res = await fetch(new Request(url, { mode: 'no-cors' }));
            await cache.put(url, res);
        }));
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

    // Own files and CDN libraries: cache first, refresh in the background
    if (url.origin === self.location.origin || CDN_HOSTS.includes(url.hostname)) {
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
