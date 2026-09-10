# Thought Records

A private, mobile-first web app for CBT thought records (cognitive restructuring
worksheets). Built to be used on a phone in the moment: capture the situation,
feelings and thoughts in ~30 seconds, then finish the restructuring steps when
there's a quieter moment.

Everything is stored on-device in the browser (IndexedDB). There is no server,
no account, no analytics — nothing ever leaves the phone. Backups are manual
JSON exports from Settings.

## Stack

| Layer | Choice | Used for |
|---|---|---|
| UI | React 19 + TypeScript | components and screens |
| Build | Vite + `@vitejs/plugin-react` | dev server, production bundle |
| PWA | `vite-plugin-pwa` (Workbox) + `@vite-pwa/assets-generator` | service worker, offline caching, icons/manifest |
| Storage | Dexie 4 (`dexie-react-hooks` for live queries) | IndexedDB records, custom emotions, settings |
| Routing | React Router 7, `HashRouter` | hash-based routes so GitHub Pages needs no server rewrites |
| Styling | Tailwind CSS 3 (+ PostCSS/autoprefixer) | theming via CSS variables, dark mode |
| Motion | framer-motion | step transitions, sheets — respects reduced motion |
| Fonts | Fraunces + Inter (`@fontsource-variable`) | display and body type, self-hosted |
| Tests | Vitest + React Testing Library + `fake-indexeddb` + jsdom | unit, component and flow tests |

Two worksheet formats are supported: **Realistic Thinking** (the default — a
1:1 copy of a therapist's paper worksheet) and **Classic** (the original
8-step flow), selectable under Settings → Worksheet. Each record permanently
keeps the format it was created with (see `docs/adr/0001`).

## Development

```bash
npm install
npm run dev        # local dev server
npx vitest run     # tests
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run icons      # regenerate PWA icons from public/logo.svg
```

## Deploying to GitHub Pages

Deploys are automatic: `.github/workflows/deploy.yml` builds the app and
publishes `dist/` on every push to `main` (Pages source must be set to
"GitHub Actions" in the repo settings). The site is configured for
`https://<user>.github.io/CRWebApp/` (`base: '/CRWebApp/'` in
`vite.config.ts`, hash-based routing). A `.nojekyll` file keeps the legacy
Jekyll pipeline from ever processing the repo's markdown.

On the phone, open the site in Safari → Share → **Add to Home Screen**.
Installing matters: home-screen apps are exempt from Safari's storage
eviction, and the app runs full-screen and offline.

## Design notes

- Calm, minimal, low-stimulation: four selectable themes in Settings (Sage,
  Dusk, Ocean, Sand — all muted, calming palettes), automatic dark mode, one
  question per screen in the wizard.
- Two-phase flow: a quick capture saves an "open" record that waits on the home
  screen; completing the evidence/reframe steps closes it. Naming the thinking
  pattern (catastrophising etc.) is an optional step, off by default — enable
  it under Settings → Preferences.
- Thumb-first home screen: the New record button is pinned to the bottom of the
  screen and the feed runs oldest to newest, so the newest records and the
  button both sit in the thumb zone.
- Animations respect the system "reduce motion" setting.
