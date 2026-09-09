# Thought Records

A private, mobile-first web app for CBT thought records (cognitive restructuring
worksheets). Built to be used on a phone in the moment: capture the situation,
feelings and thoughts in ~30 seconds, then finish the restructuring steps when
there's a quieter moment.

Everything is stored on-device in the browser (IndexedDB). There is no server,
no account, no analytics — nothing ever leaves the phone. Backups are manual
JSON exports from Settings.

## Development

```bash
npm install
npm run dev        # local dev server
npx vitest run     # tests
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run icons      # regenerate PWA icons from public/logo.svg
```

## Deploying to GitHub Pages (manual)

The app is a static site configured for `https://<user>.github.io/CRWebApp/`
(`base: '/CRWebApp/'` in `vite.config.ts`, hash-based routing).

1. `npm run build`
2. Publish `dist/` to GitHub Pages (e.g. push `dist` to a `gh-pages` branch, or
   use a Pages workflow that runs the build).
3. On the phone, open the site in Safari → Share → **Add to Home Screen**.
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
