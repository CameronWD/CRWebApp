# Thought Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A private, local-only, mobile-first PWA for completing CBT thought records (8-step cognitive restructuring worksheets) on an iPhone, with a two-phase capture flow, calm sophisticated design, and JSON export/import backup.

**Architecture:** A static React SPA with no backend — all data lives in IndexedDB (via Dexie) on the device. A hash-routed set of screens around one central "wizard" component that walks through the worksheet steps one screen at a time, auto-saving on every step transition. PWA installability (vite-plugin-pwa) protects storage from Safari eviction.

**Tech Stack:** Vite, React 18, TypeScript (strict), Tailwind CSS v3.4, react-router-dom v6 (HashRouter), Dexie 4 + dexie-react-hooks, framer-motion, vite-plugin-pwa, Vitest + Testing Library + fake-indexeddb.

## Global Constraints

- Work happens in `/work` on the git branch `thought-records-app` (branch off `planning`). NEVER commit to `main`/`master`. NEVER push. NEVER deploy.
- Node 24 / npm 11 are installed. All commands run from `/work`.
- Tailwind MUST be v3.4.x (`tailwindcss@^3.4`). Do NOT install Tailwind v4 — its config format is incompatible with this plan.
- Routing MUST use `HashRouter` (GitHub Pages has no server rewrites). Vite `base` is `'/CRWebApp/'`.
- No runtime network requests of any kind: no analytics, no CDN scripts, no remote fonts (fonts are npm-bundled via `@fontsource-variable/*`).
- All framer-motion animation must respect reduced motion (`useReducedMotion()` where a component animates position; `whileTap` scale effects are exempt).
- Copy tone is conversational and warm, never clinical. Use the exact UI copy given in each task — do not invent alternative wording.
- Dark mode uses Tailwind's `media` strategy — every colored element needs a `dark:` variant per the token table in Task 1.
- Run tests with `npx vitest run` (never bare `vitest`, which watches and hangs).
- TypeScript is strict; `npm run build` runs `tsc --noEmit` and must stay green.
- Timestamps are ISO strings from `new Date().toISOString()`. IDs are Dexie auto-increment numbers.

## File Map

| File | Responsibility |
|---|---|
| `index.html` | Shell, viewport/theme meta |
| `vite.config.ts` | Vite + Vitest config (+ PWA plugin from Task 11) |
| `tailwind.config.js` | Design tokens (palette, fonts) |
| `src/main.tsx` | Entry: fonts, css, mount |
| `src/App.tsx` | HashRouter + routes + page layout |
| `src/index.css` | Tailwind directives + body base styles |
| `src/test/setup.ts` | jest-dom, fake-indexeddb, matchMedia polyfill |
| `src/lib/types.ts` | Domain types (ThoughtRecord etc.) |
| `src/lib/constants.ts` | Default emotions, distortion list |
| `src/lib/db.ts` | Dexie database definition |
| `src/lib/repository.ts` | All record/emotion/settings persistence functions |
| `src/lib/backup.ts` | Export/import JSON backup + export-nudge rule |
| `src/lib/wizard.ts` | Wizard step machine: reducer, step order, validation |
| `src/lib/format.ts` | Date formatting helpers |
| `src/lib/install.ts` | iOS install-nudge predicate |
| `src/components/ui.tsx` | Primitives: Button, Chip, IntensitySlider, ProgressDots, StepShell, AutoTextArea, ConfirmSheet |
| `src/components/RecordCard.tsx` | Record list card + EmotionSummary |
| `src/components/ExportNudge.tsx` | Home-screen backup reminder banner |
| `src/components/InstallNudge.tsx` | iOS Add-to-Home-Screen banner |
| `src/screens/HomeScreen.tsx` | Capture-first home |
| `src/screens/WizardScreen.tsx` | Route wrapper: loads record, picks mode, renders Wizard |
| `src/screens/Wizard.tsx` | The wizard itself: header, step switch, footer, autosave |
| `src/screens/steps/SituationStep.tsx` | Step 1 |
| `src/screens/steps/EmotionsStep.tsx` | Step 2 (chips + sliders + custom emotion) |
| `src/screens/steps/ThoughtsStep.tsx` | Step 3 (thoughts + hot thought) |
| `src/screens/steps/ForkStep.tsx` | Save-for-later / keep-going fork |
| `src/screens/steps/EvidenceStep.tsx` | Steps 4+5 (shared, `kind` prop) |
| `src/screens/steps/DistortionsStep.tsx` | Step 6 |
| `src/screens/steps/BalancedStep.tsx` | Step 7 |
| `src/screens/steps/RerateStep.tsx` | Step 8 |
| `src/screens/steps/DoneStep.tsx` | Completion summary with emotion drops |
| `src/screens/RecordListScreen.tsx` | All records |
| `src/screens/RecordDetailScreen.tsx` | Full record view, edit/continue/delete |
| `src/screens/SettingsScreen.tsx` | Export, import, custom emotions |
| `public/logo.svg` | App icon source (Task 11) |
| `pwa-assets.config.ts` | Icon generation config (Task 11) |

---

### Task 1: Project scaffold, Tailwind theme, test harness

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `src/test/setup.ts`, `.gitignore`
- Test: `src/test/app.test.tsx`

**Interfaces:**
- Produces: the design tokens every later task uses as Tailwind classes: colors `paper, surface, ink, mist, sage, sage-deep, sage-soft, blue-dusty, blue-soft, night-bg, night-surface, night-ink, night-mist`; fonts `font-display` (Fraunces) and `font-body` (Inter). Test command `npx vitest run`.

- [ ] **Step 1: Create the git branch**

```bash
cd /work && git checkout planning && git checkout -b thought-records-app
```

- [ ] **Step 2: Write config files**

`package.json`:
```json
{
  "name": "thought-records",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "icons": "pwa-assets-generator"
  }
}
```

`.gitignore`:
```
node_modules
dist
dev-dist
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#FAF8F4" />
    <title>Thought Records</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`vite.config.ts` (note: `defineConfig` comes from `vitest/config`, which passes through to Vite and types the `test` field):
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/CRWebApp/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "vite.config.ts", "pwa-assets.config.ts"]
}
```

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F4',
        surface: '#FFFFFF',
        ink: '#2F3634',
        mist: '#6B7572',
        sage: {
          DEFAULT: '#7C9885',
          deep: '#5F7D6A',
          soft: '#E5EDE7',
        },
        blue: {
          dusty: '#7A93AC',
          soft: '#E7EEF4',
        },
        night: {
          bg: '#191D1B',
          surface: '#242927',
          ink: '#E7E5E0',
          mist: '#9AA39F',
        },
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
        body: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

`postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Write source files**

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-paper text-ink font-body antialiased dark:bg-night-bg dark:text-night-ink;
}
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/App.tsx` (placeholder — replaced in Task 6):
```tsx
export default function App() {
  return <h1 className="p-6 font-display text-2xl">Thought Records</h1>;
}
```

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// jsdom has no matchMedia; framer-motion and dark-mode checks need a stub.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install react react-dom react-router-dom dexie dexie-react-hooks framer-motion @fontsource-variable/inter @fontsource-variable/fraunces
npm install -D vite @vitejs/plugin-react typescript tailwindcss@^3.4 postcss autoprefixer vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event fake-indexeddb @types/react @types/react-dom
```

- [ ] **Step 5: Write the smoke test**

`src/test/app.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the app name', () => {
  render(<App />);
  expect(screen.getByText('Thought Records')).toBeInTheDocument();
});
```

- [ ] **Step 6: Verify test and build pass**

Run: `npx vitest run`
Expected: 1 passed.

Run: `npm run build`
Expected: builds `dist/` with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite + React + Tailwind app with test harness"
```

---

### Task 2: Domain types, constants, database, repository

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`, `src/lib/db.ts`, `src/lib/repository.ts`
- Test: `src/lib/repository.test.ts`

**Interfaces:**
- Consumes: nothing (pure domain layer).
- Produces (every later task depends on these exact names):
  - Types: `ThoughtRecord { id?: number; status: 'open'|'completed'; createdAt: string; updatedAt: string; completedAt: string|null; situation: string; emotions: EmotionRating[]; thoughts: AutomaticThought[]; evidenceFor: string; evidenceAgainst: string; distortions: string[]; balancedThought: string }`, `EmotionRating { emotion: string; before: number; after: number|null }`, `AutomaticThought { text: string; isHot: boolean }`, `CustomEmotion { id?: number; name: string }`, `Setting { key: string; value: string }`, `RecordStatus`.
  - Constants: `DEFAULT_EMOTIONS: readonly string[]` (12 names), `DISTORTIONS: Distortion[]` with `Distortion { name: string; description: string }`.
  - `db` (Dexie instance with tables `records`, `customEmotions`, `settings`).
  - Repository functions: `newRecord(): ThoughtRecord`, `saveRecord(record: ThoughtRecord): Promise<number>`, `completeRecord(record: ThoughtRecord): Promise<number>`, `getRecord(id: number): Promise<ThoughtRecord | undefined>`, `deleteRecord(id: number): Promise<void>`, `listOpenRecords(): Promise<ThoughtRecord[]>`, `listCompletedRecords(): Promise<ThoughtRecord[]>`, `allEmotionNames(): Promise<string[]>`, `addCustomEmotion(name: string): Promise<void>`, `removeCustomEmotion(id: number): Promise<void>`, `listCustomEmotions(): Promise<CustomEmotion[]>`, `getSetting(key: string): Promise<string | null>`, `setSetting(key: string, value: string): Promise<void>`, `hotThought(record: ThoughtRecord): string`.

- [ ] **Step 1: Write types and constants**

`src/lib/types.ts`:
```ts
export type RecordStatus = 'open' | 'completed';

export interface EmotionRating {
  emotion: string;
  before: number; // 0-100
  after: number | null; // null until re-rated in the final step
}

export interface AutomaticThought {
  text: string;
  isHot: boolean;
}

export interface ThoughtRecord {
  id?: number;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  situation: string;
  emotions: EmotionRating[];
  thoughts: AutomaticThought[];
  evidenceFor: string;
  evidenceAgainst: string;
  distortions: string[];
  balancedThought: string;
}

export interface CustomEmotion {
  id?: number;
  name: string;
}

export interface Setting {
  key: string;
  value: string;
}
```

`src/lib/constants.ts`:
```ts
export const DEFAULT_EMOTIONS: readonly string[] = [
  'Anxious',
  'Sad',
  'Angry',
  'Ashamed',
  'Guilty',
  'Embarrassed',
  'Hopeless',
  'Frustrated',
  'Overwhelmed',
  'Lonely',
  'Afraid',
  'Hurt',
];

export interface Distortion {
  name: string;
  description: string;
}

export const DISTORTIONS: Distortion[] = [
  { name: 'All-or-nothing thinking', description: 'Black and white — if it isn’t perfect, it’s a failure.' },
  { name: 'Overgeneralisation', description: 'One bad event becomes a never-ending pattern.' },
  { name: 'Mental filter', description: 'One negative detail colours everything else.' },
  { name: 'Discounting the positive', description: 'Good things don’t count — “they were just being nice”.' },
  { name: 'Mind-reading', description: 'Assuming you know what others think of you.' },
  { name: 'Fortune-telling', description: 'Predicting a bad outcome as if it were fact.' },
  { name: 'Catastrophising', description: 'Blowing things up into a looming disaster.' },
  { name: 'Emotional reasoning', description: 'It feels true, so it must be true.' },
  { name: 'Should statements', description: 'Beating yourself up with shoulds, musts and oughts.' },
  { name: 'Labelling', description: 'A global label instead of the event — “I’m an idiot”.' },
  { name: 'Personalisation', description: 'Taking the blame for things not fully in your control.' },
];
```

- [ ] **Step 2: Write the database**

`src/lib/db.ts`:
```ts
import Dexie, { type Table } from 'dexie';
import type { CustomEmotion, Setting, ThoughtRecord } from './types';

export class ThoughtDb extends Dexie {
  records!: Table<ThoughtRecord, number>;
  customEmotions!: Table<CustomEmotion, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('thought-records');
    this.version(1).stores({
      records: '++id, status, createdAt',
      customEmotions: '++id, &name',
      settings: '&key',
    });
  }
}

export const db = new ThoughtDb();
```

- [ ] **Step 3: Write the failing repository test**

`src/lib/repository.test.ts`:
```ts
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './db';
import {
  addCustomEmotion,
  allEmotionNames,
  completeRecord,
  deleteRecord,
  getRecord,
  getSetting,
  hotThought,
  listCompletedRecords,
  listCustomEmotions,
  listOpenRecords,
  newRecord,
  removeCustomEmotion,
  saveRecord,
  setSetting,
} from './repository';
import { DEFAULT_EMOTIONS } from './constants';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
});

describe('records', () => {
  test('newRecord starts open and empty', () => {
    const r = newRecord();
    expect(r.status).toBe('open');
    expect(r.situation).toBe('');
    expect(r.emotions).toEqual([]);
    expect(r.completedAt).toBeNull();
    expect(r.id).toBeUndefined();
  });

  test('saveRecord assigns an id and persists', async () => {
    const r = newRecord();
    r.situation = 'Missed the bus';
    const id = await saveRecord(r);
    expect(r.id).toBe(id);
    const loaded = await getRecord(id);
    expect(loaded?.situation).toBe('Missed the bus');
  });

  test('saveRecord updates in place on second save', async () => {
    const r = newRecord();
    const id = await saveRecord(r);
    r.situation = 'edited';
    await saveRecord(r);
    expect(await db.records.count()).toBe(1);
    expect((await getRecord(id))?.situation).toBe('edited');
  });

  test('completeRecord flips status and stamps completedAt', async () => {
    const r = newRecord();
    await saveRecord(r);
    await completeRecord(r);
    const loaded = await getRecord(r.id!);
    expect(loaded?.status).toBe('completed');
    expect(loaded?.completedAt).not.toBeNull();
  });

  test('lists split by status, newest first', async () => {
    const a = newRecord();
    a.createdAt = '2026-01-01T10:00:00.000Z';
    await saveRecord(a);
    const b = newRecord();
    b.createdAt = '2026-02-01T10:00:00.000Z';
    await saveRecord(b);
    const c = newRecord();
    await saveRecord(c);
    await completeRecord(c);
    const open = await listOpenRecords();
    expect(open.map((r) => r.id)).toEqual([b.id, a.id]);
    const completed = await listCompletedRecords();
    expect(completed.map((r) => r.id)).toEqual([c.id]);
  });

  test('deleteRecord removes the record', async () => {
    const r = newRecord();
    const id = await saveRecord(r);
    await deleteRecord(id);
    expect(await getRecord(id)).toBeUndefined();
  });

  test('hotThought returns the hot thought text or empty string', () => {
    const r = newRecord();
    expect(hotThought(r)).toBe('');
    r.thoughts = [
      { text: 'nobody cares', isHot: false },
      { text: 'I always ruin things', isHot: true },
    ];
    expect(hotThought(r)).toBe('I always ruin things');
  });
});

describe('custom emotions', () => {
  test('allEmotionNames starts with the 12 defaults', async () => {
    expect(await allEmotionNames()).toEqual([...DEFAULT_EMOTIONS]);
  });

  test('addCustomEmotion trims and appends', async () => {
    await addCustomEmotion('  Restless ');
    expect(await allEmotionNames()).toContain('Restless');
  });

  test('addCustomEmotion ignores blanks and case-insensitive duplicates', async () => {
    await addCustomEmotion('   ');
    await addCustomEmotion('anxious'); // duplicate of default 'Anxious'
    await addCustomEmotion('Restless');
    await addCustomEmotion('restless'); // duplicate of custom
    expect(await listCustomEmotions()).toHaveLength(1);
  });

  test('removeCustomEmotion deletes by id', async () => {
    await addCustomEmotion('Restless');
    const [c] = await listCustomEmotions();
    await removeCustomEmotion(c.id!);
    expect(await listCustomEmotions()).toHaveLength(0);
  });
});

describe('settings', () => {
  test('get returns null when unset, value after set', async () => {
    expect(await getSetting('lastExportAt')).toBeNull();
    await setSetting('lastExportAt', '2026-09-08T00:00:00.000Z');
    expect(await getSetting('lastExportAt')).toBe('2026-09-08T00:00:00.000Z');
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run src/lib/repository.test.ts`
Expected: FAIL — cannot resolve `./repository`.

- [ ] **Step 5: Write the repository**

`src/lib/repository.ts`:
```ts
import { db } from './db';
import { DEFAULT_EMOTIONS } from './constants';
import type { CustomEmotion, ThoughtRecord } from './types';

export function newRecord(): ThoughtRecord {
  const now = new Date().toISOString();
  return {
    status: 'open',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    situation: '',
    emotions: [],
    thoughts: [],
    evidenceFor: '',
    evidenceAgainst: '',
    distortions: [],
    balancedThought: '',
  };
}

export async function saveRecord(record: ThoughtRecord): Promise<number> {
  record.updatedAt = new Date().toISOString();
  if (record.id === undefined) {
    const { id: _unused, ...fields } = record;
    void _unused;
    const id = await db.records.add(fields as ThoughtRecord);
    record.id = id;
    return id;
  }
  await db.records.put(record);
  return record.id;
}

export async function completeRecord(record: ThoughtRecord): Promise<number> {
  record.status = 'completed';
  record.completedAt = new Date().toISOString();
  return saveRecord(record);
}

export async function getRecord(id: number): Promise<ThoughtRecord | undefined> {
  return db.records.get(id);
}

export async function deleteRecord(id: number): Promise<void> {
  await db.records.delete(id);
}

function newestFirst(records: ThoughtRecord[]): ThoughtRecord[] {
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listOpenRecords(): Promise<ThoughtRecord[]> {
  return newestFirst(await db.records.where('status').equals('open').toArray());
}

export async function listCompletedRecords(): Promise<ThoughtRecord[]> {
  return newestFirst(await db.records.where('status').equals('completed').toArray());
}

export function hotThought(record: ThoughtRecord): string {
  return record.thoughts.find((t) => t.isHot)?.text ?? '';
}

export async function listCustomEmotions(): Promise<CustomEmotion[]> {
  return db.customEmotions.toArray();
}

export async function allEmotionNames(): Promise<string[]> {
  const custom = await listCustomEmotions();
  return [...DEFAULT_EMOTIONS, ...custom.map((c) => c.name)];
}

export async function addCustomEmotion(name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) return;
  const existing = await allEmotionNames();
  if (existing.some((e) => e.toLowerCase() === clean.toLowerCase())) return;
  await db.customEmotions.add({ name: clean });
}

export async function removeCustomEmotion(id: number): Promise<void> {
  await db.customEmotions.delete(id);
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.settings.get(key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/lib/repository.test.ts`
Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add domain types, Dexie database and repository"
```

---
### Task 3: Backup — export, import, nudge rule

**Files:**
- Create: `src/lib/backup.ts`
- Test: `src/lib/backup.test.ts`

**Interfaces:**
- Consumes: `db` from `./db`; `getSetting`, `setSetting` from `./repository`; types from `./types`.
- Produces: `BackupFile { app: 'thought-records'; version: 1; exportedAt: string; records: ThoughtRecord[]; customEmotions: CustomEmotion[] }`, `createBackup(): Promise<BackupFile>`, `parseBackup(json: string): BackupFile` (throws `Error` with a user-readable message on anything invalid), `restoreBackup(backup: BackupFile): Promise<void>` (REPLACES all records and custom emotions), `downloadBackup(): Promise<void>` (browser download + records `lastExportAt` setting), `shouldNudgeExport(lastExportAt: string | null, newestRecordAt: string | null, now: Date): boolean`. Setting key is the string `'lastExportAt'`.

- [ ] **Step 1: Write the failing test**

`src/lib/backup.test.ts`:
```ts
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './db';
import { createBackup, parseBackup, restoreBackup, shouldNudgeExport } from './backup';
import { addCustomEmotion, listCustomEmotions, newRecord, saveRecord } from './repository';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
});

describe('backup round trip', () => {
  test('createBackup captures records and custom emotions', async () => {
    const r = newRecord();
    r.situation = 'test';
    await saveRecord(r);
    await addCustomEmotion('Restless');
    const backup = await createBackup();
    expect(backup.app).toBe('thought-records');
    expect(backup.version).toBe(1);
    expect(backup.records).toHaveLength(1);
    expect(backup.customEmotions).toHaveLength(1);
    expect(backup.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test('restoreBackup replaces existing data', async () => {
    const old = newRecord();
    old.situation = 'will be replaced';
    await saveRecord(old);
    const incoming = newRecord();
    incoming.situation = 'restored';
    await restoreBackup({
      app: 'thought-records',
      version: 1,
      exportedAt: '2026-09-01T00:00:00.000Z',
      records: [{ ...incoming, id: 42 }],
      customEmotions: [{ id: 1, name: 'Restless' }],
    });
    const records = await db.records.toArray();
    expect(records).toHaveLength(1);
    expect(records[0].situation).toBe('restored');
    expect(records[0].id).toBe(42);
    expect(await listCustomEmotions()).toHaveLength(1);
  });

  test('parseBackup accepts its own output', async () => {
    const backup = await createBackup();
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.version).toBe(1);
  });
});

describe('parseBackup rejects bad input', () => {
  test.each([
    ['not json at all', 'hello'],
    ['wrong shape', '{"foo": 1}'],
    ['wrong app', '{"app":"other","version":1,"exportedAt":"x","records":[],"customEmotions":[]}'],
    ['wrong version', '{"app":"thought-records","version":9,"exportedAt":"x","records":[],"customEmotions":[]}'],
    ['records not array', '{"app":"thought-records","version":1,"exportedAt":"x","records":{},"customEmotions":[]}'],
  ])('%s', (_name, json) => {
    expect(() => parseBackup(json)).toThrow(/backup/i);
  });
});

describe('shouldNudgeExport', () => {
  const now = new Date('2026-09-08T12:00:00.000Z');
  test('no records → no nudge', () => {
    expect(shouldNudgeExport(null, null, now)).toBe(false);
  });
  test('records but never exported → nudge', () => {
    expect(shouldNudgeExport(null, '2026-09-07T00:00:00.000Z', now)).toBe(true);
  });
  test('exported recently → no nudge', () => {
    expect(shouldNudgeExport('2026-09-01T00:00:00.000Z', '2026-09-07T00:00:00.000Z', now)).toBe(false);
  });
  test('stale export with newer records → nudge', () => {
    expect(shouldNudgeExport('2026-08-01T00:00:00.000Z', '2026-09-07T00:00:00.000Z', now)).toBe(true);
  });
  test('stale export but nothing new since → no nudge', () => {
    expect(shouldNudgeExport('2026-08-01T00:00:00.000Z', '2026-07-20T00:00:00.000Z', now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/backup.test.ts`
Expected: FAIL — cannot resolve `./backup`.

- [ ] **Step 3: Write the implementation**

`src/lib/backup.ts`:
```ts
import { db } from './db';
import { getSetting, setSetting } from './repository';
import type { CustomEmotion, ThoughtRecord } from './types';

export interface BackupFile {
  app: 'thought-records';
  version: 1;
  exportedAt: string;
  records: ThoughtRecord[];
  customEmotions: CustomEmotion[];
}

export const LAST_EXPORT_KEY = 'lastExportAt';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export async function createBackup(): Promise<BackupFile> {
  return {
    app: 'thought-records',
    version: 1,
    exportedAt: new Date().toISOString(),
    records: await db.records.toArray(),
    customEmotions: await db.customEmotions.toArray(),
  };
}

export function parseBackup(json: string): BackupFile {
  const fail = () => new Error("This file doesn't look like a Thought Records backup.");
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw fail();
  }
  if (typeof data !== 'object' || data === null) throw fail();
  const d = data as Record<string, unknown>;
  if (d.app !== 'thought-records' || d.version !== 1) throw fail();
  if (!Array.isArray(d.records) || !Array.isArray(d.customEmotions)) throw fail();
  return data as BackupFile;
}

export async function restoreBackup(backup: BackupFile): Promise<void> {
  await db.transaction('rw', db.records, db.customEmotions, async () => {
    await db.records.clear();
    await db.customEmotions.clear();
    await db.records.bulkAdd(backup.records);
    await db.customEmotions.bulkAdd(backup.customEmotions);
  });
}

export async function downloadBackup(): Promise<void> {
  const backup = await createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thought-records-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  await setSetting(LAST_EXPORT_KEY, backup.exportedAt);
}

export async function getLastExportAt(): Promise<string | null> {
  return getSetting(LAST_EXPORT_KEY);
}

export function shouldNudgeExport(
  lastExportAt: string | null,
  newestRecordAt: string | null,
  now: Date,
): boolean {
  if (!newestRecordAt) return false;
  if (!lastExportAt) return true;
  const stale = now.getTime() - Date.parse(lastExportAt) > FOURTEEN_DAYS_MS;
  const newSince = newestRecordAt > lastExportAt;
  return stale && newSince;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/backup.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add JSON backup export/import and export-nudge rule"
```

---

### Task 4: UI primitives

**Files:**
- Create: `src/components/ui.tsx`, `src/lib/format.ts`
- Test: `src/components/ui.test.tsx`, `src/lib/format.test.ts`

**Interfaces:**
- Consumes: Tailwind tokens from Task 1.
- Produces (exact props — later tasks import these from `../components/ui` / `../../components/ui`):
  - `Button({ variant?: 'primary'|'secondary'|'ghost'; disabled?: boolean; onClick?: () => void; children: ReactNode; className?: string; type?: 'button'|'submit' })`
  - `Chip({ label: string; selected: boolean; onTap: () => void })`
  - `IntensitySlider({ label: string; value: number; onChange: (v: number) => void; hint?: string })`
  - `ProgressDots({ current: number; total: number })`
  - `StepShell({ title: string; subtitle?: string; children?: ReactNode })` — animated step wrapper
  - `AutoTextArea({ value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean })`
  - `ConfirmSheet({ open: boolean; title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void })`
  - From `src/lib/format.ts`: `formatRelative(iso: string, now?: Date): string`, `formatFullDate(iso: string): string`.

- [ ] **Step 1: Write failing tests**

`src/lib/format.test.ts`:
```ts
import { expect, test } from 'vitest';
import { formatFullDate, formatRelative } from './format';

const now = new Date('2026-09-08T15:00:00');

test('same day is Today', () => {
  expect(formatRelative('2026-09-08T09:00:00', now)).toBe('Today');
});
test('previous day is Yesterday', () => {
  expect(formatRelative('2026-09-07T23:00:00', now)).toBe('Yesterday');
});
test('recent days are counted', () => {
  expect(formatRelative('2026-09-05T09:00:00', now)).toBe('3 days ago');
});
test('older dates show the date', () => {
  expect(formatRelative('2026-08-20T09:00:00', now)).toMatch(/20/);
});
test('formatFullDate includes year', () => {
  expect(formatFullDate('2026-08-20T09:00:00')).toMatch(/2026/);
});
```

`src/components/ui.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Button, Chip, ConfirmSheet, IntensitySlider } from './ui';

test('Button fires onClick and respects disabled', async () => {
  const onClick = vi.fn();
  const { rerender } = render(<Button onClick={onClick}>Go</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Go' }));
  expect(onClick).toHaveBeenCalledOnce();
  rerender(<Button onClick={onClick} disabled>Go</Button>);
  expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled();
});

test('Chip fires onTap', async () => {
  const onTap = vi.fn();
  render(<Chip label="Anxious" selected={false} onTap={onTap} />);
  await userEvent.click(screen.getByRole('button', { name: 'Anxious' }));
  expect(onTap).toHaveBeenCalledOnce();
});

test('IntensitySlider shows label and value', () => {
  render(<IntensitySlider label="Anxious" value={70} onChange={() => {}} />);
  expect(screen.getByText('Anxious')).toBeInTheDocument();
  expect(screen.getByText('70')).toBeInTheDocument();
  expect(screen.getByRole('slider')).toHaveValue('70');
});

test('ConfirmSheet renders only when open and wires both buttons', async () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const { rerender } = render(
    <ConfirmSheet open={false} title="Delete?" body="Gone forever." confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel} />,
  );
  expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  rerender(
    <ConfirmSheet open title="Delete?" body="Gone forever." confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel} />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(onConfirm).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/ui.test.tsx src/lib/format.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write format helpers**

`src/lib/format.ts`:
```ts
export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
```

- [ ] **Step 4: Write the primitives**

`src/components/ui.tsx`:
```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

const buttonStyles = {
  primary:
    'bg-sage-deep text-white shadow-sm active:bg-sage dark:bg-sage dark:text-night-bg dark:active:bg-sage-deep',
  secondary:
    'bg-sage-soft text-sage-deep dark:bg-night-surface dark:text-sage',
  ghost: 'text-mist dark:text-night-mist',
  danger: 'bg-red-800/90 text-white dark:bg-red-900',
} as const;

export function Button({
  variant = 'primary',
  disabled,
  onClick,
  children,
  className = '',
  type = 'button',
}: {
  variant?: keyof typeof buttonStyles;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-6 py-4 font-body text-base font-medium transition-colors disabled:opacity-40 ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Chip({
  label,
  selected,
  onTap,
}: {
  label: string;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onTap}
      aria-pressed={selected}
      className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
        selected
          ? 'bg-sage-deep text-white dark:bg-sage dark:text-night-bg'
          : 'bg-surface text-ink shadow-sm dark:bg-night-surface dark:text-night-ink'
      }`}
    >
      {label}
    </motion.button>
  );
}

export function IntensitySlider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm dark:bg-night-surface">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-mist dark:text-night-mist">
          {hint && <span className="mr-2">{hint}</span>}
          <span className="text-base font-semibold text-ink dark:text-night-ink">{value}</span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} intensity`}
        className="w-full accent-sage-deep dark:accent-sage"
      />
    </div>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-5 bg-sage-deep dark:bg-sage'
              : 'w-1.5 bg-sage-soft dark:bg-night-surface'
          }`}
        />
      ))}
    </div>
  );
}

export function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-5 pb-6"
    >
      <div>
        <h2 className="font-display text-2xl font-medium">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-mist dark:text-night-mist">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function AutoTextArea({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      rows={4}
      className="w-full resize-none rounded-2xl bg-surface p-4 text-base leading-relaxed shadow-sm outline-none ring-sage placeholder:text-mist/60 focus:ring-2 dark:bg-night-surface dark:placeholder:text-night-mist/60"
    />
  );
}

export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 dark:bg-black/50"
          onClick={onCancel}
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md rounded-t-3xl bg-paper p-6 pb-10 dark:bg-night-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-medium">{title}</h3>
            <p className="mt-2 text-sm text-mist dark:text-night-mist">{body}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button variant="danger" onClick={onConfirm}>
                {confirmLabel}
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/ui.test.tsx src/lib/format.test.ts`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add UI primitives and date formatting helpers"
```

---

### Task 5: Wizard step machine

**Files:**
- Create: `src/lib/wizard.ts`
- Test: `src/lib/wizard.test.ts`

**Interfaces:**
- Consumes: `ThoughtRecord` from `./types`; `newRecord` from `./repository` (tests only).
- Produces (Tasks 7–8 build screens directly on these):
  - `WizardMode = 'new' | 'complete' | 'edit'`
  - `WizardStep = 'situation'|'emotions'|'thoughts'|'fork'|'evidenceFor'|'evidenceAgainst'|'distortions'|'balanced'|'rerate'|'done'`
  - `stepsForMode(mode: WizardMode): WizardStep[]`
  - `WizardState { record: ThoughtRecord; steps: WizardStep[]; stepIndex: number }`
  - `initWizard(record: ThoughtRecord, mode: WizardMode): WizardState`
  - `WizardAction` union: `{type:'patch'; fields: Partial<ThoughtRecord>}`, `{type:'toggleEmotion'; emotion: string}`, `{type:'setBefore'; emotion: string; value: number}`, `{type:'setAfter'; emotion: string; value: number}`, `{type:'addThought'; text: string}`, `{type:'removeThought'; index: number}`, `{type:'setHot'; index: number}`, `{type:'toggleDistortion'; name: string}`, `{type:'next'}`, `{type:'back'}`
  - `wizardReducer(state: WizardState, action: WizardAction): WizardState`
  - `canProceed(state: WizardState): boolean`
  - `currentStep(state: WizardState): WizardStep`

- [ ] **Step 1: Write the failing test**

`src/lib/wizard.test.ts`:
```ts
import { describe, expect, test } from 'vitest';
import { newRecord } from './repository';
import {
  canProceed,
  currentStep,
  initWizard,
  stepsForMode,
  wizardReducer,
  type WizardState,
} from './wizard';

function fresh(mode: 'new' | 'complete' | 'edit' = 'new'): WizardState {
  return initWizard(newRecord(), mode);
}

describe('step order', () => {
  test('new mode walks all steps including the fork', () => {
    expect(stepsForMode('new')).toEqual([
      'situation', 'emotions', 'thoughts', 'fork',
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
  test('complete mode starts at evidence, no fork', () => {
    expect(stepsForMode('complete')).toEqual([
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
  test('edit mode walks all steps except the fork', () => {
    expect(stepsForMode('edit')).toEqual([
      'situation', 'emotions', 'thoughts',
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
});

describe('navigation', () => {
  test('next and back move within bounds', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'back' });
    expect(s.stepIndex).toBe(0);
    s = wizardReducer(s, { type: 'next' });
    expect(currentStep(s)).toBe('emotions');
    s = wizardReducer(s, { type: 'back' });
    expect(currentStep(s)).toBe('situation');
  });

  test('entering rerate prefills after with before values', () => {
    let s = fresh('complete');
    s = wizardReducer(s, {
      type: 'patch',
      fields: { emotions: [{ emotion: 'Anxious', before: 80, after: null }] },
    });
    while (currentStep(s) !== 'rerate') s = wizardReducer(s, { type: 'next' });
    expect(s.record.emotions[0].after).toBe(80);
  });

  test('rerate prefill keeps an existing after value', () => {
    let s = fresh('complete');
    s = wizardReducer(s, {
      type: 'patch',
      fields: { emotions: [{ emotion: 'Anxious', before: 80, after: 30 }] },
    });
    while (currentStep(s) !== 'rerate') s = wizardReducer(s, { type: 'next' });
    expect(s.record.emotions[0].after).toBe(30);
  });
});

describe('emotions', () => {
  test('toggleEmotion adds with before 50, toggles off, setBefore/setAfter update', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'toggleEmotion', emotion: 'Anxious' });
    expect(s.record.emotions).toEqual([{ emotion: 'Anxious', before: 50, after: null }]);
    s = wizardReducer(s, { type: 'setBefore', emotion: 'Anxious', value: 85 });
    expect(s.record.emotions[0].before).toBe(85);
    s = wizardReducer(s, { type: 'setAfter', emotion: 'Anxious', value: 40 });
    expect(s.record.emotions[0].after).toBe(40);
    s = wizardReducer(s, { type: 'toggleEmotion', emotion: 'Anxious' });
    expect(s.record.emotions).toEqual([]);
  });
});

describe('thoughts', () => {
  test('first thought becomes hot; setHot moves it; remove reassigns hot', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'addThought', text: 'I always fail' });
    s = wizardReducer(s, { type: 'addThought', text: 'They think less of me' });
    expect(s.record.thoughts.map((t) => t.isHot)).toEqual([true, false]);
    s = wizardReducer(s, { type: 'setHot', index: 1 });
    expect(s.record.thoughts.map((t) => t.isHot)).toEqual([false, true]);
    s = wizardReducer(s, { type: 'removeThought', index: 1 });
    expect(s.record.thoughts).toHaveLength(1);
    expect(s.record.thoughts[0].isHot).toBe(true);
  });

  test('blank thoughts are ignored', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'addThought', text: '   ' });
    expect(s.record.thoughts).toHaveLength(0);
  });
});

describe('distortions', () => {
  test('toggleDistortion adds and removes', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'toggleDistortion', name: 'Catastrophising' });
    expect(s.record.distortions).toEqual(['Catastrophising']);
    s = wizardReducer(s, { type: 'toggleDistortion', name: 'Catastrophising' });
    expect(s.record.distortions).toEqual([]);
  });
});

describe('canProceed', () => {
  test('situation requires text', () => {
    let s = fresh();
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'patch', fields: { situation: 'Missed the bus' } });
    expect(canProceed(s)).toBe(true);
  });

  test('emotions requires at least one', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'patch', fields: { situation: 'x' } });
    s = wizardReducer(s, { type: 'next' });
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'toggleEmotion', emotion: 'Sad' });
    expect(canProceed(s)).toBe(true);
  });

  test('thoughts requires at least one', () => {
    let s = fresh();
    s = { ...s, stepIndex: s.steps.indexOf('thoughts') };
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'addThought', text: 'a thought' });
    expect(canProceed(s)).toBe(true);
  });

  test('evidence and distortions are optional, balanced is required', () => {
    let s = fresh('complete');
    expect(canProceed(s)).toBe(true); // evidenceFor
    s = { ...s, stepIndex: s.steps.indexOf('balanced') };
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'patch', fields: { balancedThought: 'A fairer view' } });
    expect(canProceed(s)).toBe(true);
  });

  test('rerate requires every after value', () => {
    let s = fresh('complete');
    s = wizardReducer(s, {
      type: 'patch',
      fields: {
        emotions: [
          { emotion: 'Anxious', before: 80, after: null },
          { emotion: 'Sad', before: 60, after: null },
        ],
      },
    });
    s = { ...s, stepIndex: s.steps.indexOf('rerate') };
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'setAfter', emotion: 'Anxious', value: 40 });
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'setAfter', emotion: 'Sad', value: 30 });
    expect(canProceed(s)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/wizard.test.ts`
Expected: FAIL — cannot resolve `./wizard`.

- [ ] **Step 3: Write the implementation**

`src/lib/wizard.ts`:
```ts
import type { ThoughtRecord } from './types';

export type WizardMode = 'new' | 'complete' | 'edit';

export type WizardStep =
  | 'situation'
  | 'emotions'
  | 'thoughts'
  | 'fork'
  | 'evidenceFor'
  | 'evidenceAgainst'
  | 'distortions'
  | 'balanced'
  | 'rerate'
  | 'done';

export function stepsForMode(mode: WizardMode): WizardStep[] {
  const restructure: WizardStep[] = ['evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done'];
  switch (mode) {
    case 'new':
      return ['situation', 'emotions', 'thoughts', 'fork', ...restructure];
    case 'complete':
      return restructure;
    case 'edit':
      return ['situation', 'emotions', 'thoughts', ...restructure];
  }
}

export interface WizardState {
  record: ThoughtRecord;
  steps: WizardStep[];
  stepIndex: number;
}

export function initWizard(record: ThoughtRecord, mode: WizardMode): WizardState {
  return { record, steps: stepsForMode(mode), stepIndex: 0 };
}

export type WizardAction =
  | { type: 'patch'; fields: Partial<ThoughtRecord> }
  | { type: 'toggleEmotion'; emotion: string }
  | { type: 'setBefore'; emotion: string; value: number }
  | { type: 'setAfter'; emotion: string; value: number }
  | { type: 'addThought'; text: string }
  | { type: 'removeThought'; index: number }
  | { type: 'setHot'; index: number }
  | { type: 'toggleDistortion'; name: string }
  | { type: 'next' }
  | { type: 'back' };

export function currentStep(state: WizardState): WizardStep {
  return state.steps[state.stepIndex];
}

function withRecord(state: WizardState, record: ThoughtRecord): WizardState {
  return { ...state, record };
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const r = state.record;
  switch (action.type) {
    case 'patch':
      return withRecord(state, { ...r, ...action.fields });
    case 'toggleEmotion': {
      const exists = r.emotions.some((e) => e.emotion === action.emotion);
      const emotions = exists
        ? r.emotions.filter((e) => e.emotion !== action.emotion)
        : [...r.emotions, { emotion: action.emotion, before: 50, after: null }];
      return withRecord(state, { ...r, emotions });
    }
    case 'setBefore':
    case 'setAfter': {
      const field = action.type === 'setBefore' ? 'before' : 'after';
      const emotions = r.emotions.map((e) =>
        e.emotion === action.emotion ? { ...e, [field]: action.value } : e,
      );
      return withRecord(state, { ...r, emotions });
    }
    case 'addThought': {
      const text = action.text.trim();
      if (!text) return state;
      const thoughts = [...r.thoughts, { text, isHot: r.thoughts.length === 0 }];
      return withRecord(state, { ...r, thoughts });
    }
    case 'removeThought': {
      const removed = r.thoughts[action.index];
      const thoughts = r.thoughts.filter((_, i) => i !== action.index);
      if (removed?.isHot && thoughts.length > 0) {
        thoughts[0] = { ...thoughts[0], isHot: true };
      }
      return withRecord(state, { ...r, thoughts });
    }
    case 'setHot': {
      const thoughts = r.thoughts.map((t, i) => ({ ...t, isHot: i === action.index }));
      return withRecord(state, { ...r, thoughts });
    }
    case 'toggleDistortion': {
      const has = r.distortions.includes(action.name);
      const distortions = has
        ? r.distortions.filter((d) => d !== action.name)
        : [...r.distortions, action.name];
      return withRecord(state, { ...r, distortions });
    }
    case 'next': {
      const stepIndex = Math.min(state.stepIndex + 1, state.steps.length - 1);
      let record = r;
      if (state.steps[stepIndex] === 'rerate') {
        record = {
          ...r,
          emotions: r.emotions.map((e) => (e.after === null ? { ...e, after: e.before } : e)),
        };
      }
      return { ...state, stepIndex, record };
    }
    case 'back':
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 0) };
  }
}

export function canProceed(state: WizardState): boolean {
  const r = state.record;
  switch (currentStep(state)) {
    case 'situation':
      return r.situation.trim() !== '';
    case 'emotions':
      return r.emotions.length > 0;
    case 'thoughts':
      return r.thoughts.length > 0 && r.thoughts.some((t) => t.isHot);
    case 'balanced':
      return r.balancedThought.trim() !== '';
    case 'rerate':
      return r.emotions.length > 0 && r.emotions.every((e) => e.after !== null);
    default:
      return true;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/wizard.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add wizard step machine with validation and rerate prefill"
```

---
### Task 6: App shell, routing, RecordCard, Home screen

**Files:**
- Create: `src/components/RecordCard.tsx`, `src/screens/HomeScreen.tsx`
- Modify: `src/App.tsx` (replace placeholder), `src/test/app.test.tsx` (replace)
- Test: `src/screens/HomeScreen.test.tsx`

**Interfaces:**
- Consumes: repository functions (Task 2), `formatRelative` (Task 4), UI primitives (Task 4).
- Produces:
  - Routes that ALL later screens are registered under (exact paths): `/` HomeScreen, `/new`, `/complete/:id`, `/edit/:id` (all three render `WizardScreen`, Task 7), `/records` RecordListScreen (Task 9), `/record/:id` RecordDetailScreen (Task 9), `/settings` SettingsScreen (Task 10). Until those tasks land, App only registers `/` — later tasks ADD their routes to `src/App.tsx`.
  - `RecordCard({ record: ThoughtRecord })` — links to `/complete/:id` when open, `/record/:id` when completed.
  - `EmotionSummary({ rating: EmotionRating })` — renders `Anxious 80 → 45` (completed) or `Anxious 80` (open), exported from `src/components/RecordCard.tsx`.

- [ ] **Step 1: Write the failing test**

`src/screens/HomeScreen.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { completeRecord, newRecord, saveRecord } from '../lib/repository';
import HomeScreen from './HomeScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.settings.clear();
});

function renderHome() {
  return render(
    <HashRouter>
      <HomeScreen />
    </HashRouter>,
  );
}

test('shows the new record button', async () => {
  renderHome();
  expect(await screen.findByText('New record')).toBeInTheDocument();
});

test('lists open records under To finish', async () => {
  const r = newRecord();
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  await saveRecord(r);
  renderHome();
  expect(await screen.findByText('To finish')).toBeInTheDocument();
  expect(await screen.findByText(/Argument at work/)).toBeInTheDocument();
});

test('lists completed records under Recent', async () => {
  const r = newRecord();
  r.situation = 'Missed a call from mum';
  r.emotions = [{ emotion: 'Guilty', before: 70, after: 30 }];
  r.balancedThought = 'She knows I love her.';
  await saveRecord(r);
  await completeRecord(r);
  renderHome();
  expect(await screen.findByText('Recent')).toBeInTheDocument();
  expect(await screen.findByText(/Missed a call/)).toBeInTheDocument();
  expect(await screen.findByText(/70 → 30/)).toBeInTheDocument();
});

test('empty state shows a gentle prompt', async () => {
  renderHome();
  expect(
    await screen.findByText('When something stirs you up, capture it here.'),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/HomeScreen.test.tsx`
Expected: FAIL — cannot resolve `./HomeScreen`.

- [ ] **Step 3: Write RecordCard**

`src/components/RecordCard.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { EmotionRating, ThoughtRecord } from '../lib/types';
import { formatRelative } from '../lib/format';

export function EmotionSummary({ rating }: { rating: EmotionRating }) {
  const text =
    rating.after === null
      ? `${rating.emotion} ${rating.before}`
      : `${rating.emotion} ${rating.before} → ${rating.after}`;
  return (
    <span className="inline-flex items-baseline rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage-deep dark:bg-night-surface dark:text-sage">
      {text}
    </span>
  );
}

export function RecordCard({ record }: { record: ThoughtRecord }) {
  const to = record.status === 'open' ? `/complete/${record.id}` : `/record/${record.id}`;
  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="block rounded-2xl bg-surface p-4 shadow-sm dark:bg-night-surface"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-mist dark:text-night-mist">
            {formatRelative(record.createdAt)}
          </span>
          {record.status === 'open' && (
            <span className="text-xs font-medium text-blue-dusty">Unfinished</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed">{record.situation}</p>
        {record.emotions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {record.emotions.map((e) => (
              <EmotionSummary key={e.emotion} rating={e} />
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 4: Write HomeScreen and the new App**

`src/screens/HomeScreen.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { listCompletedRecords, listOpenRecords } from '../lib/repository';
import { RecordCard } from '../components/RecordCard';

export default function HomeScreen() {
  const open = useLiveQuery(listOpenRecords, [], []);
  const completed = useLiveQuery(listCompletedRecords, [], []);
  const recent = completed.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-medium">Thought Records</h1>
        <Link to="/settings" aria-label="Settings" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          to="/new"
          className="block rounded-3xl bg-sage-deep p-6 text-white shadow-md dark:bg-sage dark:text-night-bg"
        >
          <span className="font-display text-2xl font-medium">New record</span>
          <p className="mt-1 text-sm opacity-80">Catch a difficult moment while it's fresh.</p>
        </Link>
      </motion.div>

      {open.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
            To finish
          </h2>
          {open.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </section>
      )}

      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
              Recent
            </h2>
            <Link to="/records" className="text-sm text-sage-deep dark:text-sage">
              See all
            </Link>
          </div>
          {recent.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </section>
      )}

      {open.length === 0 && completed.length === 0 && (
        <p className="mt-8 text-center text-sm leading-relaxed text-mist dark:text-night-mist">
          When something stirs you up, capture it here.
        </p>
      )}
    </div>
  );
}
```

`src/App.tsx` (full replacement):
```tsx
import { HashRouter, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <HashRouter>
      <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-16">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
```

`src/test/app.test.tsx` (full replacement):
```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the home screen', async () => {
  render(<App />);
  expect(await screen.findByText('Thought Records')).toBeInTheDocument();
});
```

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add app shell, routing and capture-first home screen"
```

---

### Task 7: Wizard screen and capture steps (situation, emotions, thoughts, fork)

**Files:**
- Create: `src/screens/Wizard.tsx`, `src/screens/WizardScreen.tsx`, `src/screens/steps/SituationStep.tsx`, `src/screens/steps/EmotionsStep.tsx`, `src/screens/steps/ThoughtsStep.tsx`, `src/screens/steps/ForkStep.tsx`
- Modify: `src/App.tsx` (add `/new`, `/complete/:id`, `/edit/:id` routes)
- Test: `src/screens/Wizard.test.tsx`

**Interfaces:**
- Consumes: wizard machine (Task 5), repository (Task 2), UI primitives (Task 4).
- Produces:
  - `WizardScreen({ mode: WizardMode })` default export — route wrapper.
  - `Wizard({ initialRecord: ThoughtRecord; mode: WizardMode })` — used only by WizardScreen.
  - Step component contract used by Task 8's steps too: each step receives `{ record: ThoughtRecord; dispatch: React.Dispatch<WizardAction> }` (ForkStep and DoneStep differ — see their code).
  - Wizard's step switch renders Task 8's steps as a temporary `StepShell` stub that Task 8 REPLACES (search for `RESTRUCTURE_STUB`).

- [ ] **Step 1: Write the failing test**

`src/screens/Wizard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord } from '../lib/repository';
import Wizard from './Wizard';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
});

function renderNewWizard() {
  return render(
    <HashRouter>
      <Wizard initialRecord={newRecord()} mode="new" />
    </HashRouter>,
  );
}

test('starts on the situation step with Next disabled until text is entered', async () => {
  renderNewWizard();
  expect(await screen.findByText('What happened?')).toBeInTheDocument();
  const next = screen.getByRole('button', { name: 'Next' });
  expect(next).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox'), 'Missed the bus');
  expect(next).toBeEnabled();
});

test('walks situation → emotions → thoughts → fork', async () => {
  renderNewWizard();
  await userEvent.type(await screen.findByRole('textbox'), 'Missed the bus');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Emotions step: default chips are shown, tap one, a slider appears
  expect(await screen.findByText('What are you feeling?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Anxious' }));
  expect(screen.getByRole('slider')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Thoughts step: add a thought
  expect(await screen.findByText('What went through your mind?')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'I always mess up');
  await userEvent.click(screen.getByRole('button', { name: 'Add' }));
  expect(screen.getByText('I always mess up')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Fork step
  expect(await screen.findByText('Saved. Want to keep going?')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Keep going' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save for later' })).toBeInTheDocument();
});

test('autosaves the record when moving between steps', async () => {
  renderNewWizard();
  await userEvent.type(await screen.findByRole('textbox'), 'Missed the bus');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByText('What are you feeling?');
  const records = await db.records.toArray();
  expect(records).toHaveLength(1);
  expect(records[0].situation).toBe('Missed the bus');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/Wizard.test.tsx`
Expected: FAIL — cannot resolve `./Wizard`.

- [ ] **Step 3: Write the capture step components**

`src/screens/steps/SituationStep.tsx`:
```tsx
import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { AutoTextArea, StepShell } from '../../components/ui';

export default function SituationStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="What happened?"
      subtitle="Just the facts — what a camera would have seen. Where, when, who with."
    >
      <AutoTextArea
        value={record.situation}
        onChange={(v) => dispatch({ type: 'patch', fields: { situation: v } })}
        placeholder="This afternoon at work, my manager…"
        autoFocus
      />
    </StepShell>
  );
}
```

`src/screens/steps/EmotionsStep.tsx`:
```tsx
import { useState, type Dispatch } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { addCustomEmotion, allEmotionNames } from '../../lib/repository';
import { Chip, IntensitySlider, StepShell } from '../../components/ui';
import { DEFAULT_EMOTIONS } from '../../lib/constants';

export default function EmotionsStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  const names = useLiveQuery(allEmotionNames, [], [...DEFAULT_EMOTIONS]);
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState('');

  const selected = (name: string) => record.emotions.some((e) => e.emotion === name);

  const submitCustom = async () => {
    const clean = customName.trim();
    setCustomName('');
    setAdding(false);
    if (!clean) return;
    await addCustomEmotion(clean);
    const canonical =
      (await allEmotionNames()).find((n) => n.toLowerCase() === clean.toLowerCase()) ?? clean;
    if (!selected(canonical)) dispatch({ type: 'toggleEmotion', emotion: canonical });
  };

  return (
    <StepShell title="What are you feeling?" subtitle="Tap everything that's there, then set how strong each one is.">
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <Chip
            key={name}
            label={name}
            selected={selected(name)}
            onTap={() => dispatch({ type: 'toggleEmotion', emotion: name })}
          />
        ))}
        {adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitCustom();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              autoFocus
              placeholder="Name it…"
              aria-label="Custom emotion"
              className="w-32 rounded-full bg-surface px-4 py-2.5 text-sm shadow-sm outline-none ring-sage focus:ring-2 dark:bg-night-surface"
            />
            <button type="submit" className="text-sm font-medium text-sage-deep dark:text-sage">
              Add
            </button>
          </form>
        ) : (
          <Chip label="+ something else" selected={false} onTap={() => setAdding(true)} />
        )}
      </div>
      {record.emotions.length > 0 && (
        <div className="flex flex-col gap-3">
          {record.emotions.map((e) => (
            <IntensitySlider
              key={e.emotion}
              label={e.emotion}
              value={e.before}
              onChange={(v) => dispatch({ type: 'setBefore', emotion: e.emotion, value: v })}
            />
          ))}
        </div>
      )}
    </StepShell>
  );
}
```

`src/screens/steps/ThoughtsStep.tsx`:
```tsx
import { useState, type Dispatch } from 'react';
import { motion } from 'framer-motion';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { StepShell } from '../../components/ui';

export default function ThoughtsStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    dispatch({ type: 'addThought', text: draft });
    setDraft('');
  };

  return (
    <StepShell
      title="What went through your mind?"
      subtitle="Add each thought as it came. Then tap the one that stings the most — that's the one we'll work on."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="“I always mess this up”"
          aria-label="New thought"
          autoFocus
          className="min-w-0 flex-1 rounded-2xl bg-surface p-4 text-base shadow-sm outline-none ring-sage placeholder:text-mist/60 focus:ring-2 dark:bg-night-surface dark:placeholder:text-night-mist/60"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-2xl bg-sage-soft px-4 py-4 text-sm font-medium text-sage-deep disabled:opacity-40 dark:bg-night-surface dark:text-sage"
        >
          Add
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {record.thoughts.map((t, i) => (
          <motion.div
            key={`${i}-${t.text}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm transition-colors ${
              t.isHot
                ? 'bg-sage-deep text-white dark:bg-sage dark:text-night-bg'
                : 'bg-surface dark:bg-night-surface'
            }`}
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'setHot', index: i })}
              className="min-w-0 flex-1 text-left text-sm leading-relaxed"
            >
              {t.text}
              {t.isHot && <span className="mt-1 block text-xs opacity-75">the one that stings</span>}
            </button>
            <button
              type="button"
              aria-label={`Remove thought: ${t.text}`}
              onClick={() => dispatch({ type: 'removeThought', index: i })}
              className="p-1 opacity-60"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </StepShell>
  );
}
```

`src/screens/steps/ForkStep.tsx`:
```tsx
import { Button, StepShell } from '../../components/ui';

export default function ForkStep({
  onKeepGoing,
  onSaveForLater,
}: {
  onKeepGoing: () => void;
  onSaveForLater: () => void;
}) {
  return (
    <StepShell
      title="Saved. Want to keep going?"
      subtitle="You can work through the rest now, or come back when you have a quieter moment. It'll be waiting on the home screen."
    >
      <div className="mt-2 flex flex-col gap-3">
        <Button onClick={onKeepGoing}>Keep going</Button>
        <Button variant="secondary" onClick={onSaveForLater}>
          Save for later
        </Button>
      </div>
    </StepShell>
  );
}
```

- [ ] **Step 4: Write the Wizard and WizardScreen**

`src/screens/Wizard.tsx`:
```tsx
import { useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ThoughtRecord } from '../lib/types';
import {
  canProceed,
  currentStep,
  initWizard,
  wizardReducer,
  type WizardMode,
} from '../lib/wizard';
import { saveRecord } from '../lib/repository';
import { Button, ProgressDots, StepShell } from '../components/ui';
import SituationStep from './steps/SituationStep';
import EmotionsStep from './steps/EmotionsStep';
import ThoughtsStep from './steps/ThoughtsStep';
import ForkStep from './steps/ForkStep';

export default function Wizard({
  initialRecord,
  mode,
}: {
  initialRecord: ThoughtRecord;
  mode: WizardMode;
}) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(wizardReducer, initWizard(initialRecord, mode));
  const step = currentStep(state);

  // Autosave whenever the step index changes (not on every keystroke).
  const prevStepIndex = useRef(state.stepIndex);
  useEffect(() => {
    if (prevStepIndex.current === state.stepIndex) return;
    prevStepIndex.current = state.stepIndex;
    void saveRecord(state.record).then((id) => {
      if (state.record.id === undefined) dispatch({ type: 'patch', fields: { id } });
    });
  }, [state.stepIndex, state.record]);

  // Completing: crossing into 'done' on an open record marks it completed.
  const handleNext = () => {
    const nextStep = state.steps[state.stepIndex + 1];
    if (nextStep === 'done' && state.record.status === 'open') {
      dispatch({
        type: 'patch',
        fields: { status: 'completed', completedAt: new Date().toISOString() },
      });
    }
    dispatch({ type: 'next' });
  };

  const exit = async () => {
    const worthKeeping = state.record.id !== undefined || state.record.situation.trim() !== '';
    if (worthKeeping) await saveRecord(state.record);
    navigate('/');
  };

  const handleBack = () => {
    if (state.stepIndex === 0) void exit();
    else dispatch({ type: 'back' });
  };

  const dotsTotal = state.steps.length - 1; // 'done' gets no dot
  const showChrome = step !== 'done';
  const showFooter = showChrome && step !== 'fork';

  return (
    <div className="flex min-h-screen flex-col pt-4">
      {showChrome && (
        <header className="mb-6 flex items-center justify-between">
          <button type="button" onClick={handleBack} aria-label="Back" className="p-2 text-mist dark:text-night-mist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <ProgressDots current={Math.min(state.stepIndex, dotsTotal - 1)} total={dotsTotal} />
          <button type="button" onClick={() => void exit()} aria-label="Close" className="p-2 text-mist dark:text-night-mist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
      )}

      <div className="flex-1">
        {/* keying by step remounts StepShell so its enter animation plays on every step change */}
        <div key={step}>
            {step === 'situation' && <SituationStep record={state.record} dispatch={dispatch} />}
            {step === 'emotions' && <EmotionsStep record={state.record} dispatch={dispatch} />}
            {step === 'thoughts' && <ThoughtsStep record={state.record} dispatch={dispatch} />}
            {step === 'fork' && (
              <ForkStep onKeepGoing={handleNext} onSaveForLater={() => navigate('/')} />
            )}
            {/* RESTRUCTURE_STUB — Task 8 replaces this block with the real restructure steps */}
            {(step === 'evidenceFor' ||
              step === 'evidenceAgainst' ||
              step === 'distortions' ||
              step === 'balanced' ||
              step === 'rerate' ||
              step === 'done') && (
              <StepShell title="Coming soon" subtitle="The restructuring steps arrive in the next task." />
            )}
        </div>
      </div>

      {showFooter && (
        <footer className="sticky bottom-0 -mx-5 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-8 pt-4 dark:from-night-bg dark:via-night-bg">
          <Button
            onClick={handleNext}
            disabled={!canProceed(state)}
            className="w-full"
          >
            Next
          </Button>
        </footer>
      )}
    </div>
  );
}
```

`src/screens/WizardScreen.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ThoughtRecord } from '../lib/types';
import type { WizardMode } from '../lib/wizard';
import { getRecord, newRecord } from '../lib/repository';
import Wizard from './Wizard';

export default function WizardScreen({ mode }: { mode: WizardMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ThoughtRecord | null>(null);

  useEffect(() => {
    if (mode === 'new') {
      setRecord(newRecord());
      return;
    }
    void getRecord(Number(id)).then((r) => {
      if (r) setRecord(r);
      else navigate('/');
    });
  }, [mode, id, navigate]);

  if (!record) return null;
  return <Wizard initialRecord={record} mode={mode} />;
}
```

- [ ] **Step 5: Register the routes**

In `src/App.tsx`, add the import and routes:
```tsx
import WizardScreen from './screens/WizardScreen';
```
and inside `<Routes>` after the `/` route:
```tsx
<Route path="/new" element={<WizardScreen mode="new" />} />
<Route path="/complete/:id" element={<WizardScreen mode="complete" />} />
<Route path="/edit/:id" element={<WizardScreen mode="edit" />} />
```

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add wizard shell and capture steps with save-for-later fork"
```

---
### Task 8: Restructure steps (evidence, distortions, balanced, rerate, done)

**Files:**
- Create: `src/screens/steps/EvidenceStep.tsx`, `src/screens/steps/DistortionsStep.tsx`, `src/screens/steps/BalancedStep.tsx`, `src/screens/steps/RerateStep.tsx`, `src/screens/steps/DoneStep.tsx`
- Modify: `src/screens/Wizard.tsx` (replace the `RESTRUCTURE_STUB` block)
- Test: `src/screens/restructure.test.tsx`

**Interfaces:**
- Consumes: step contract from Task 7 (`{ record, dispatch }`), wizard machine (Task 5), `hotThought` (Task 2), `DISTORTIONS` (Task 2), `EmotionSummary` (Task 6), UI primitives (Task 4).
- Produces: `EvidenceStep` additionally takes `kind: 'for' | 'against'`; `DoneStep` takes `{ record: ThoughtRecord; onFinish: () => void }`.

- [ ] **Step 1: Write the failing test**

`src/screens/restructure.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord, saveRecord } from '../lib/repository';
import type { ThoughtRecord } from '../lib/types';
import Wizard from './Wizard';

beforeEach(async () => {
  await db.records.clear();
});

async function captured(): Promise<ThoughtRecord> {
  const r = newRecord();
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  r.thoughts = [{ text: 'I will be fired', isHot: true }];
  await saveRecord(r);
  return r;
}

test('complete mode walks evidence → distortions → balanced → rerate → done and completes the record', async () => {
  const r = await captured();
  render(
    <HashRouter>
      <Wizard initialRecord={r} mode="complete" />
    </HashRouter>,
  );

  // Evidence for — shows the hot thought, is skippable
  expect(await screen.findByText('What makes this thought feel true?')).toBeInTheDocument();
  expect(screen.getByText(/I will be fired/)).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'My manager was short with me');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Evidence against
  expect(await screen.findByText("What doesn't fit that thought?")).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Distortions — tap one
  expect(await screen.findByText('Spot any patterns?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Catastrophising/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Balanced — required
  expect(await screen.findByText('What would a fairer take be?')).toBeInTheDocument();
  const next = screen.getByRole('button', { name: 'Next' });
  expect(next).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox'), 'One tense chat is not a firing');
  await userEvent.click(next);

  // Rerate — slider prefilled with before value
  expect(await screen.findByText('How do those feelings sit now?')).toBeInTheDocument();
  expect(screen.getByRole('slider')).toHaveValue('80');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Done — shows the drop and persists completion
  expect(await screen.findByText('Well done.')).toBeInTheDocument();
  expect(screen.getByText(/Anxious 80/)).toBeInTheDocument();
  const saved = await db.records.get(r.id!);
  expect(saved?.status).toBe('completed');
  expect(saved?.distortions).toEqual(['Catastrophising']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/restructure.test.tsx`
Expected: FAIL — steps show the "Coming soon" stub instead of real content.

- [ ] **Step 3: Write the restructure step components**

`src/screens/steps/EvidenceStep.tsx`:
```tsx
import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { hotThought } from '../../lib/repository';
import { AutoTextArea, StepShell } from '../../components/ui';

export default function EvidenceStep({
  record,
  dispatch,
  kind,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
  kind: 'for' | 'against';
}) {
  const field = kind === 'for' ? 'evidenceFor' : 'evidenceAgainst';
  return (
    <StepShell
      title={kind === 'for' ? 'What makes this thought feel true?' : "What doesn't fit that thought?"}
      subtitle={
        kind === 'for'
          ? 'Facts only, not feelings. It’s okay if there are some.'
          : 'Facts that don’t line up with it — or what you’d point out to a friend who thought this.'
      }
    >
      <blockquote className="rounded-2xl border-l-4 border-sage bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:border-sage dark:bg-night-surface">
        “{hotThought(record)}”
      </blockquote>
      <AutoTextArea
        value={record[field]}
        onChange={(v) =>
          dispatch({
            type: 'patch',
            fields: kind === 'for' ? { evidenceFor: v } : { evidenceAgainst: v },
          })
        }
        placeholder={kind === 'for' ? 'What backs it up…' : 'What doesn’t add up…'}
      />
      <p className="text-xs text-mist dark:text-night-mist">Nothing coming? That’s fine — just tap Next.</p>
    </StepShell>
  );
}
```

`src/screens/steps/DistortionsStep.tsx`:
```tsx
import type { Dispatch } from 'react';
import { motion } from 'framer-motion';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { DISTORTIONS } from '../../lib/constants';
import { StepShell } from '../../components/ui';

export default function DistortionsStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="Spot any patterns?"
      subtitle="These are common thinking traps. Tag any that fit the thought — or none at all."
    >
      <div className="flex flex-col gap-2">
        {DISTORTIONS.map((d) => {
          const selected = record.distortions.includes(d.name);
          return (
            <motion.button
              key={d.name}
              type="button"
              whileTap={{ scale: 0.98 }}
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'toggleDistortion', name: d.name })}
              className={`rounded-2xl p-4 text-left transition-colors ${
                selected
                  ? 'bg-sage-deep text-white dark:bg-sage dark:text-night-bg'
                  : 'bg-surface shadow-sm dark:bg-night-surface'
              }`}
            >
              <span className="block text-sm font-medium">{d.name}</span>
              <span className={`mt-0.5 block text-xs leading-relaxed ${selected ? 'opacity-80' : 'text-mist dark:text-night-mist'}`}>
                {d.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}
```

`src/screens/steps/BalancedStep.tsx`:
```tsx
import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { hotThought } from '../../lib/repository';
import { AutoTextArea, StepShell } from '../../components/ui';

export default function BalancedStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="What would a fairer take be?"
      subtitle="Something believable that accounts for both sides — not forced positivity. What would you tell a friend?"
    >
      <blockquote className="rounded-2xl border-l-4 border-sage bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:border-sage dark:bg-night-surface">
        “{hotThought(record)}”
      </blockquote>
      {(record.evidenceFor || record.evidenceAgainst) && (
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-mist dark:text-night-mist">
          {record.evidenceFor && <p><span className="font-medium">For:</span> {record.evidenceFor}</p>}
          {record.evidenceAgainst && <p><span className="font-medium">Against:</span> {record.evidenceAgainst}</p>}
        </div>
      )}
      <AutoTextArea
        value={record.balancedThought}
        onChange={(v) => dispatch({ type: 'patch', fields: { balancedThought: v } })}
        placeholder="A more even-handed way to see it…"
      />
    </StepShell>
  );
}
```

`src/screens/steps/RerateStep.tsx`:
```tsx
import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { IntensitySlider, StepShell } from '../../components/ui';

export default function RerateStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="How do those feelings sit now?"
      subtitle="With your balanced thought in mind, rate the same feelings again. Any shift counts — it doesn't have to reach zero."
    >
      <div className="flex flex-col gap-3">
        {record.emotions.map((e) => (
          <IntensitySlider
            key={e.emotion}
            label={e.emotion}
            value={e.after ?? e.before}
            hint={`was ${e.before}`}
            onChange={(v) => dispatch({ type: 'setAfter', emotion: e.emotion, value: v })}
          />
        ))}
      </div>
    </StepShell>
  );
}
```

`src/screens/steps/DoneStep.tsx`:
```tsx
import type { ThoughtRecord } from '../../lib/types';
import { Button, StepShell } from '../../components/ui';
import { EmotionSummary } from '../../components/RecordCard';

export default function DoneStep({
  record,
  onFinish,
}: {
  record: ThoughtRecord;
  onFinish: () => void;
}) {
  return (
    <StepShell
      title="Well done."
      subtitle="Working through this takes real effort. Here's how the feelings shifted:"
    >
      <div className="flex flex-wrap gap-2">
        {record.emotions.map((e) => (
          <EmotionSummary key={e.emotion} rating={e} />
        ))}
      </div>
      {record.balancedThought && (
        <blockquote className="rounded-2xl bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:bg-night-surface">
          “{record.balancedThought}”
        </blockquote>
      )}
      <div className="mt-4">
        <Button onClick={onFinish} className="w-full">
          Back home
        </Button>
      </div>
    </StepShell>
  );
}
```

- [ ] **Step 4: Replace the stub in the Wizard**

In `src/screens/Wizard.tsx`:

Add imports:
```tsx
import EvidenceStep from './steps/EvidenceStep';
import DistortionsStep from './steps/DistortionsStep';
import BalancedStep from './steps/BalancedStep';
import RerateStep from './steps/RerateStep';
import DoneStep from './steps/DoneStep';
```

Replace the whole `RESTRUCTURE_STUB` block (the comment plus the `(step === 'evidenceFor' || …)` conditional rendering the "Coming soon" StepShell) with:
```tsx
{step === 'evidenceFor' && <EvidenceStep record={state.record} dispatch={dispatch} kind="for" />}
{step === 'evidenceAgainst' && <EvidenceStep record={state.record} dispatch={dispatch} kind="against" />}
{step === 'distortions' && <DistortionsStep record={state.record} dispatch={dispatch} />}
{step === 'balanced' && <BalancedStep record={state.record} dispatch={dispatch} />}
{step === 'rerate' && <RerateStep record={state.record} dispatch={dispatch} />}
{step === 'done' && <DoneStep record={state.record} onFinish={() => navigate('/')} />}
```
Then remove the now-unused `StepShell` import from Wizard.tsx if nothing else uses it.

- [ ] **Step 5: Run all tests**

Run: `npx vitest run`
Expected: all PASS (including Task 7's wizard tests, unchanged).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add restructuring steps and completion summary"
```

---

### Task 9: Record list and record detail screens

**Files:**
- Create: `src/screens/RecordListScreen.tsx`, `src/screens/RecordDetailScreen.tsx`
- Modify: `src/App.tsx` (add `/records` and `/record/:id` routes)
- Test: `src/screens/RecordDetailScreen.test.tsx`

**Interfaces:**
- Consumes: repository (Task 2), `RecordCard`/`EmotionSummary` (Task 6), `ConfirmSheet`, `Button` (Task 4), `formatFullDate` (Task 4), `DISTORTIONS` names stored on records.
- Produces: default exports `RecordListScreen`, `RecordDetailScreen`.

- [ ] **Step 1: Write the failing test**

`src/screens/RecordDetailScreen.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { completeRecord, newRecord, saveRecord } from '../lib/repository';
import RecordDetailScreen from './RecordDetailScreen';

beforeEach(async () => {
  await db.records.clear();
});

async function seedCompleted() {
  const r = newRecord();
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: 45 }];
  r.thoughts = [{ text: 'I will be fired', isHot: true }];
  r.evidenceFor = 'Manager was short with me';
  r.evidenceAgainst = 'Good review last month';
  r.distortions = ['Catastrophising'];
  r.balancedThought = 'One tense chat is not a firing';
  await saveRecord(r);
  await completeRecord(r);
  return r;
}

function renderDetail(id: number) {
  return render(
    <MemoryRouter initialEntries={[`/record/${id}`]}>
      <Routes>
        <Route path="/record/:id" element={<RecordDetailScreen />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('shows every section of a completed record', async () => {
  const r = await seedCompleted();
  renderDetail(r.id!);
  expect(await screen.findByText('Argument at work')).toBeInTheDocument();
  expect(screen.getByText(/80 → 45/)).toBeInTheDocument();
  expect(screen.getByText('I will be fired')).toBeInTheDocument();
  expect(screen.getByText('Manager was short with me')).toBeInTheDocument();
  expect(screen.getByText('Good review last month')).toBeInTheDocument();
  expect(screen.getByText('Catastrophising')).toBeInTheDocument();
  expect(screen.getByText('One tense chat is not a firing')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
});

test('open records offer Continue instead of Edit', async () => {
  const r = newRecord();
  r.situation = 'Half captured';
  await saveRecord(r);
  renderDetail(r.id!);
  expect(await screen.findByRole('link', { name: 'Continue' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
});

test('delete asks for confirmation then removes the record', async () => {
  const r = await seedCompleted();
  renderDetail(r.id!);
  await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
  expect(screen.getByText('Delete this record?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Delete record' }));
  expect(await screen.findByText('home')).toBeInTheDocument();
  expect(await db.records.count()).toBe(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/RecordDetailScreen.test.tsx`
Expected: FAIL — cannot resolve `./RecordDetailScreen`.

- [ ] **Step 3: Write the list screen**

`src/screens/RecordListScreen.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { listCompletedRecords, listOpenRecords } from '../lib/repository';
import { RecordCard } from '../components/RecordCard';

export default function RecordListScreen() {
  const open = useLiveQuery(listOpenRecords, [], []);
  const completed = useLiveQuery(listCompletedRecords, [], []);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <header className="flex items-center gap-3">
        <Link to="/" aria-label="Back" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-medium">All records</h1>
      </header>
      {open.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">To finish</h2>
          {open.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </section>
      )}
      <section className="flex flex-col gap-3">
        {completed.map((r) => (
          <RecordCard key={r.id} record={r} />
        ))}
        {open.length === 0 && completed.length === 0 && (
          <p className="mt-8 text-center text-sm text-mist dark:text-night-mist">Nothing here yet.</p>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Write the detail screen**

`src/screens/RecordDetailScreen.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ThoughtRecord } from '../lib/types';
import { deleteRecord, getRecord } from '../lib/repository';
import { formatFullDate } from '../lib/format';
import { ConfirmSheet } from '../components/ui';
import { EmotionSummary } from '../components/RecordCard';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-wide text-mist dark:text-night-mist">{label}</h2>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function RecordDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ThoughtRecord | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    void getRecord(Number(id)).then((r) => {
      if (r) setRecord(r);
      else navigate('/');
    });
  }, [id, navigate]);

  if (!record) return null;

  const remove = async () => {
    await deleteRecord(record.id!);
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-10">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Link
          to={record.status === 'open' ? `/complete/${record.id}` : `/edit/${record.id}`}
          className="rounded-full bg-sage-soft px-4 py-2 text-sm font-medium text-sage-deep dark:bg-night-surface dark:text-sage"
        >
          {record.status === 'open' ? 'Continue' : 'Edit'}
        </Link>
      </header>

      <div>
        <p className="text-xs text-mist dark:text-night-mist">{formatFullDate(record.createdAt)}</p>
        <h1 className="mt-1 font-display text-xl font-medium leading-snug">{record.situation}</h1>
      </div>

      {record.emotions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {record.emotions.map((e) => (
            <EmotionSummary key={e.emotion} rating={e} />
          ))}
        </div>
      )}

      {record.thoughts.length > 0 && (
        <Section label="What went through my mind">
          <ul className="flex flex-col gap-1">
            {record.thoughts.map((t, i) => (
              <li key={i} className={t.isHot ? 'font-medium' : ''}>
                {t.text}
                {t.isHot && <span className="ml-2 text-xs text-sage-deep dark:text-sage">hot thought</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {record.evidenceFor && <Section label="Evidence for">{record.evidenceFor}</Section>}
      {record.evidenceAgainst && <Section label="Evidence against">{record.evidenceAgainst}</Section>}

      {record.distortions.length > 0 && (
        <Section label="Thinking traps">
          <div className="flex flex-wrap gap-1.5">
            {record.distortions.map((d) => (
              <span key={d} className="rounded-full bg-blue-soft px-2.5 py-1 text-xs font-medium text-blue-dusty dark:bg-night-surface">
                {d}
              </span>
            ))}
          </div>
        </Section>
      )}

      {record.balancedThought && (
        <Section label="A fairer take">
          <blockquote className="rounded-2xl bg-sage-soft/60 p-4 italic dark:bg-night-surface">
            “{record.balancedThought}”
          </blockquote>
        </Section>
      )}

      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-4 self-center text-sm text-red-800/80 dark:text-red-400/80"
      >
        Delete
      </button>

      <ConfirmSheet
        open={confirming}
        title="Delete this record?"
        body="It will be gone from this device for good. If you've exported a backup, it stays in that file."
        confirmLabel="Delete record"
        onConfirm={() => void remove()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
```

- [ ] **Step 5: Register the routes**

In `src/App.tsx`, add imports:
```tsx
import RecordListScreen from './screens/RecordListScreen';
import RecordDetailScreen from './screens/RecordDetailScreen';
```
and inside `<Routes>`:
```tsx
<Route path="/records" element={<RecordListScreen />} />
<Route path="/record/:id" element={<RecordDetailScreen />} />
```

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add record list and detail screens with delete confirmation"
```

---
### Task 10: Settings screen and export nudge

**Files:**
- Create: `src/screens/SettingsScreen.tsx`, `src/components/ExportNudge.tsx`
- Modify: `src/App.tsx` (add `/settings` route), `src/screens/HomeScreen.tsx` (mount `<ExportNudge />`)
- Test: `src/screens/SettingsScreen.test.tsx`

**Interfaces:**
- Consumes: backup module (Task 3), repository custom-emotion functions (Task 2), UI primitives (Task 4), `formatRelative` (Task 4).
- Produces: default exports `SettingsScreen`, `ExportNudge`.

- [ ] **Step 1: Write the failing test**

`src/screens/SettingsScreen.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { addCustomEmotion, listCustomEmotions } from '../lib/repository';
import SettingsScreen from './SettingsScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
});

function renderSettings() {
  return render(
    <HashRouter>
      <SettingsScreen />
    </HashRouter>,
  );
}

test('shows export section with never-exported state', async () => {
  renderSettings();
  expect(await screen.findByRole('button', { name: 'Export backup' })).toBeInTheDocument();
  expect(screen.getByText(/Never exported/)).toBeInTheDocument();
});

test('lists custom emotions and removes one', async () => {
  await addCustomEmotion('Restless');
  renderSettings();
  expect(await screen.findByText('Restless')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Remove Restless' }));
  expect(await listCustomEmotions()).toHaveLength(0);
});

test('states the privacy promise', async () => {
  renderSettings();
  expect(await screen.findByText(/never leaves this device/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/SettingsScreen.test.tsx`
Expected: FAIL — cannot resolve `./SettingsScreen`.

- [ ] **Step 3: Write the settings screen**

`src/screens/SettingsScreen.tsx`:
```tsx
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { downloadBackup, getLastExportAt, parseBackup, restoreBackup, type BackupFile } from '../lib/backup';
import { listCustomEmotions, removeCustomEmotion } from '../lib/repository';
import { formatRelative } from '../lib/format';
import { Button, ConfirmSheet } from '../components/ui';

export default function SettingsScreen() {
  const lastExport = useLiveQuery(getLastExportAt, [], null);
  const custom = useLiveQuery(listCustomEmotions, [], []);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  const onFile = async (file: File) => {
    setError(null);
    try {
      setPending(parseBackup(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.');
    }
  };

  const doImport = async () => {
    if (!pending) return;
    await restoreBackup(pending);
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-8 pt-4 pb-10">
      <header className="flex items-center gap-3">
        <Link to="/" aria-label="Back" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-medium">Settings</h1>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Backup</h2>
        <p className="text-sm leading-relaxed text-mist dark:text-night-mist">
          Your records live only on this device. Export a backup file now and then and keep it somewhere safe.
        </p>
        <Button
          onClick={() => {
            void downloadBackup().then(() => setExported(true));
          }}
        >
          Export backup
        </Button>
        <p className="text-xs text-mist dark:text-night-mist">
          {exported
            ? 'Backup exported just now.'
            : lastExport
              ? `Last exported ${formatRelative(lastExport)}.`
              : 'Never exported yet.'}
        </p>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          Import backup
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Backup file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = '';
          }}
        />
        {error && <p className="text-xs text-red-800/80 dark:text-red-400/80">{error}</p>}
      </section>

      {custom.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
            Your emotion words
          </h2>
          <div className="flex flex-col gap-2">
            {custom.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm dark:bg-night-surface">
                <span className="text-sm">{c.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => void removeCustomEmotion(c.id!)}
                  className="p-1 text-mist dark:text-night-mist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Privacy</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mist dark:text-night-mist">
          Everything you write is stored on your phone and never leaves this device. There is no account, no server
          and no tracking of any kind.
        </p>
      </section>

      <ConfirmSheet
        open={pending !== null}
        title="Replace everything?"
        body={`This will replace what's currently in the app with the backup (${pending?.records.length ?? 0} records). This can't be undone.`}
        confirmLabel="Replace and import"
        onConfirm={() => void doImport()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write the export nudge and mount it**

`src/components/ExportNudge.tsx`:
```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getLastExportAt, shouldNudgeExport } from '../lib/backup';
import { db } from '../lib/db';

export default function ExportNudge() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('exportNudgeDismissed') === '1',
  );
  const show = useLiveQuery(
    async () => {
      const lastExport = await getLastExportAt();
      const newest = await db.records.orderBy('createdAt').last();
      return shouldNudgeExport(lastExport, newest?.createdAt ?? null, new Date());
    },
    [],
    false,
  );

  if (!show || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-blue-soft p-4 dark:bg-night-surface">
      <p className="text-sm leading-relaxed">
        It's been a while —{' '}
        <Link to="/settings" className="font-medium text-blue-dusty underline">
          back up your records
        </Link>{' '}
        so they're safe.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem('exportNudgeDismissed', '1');
          setDismissed(true);
        }}
        className="p-1 text-mist dark:text-night-mist"
      >
        ✕
      </button>
    </div>
  );
}
```

In `src/screens/HomeScreen.tsx`: add `import ExportNudge from '../components/ExportNudge';` and render `<ExportNudge />` directly above the `<motion.div>` that wraps the New record link (inside the top-level flex column, after `</header>`).

- [ ] **Step 5: Register the route**

In `src/App.tsx`, add `import SettingsScreen from './screens/SettingsScreen';` and inside `<Routes>`:
```tsx
<Route path="/settings" element={<SettingsScreen />} />
```

- [ ] **Step 6: Run all tests**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add settings with backup export/import and export nudge"
```

---

### Task 11: PWA — installability, icons, iOS install nudge, persistent storage

**Files:**
- Create: `public/logo.svg`, `pwa-assets.config.ts`, `src/lib/install.ts`, `src/components/InstallNudge.tsx`
- Modify: `vite.config.ts`, `src/main.tsx`, `src/screens/HomeScreen.tsx` (mount `<InstallNudge />`)
- Test: `src/lib/install.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `shouldShowInstallNudge(userAgent: string, isStandalone: boolean, dismissed: boolean): boolean` from `src/lib/install.ts`.

- [ ] **Step 1: Install PWA tooling**

```bash
npm install -D vite-plugin-pwa @vite-pwa/assets-generator
```

- [ ] **Step 2: Write the failing test**

`src/lib/install.test.ts`:
```ts
import { expect, test } from 'vitest';
import { shouldShowInstallNudge } from './install';

const IOS_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const MAC_CHROME =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

test('shows on iPhone Safari when not installed', () => {
  expect(shouldShowInstallNudge(IOS_SAFARI, false, false)).toBe(true);
});
test('hidden once installed (standalone)', () => {
  expect(shouldShowInstallNudge(IOS_SAFARI, true, false)).toBe(false);
});
test('hidden when dismissed', () => {
  expect(shouldShowInstallNudge(IOS_SAFARI, false, true)).toBe(false);
});
test('hidden on non-iOS browsers', () => {
  expect(shouldShowInstallNudge(MAC_CHROME, false, false)).toBe(false);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/install.test.ts`
Expected: FAIL — cannot resolve `./install`.

- [ ] **Step 4: Write the install predicate and nudge**

`src/lib/install.ts`:
```ts
export function shouldShowInstallNudge(
  userAgent: string,
  isStandalone: boolean,
  dismissed: boolean,
): boolean {
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  return isIos && !isStandalone && !dismissed;
}

export function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}
```

`src/components/InstallNudge.tsx`:
```tsx
import { useState } from 'react';
import { isStandaloneDisplay, shouldShowInstallNudge } from '../lib/install';

const DISMISS_KEY = 'installNudgeDismissed';

export default function InstallNudge() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');
  if (!shouldShowInstallNudge(navigator.userAgent, isStandaloneDisplay(), dismissed)) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-sage-soft p-4 dark:bg-night-surface">
      <p className="text-sm leading-relaxed">
        <span className="font-medium">Add this to your Home Screen</span> so your records are kept
        safe: tap the Share button, then <span className="whitespace-nowrap">“Add to Home Screen”</span>.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1');
          setDismissed(true);
        }}
        className="p-1 text-mist dark:text-night-mist"
      >
        ✕
      </button>
    </div>
  );
}
```

In `src/screens/HomeScreen.tsx`: add `import InstallNudge from '../components/InstallNudge';` and render `<InstallNudge />` directly after `</header>` (above `<ExportNudge />`).

- [ ] **Step 5: Add the icon source and generate icons**

`public/logo.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#5F7D6A"/>
  <circle cx="266" cy="220" r="112" fill="#FAF8F4"/>
  <circle cx="182" cy="352" r="36" fill="#FAF8F4"/>
  <circle cx="134" cy="408" r="18" fill="#FAF8F4"/>
</svg>
```

`pwa-assets.config.ts`:
```ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo.svg'],
});
```

Run: `npm run icons`
Expected: PNG icons appear in `public/` (do not delete them — they get committed).

- [ ] **Step 6: Wire the PWA plugin and persistent storage**

`vite.config.ts` (full replacement):
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/CRWebApp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      manifest: {
        name: 'Thought Records',
        short_name: 'Thoughts',
        description: 'Private CBT thought records — everything stays on your device.',
        display: 'standalone',
        theme_color: '#FAF8F4',
        background_color: '#FAF8F4',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

In `src/main.tsx`, after the imports and before `ReactDOM.createRoot(...)`, add:
```ts
// Ask the browser not to evict our IndexedDB data under storage pressure.
if (navigator.storage?.persist) void navigator.storage.persist();
```

- [ ] **Step 7: Run all tests and the build**

Run: `npx vitest run`
Expected: all PASS.

Run: `npm run build`
Expected: build succeeds; `dist/` contains `manifest.webmanifest`, a service worker (`sw.js`), and the generated icons.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: make the app an installable PWA with iOS install nudge"
```

---

### Task 12: Final verification and README

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: the finished, verified branch.

- [ ] **Step 1: Write the README**

`README.md`:
```markdown
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

- Calm, minimal, low-stimulation: sage/dusty-blue on warm off-white, automatic
  dark mode, one question per screen in the wizard.
- Two-phase flow: a quick capture saves an "open" record that waits on the home
  screen; completing the evidence/reframe steps closes it.
- Animations respect the system "reduce motion" setting.
```

- [ ] **Step 2: Full verification**

Run: `npx vitest run`
Expected: every test in the suite passes.

Run: `npm run build`
Expected: clean type-check and build.

Run: `npm run preview` in the background, then `curl -s http://localhost:4173/CRWebApp/ | head -20`
Expected: HTML containing `<title>Thought Records</title>`. Kill the preview server afterwards.

- [ ] **Step 3: Verify nothing references main/master and no deploy commands exist**

```bash
git branch --show-current   # must print: thought-records-app
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: add README with development and manual deploy notes"
```
