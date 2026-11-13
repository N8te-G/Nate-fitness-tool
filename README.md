# Nate's HeartMatch

Compare heart rate, GPS tracks and elevation from several TCX/GPX recordings of the same workout.

**Open the app:** https://n8te-g.github.io/Nate-fitness-tool/

## Install on Android

1. Open the link above in Chrome.
2. Tap the ⋮ menu → **Install app** (or **Add to Home screen** → **Install**).
3. It appears in your app drawer with its own icon and opens full screen.

Updates arrive automatically the next time you open the app with a connection.
After the first visit it also opens offline; only map tiles need internet.

Your activity files never leave your device — everything is processed in the browser.

## Standalone file (Golden Master)

`Nates_HeartMatch_Golden_Master.html` is a known-good, fully self-contained copy of the app in a
single file: download it and open it directly on your phone or computer. Its styles, libraries and
icons are built in, so it works without internet (only map backgrounds need a connection).

It is only updated on purpose. To rebuild it from the current `index.html`:

```
npm run build:golden
```

## Development notes

The app is plain HTML with its libraries stored in `vendor/` (no outside CDNs), so it works in
browsers that block third-party scripts (e.g. Brave Shields) and fully offline once installed.

Icons are built into `index.html` (only the ~30 Lucide icons the app uses; add new ones to the `ICONS` list there).
Styling uses a prebuilt Tailwind stylesheet (`vendor/tailwind.css`, linked with a content-hash `?v=` so updates never mix
an old stylesheet with a new page). After adding or changing
Tailwind classes in `index.html`, rebuild it:

```
npm install
npm run build:css
```

The service worker (`sw.js`) is network-first for the app's own files, so phones always get the latest version when
online and fall back to saved copies offline. Bump `CACHE` in `sw.js` when you add new files that should work offline.
