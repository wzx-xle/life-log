# LifeLog

Track your local dining and lifestyle experiences.

![version](https://img.shields.io/badge/version-1.0.1-orange)

LifeLog is a **local-first** lifestyle journal PWA that helps you record places you've visited, experiences, ratings, and photos. All data stays in your browser — no sign-up, no internet required.

## Features

- **Experience Reviews** — Ratings, notes, spending, itemized bills, photos, and tags. Quick mode and full mode supported.
- **Place Management** — Categories (6 presets + custom), address, phone, business hours, Amap (Gaode) map location picker.
- **Statistics** — Spending trends, category breakdown pie chart, rating distribution bar chart, top 5 most-visited places.
- **Passcode Lock** — Web Crypto API SHA-256 salted hash with auto-lock to protect your private data.
- **Footprint Map** — Amap (Gaode) integration showing all your places on an immersive map.
- **Import / Export** — Full JSON backup and restore.
- **PWA** — Installable to home screen, works offline.
- **Mobile Optimized** — PostCSS px→vw auto-scaling with Vant 4 component library.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript (strict mode) |
| Routing | Vue Router (hash mode) |
| State | Pinia |
| UI | Vant 4 (auto-import on demand) |
| Database | IndexedDB via Dexie.js |
| Charts | ECharts 5 |
| Map | Amap JSAPI 2.0 |
| Build | Vite + vue-tsc |
| Testing | Vitest + @vue/test-utils |
| PWA | vite-plugin-pwa |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Run tests
npm run test

# Build for production
npm run build

# Deploy via FTP
npm run deploy
```

### Environment Variables

Create `.env.production`:

```
VITE_AMAP_KEY=your-amap-key
```

Create `.env.ftp` (for FTP deployment):

```
FTP_HOST=
FTP_USER=
FTP_PASSWORD=
```

## Project Structure

```
src/
├── assets/styles/     # CSS variables, global styles
├── components/        # Shared components
│   ├── common/        # TabBar and other generic components
│   ├── place/         # Place-related components
│   ├── review/        # Review-related components
│   └── stats/         # Chart components
├── composables/       # Composables (useDatabase, useLock, useCategoryDisplay)
├── db/                # Dexie database definition & initialization
├── router/            # Route configuration
├── stores/            # Pinia stores
├── types/             # TypeScript type definitions
├── utils/             # Utilities (export/import)
└── views/             # Page components
```

## Data Model

The app is built around two core entities:

- **Place** — Name, category, address, coordinates, phone, tags, photos
- **Review** — Linked to a place, date, ratings (service / ambiance / value / overall), notes, spending, itemized bill, photos

All data is stored in the browser's IndexedDB. Photos are compressed via Compressor.js and stored as base64. A single salt + SHA-256 hash is used for passcode storage, with the salt kept in localStorage.

## Architecture Decisions

- **Local-first** — No server dependency. All data stays in the user's browser.
- **Hash routing** — `createWebHashHistory` for compatibility with static file hosting.
- **PostCSS px→vw** — Auto-conversion based on a 320px viewport. px values in CSS variables are also converted.
- **Passcode security** — Passcodes are never stored in plain text; only the salted hash is retained for verification.

## License

MIT
