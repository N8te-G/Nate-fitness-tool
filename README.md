# Nate's Fitness Tool

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

`Nates_Fitness_Tool_Golden_Master.html` is the single-file version of the app. Download it and open it
directly from your phone or computer — no install or website needed (an internet connection is still
needed the first time to load its libraries and map tiles). It is a frozen known-good snapshot; the
live app is `index.html`.

## Development notes

The app is plain HTML with its libraries stored in `vendor/` (no outside CDNs), so it works in
browsers that block third-party scripts (e.g. Brave Shields) and fully offline once installed.

Styling uses a prebuilt Tailwind stylesheet (`vendor/tailwind.css`). After adding or changing
Tailwind classes in `index.html`, rebuild it:

```
npm install
npm run build:css
```

If you change files the installed app caches, bump `CACHE` in `sw.js` so phones pick them up.
