export type ThemeId = 'sage' | 'dusk' | 'ocean' | 'sand';

export interface Theme {
  id: ThemeId;
  name: string;
  // representative light-mode colours for the settings swatch: [deep accent, soft accent, paper]
  swatch: [string, string, string];
  // status-bar colours: light-mode paper and dark-mode night background
  paperLight: string;
  paperNight: string;
}

export const THEMES: Theme[] = [
  { id: 'sage', name: 'Sage', swatch: ['#5F7D6A', '#E5EDE7', '#FAF8F4'], paperLight: '#FAF8F4', paperNight: '#191D1B' },
  { id: 'dusk', name: 'Dusk', swatch: ['#6F6590', '#EAE6F2', '#F7F5FA'], paperLight: '#F7F5FA', paperNight: '#1B1922' },
  { id: 'ocean', name: 'Ocean', swatch: ['#4A6F82', '#E2ECF1', '#F4F7F9'], paperLight: '#F4F7F9', paperNight: '#161C20' },
  { id: 'sand', name: 'Sand', swatch: ['#8F5D44', '#F2E5DC', '#FAF6F0'], paperLight: '#FAF6F0', paperNight: '#201B17' },
];

export const THEME_KEY = 'theme';
export const DEFAULT_THEME: ThemeId = 'sage';

export function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

const darkScheme = () => window.matchMedia('(prefers-color-scheme: dark)');

export function syncThemeColor(id: ThemeId): void {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', darkScheme().matches ? theme.paperNight : theme.paperLight);
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  localStorage.setItem(THEME_KEY, id);
  syncThemeColor(id);
}

export function storedTheme(): ThemeId {
  const v = localStorage.getItem(THEME_KEY);
  return isThemeId(v) ? v : DEFAULT_THEME;
}

export function initTheme(): void {
  document.documentElement.dataset.theme = storedTheme();
  syncThemeColor(storedTheme());
  // Re-sync when the system flips between light and dark.
  darkScheme().addEventListener?.('change', () => syncThemeColor(storedTheme()));
}
