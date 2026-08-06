# RxLookup

Offline-first Malaysian drug formulary lookup — search drugs by generic name, synonyms, or brand name.

Built with React, TypeScript, Vite, and Tailwind CSS. Drug data is bundled at build time and cached in IndexedDB so the app keeps working offline after the first load.

## Features

- Instant client-side search across generic name, brand name, and synonyms
- Drug detail pages with indications, dosages, contraindications, interactions, precautions, and more
- Offline-first: data is cached in IndexedDB after first load, with a "Reset Database" option to force a refresh
- Light / dark / system theme
- Installable as a PWA (web app manifest)

## Getting started

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

Output goes to `dist/`. The build script also copies `index.html` to `404.html` so client-side routes work on static hosts like GitHub Pages.

## Data

The drug formulary lives at [`public/data/initial-drugs.json`](public/data/initial-drugs.json) — a single JSON file with a `metadata` block and a `drugs` array. Each drug record looks like:

```json
{
  "id": "string",
  "genericName": "string",
  "brandName": "string | null",
  "synonyms": "HTML string | null",
  "prescriberCategory": "string | null",
  "indications": "HTML string | null",
  "dosages": "HTML string | null",
  "contraindications": "HTML string | null",
  "interactions": "HTML string | null",
  "precautions": "HTML string | null",
  "adverseReactions": "HTML string | null",
  "prescribingRestrictions": "HTML string | null",
  "methodOfPurchase": "string | null",
  "notes": "HTML string | null",
  "lastUpdated": "ISO date string"
}
```

To add or update drugs, edit this file (or replace it with a generated export) and bump `metadata.generatedAt`. Rich-text fields are sanitized with DOMPurify before rendering, so basic HTML (`<p>`, `<ul>`, `<strong>`, etc.) is safe to include.

## Deploying to GitHub Pages

A workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys the site to GitHub Pages on every push to `main`.

1. In the repo settings, set **Settings → Pages → Source** to "GitHub Actions".
2. Push to `main` — the site will be published at `https://<owner>.github.io/<repo>/`.

To use a custom domain instead, add a `public/CNAME` file with your domain and update `VITE_BASE_PATH` in the workflow (or remove it to serve from `/`).

## Tech stack

- [Vite](https://vite.dev) + React + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [react-router-dom](https://reactrouter.com) for client-side routing
- [idb](https://github.com/jakearchibald/idb) for IndexedDB storage
- [DOMPurify](https://github.com/cure53/DOMPurify) for sanitizing rich-text drug data
