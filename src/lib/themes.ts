export type ThemeId = 'sage' | 'dusk' | 'ocean' | 'sand';

export interface Theme {
  id: ThemeId;
  name: string;
  // representative light-mode colours for the settings swatch: [deep accent, soft accent, paper]
  swatch: [string, string, string];
}

export const THEMES: Theme[] = [
  { id: 'sage', name: 'Sage', swatch: ['#5F7D6A', '#E5EDE7', '#FAF8F4'] },
  { id: 'dusk', name: 'Dusk', swatch: ['#6F6590', '#EAE6F2', '#F7F5FA'] },
  { id: 'ocean', name: 'Ocean', swatch: ['#4A6F82', '#E2ECF1', '#F4F7F9'] },
  { id: 'sand', name: 'Sand', swatch: ['#8F5D44', '#F2E5DC', '#FAF6F0'] },
];

export const THEME_KEY = 'theme';
export const DEFAULT_THEME: ThemeId = 'sage';

export function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

export function applyTheme(id: ThemeId): void {
  document.documentElement.dataset.theme = id;
  localStorage.setItem(THEME_KEY, id);
}

export function storedTheme(): ThemeId {
  const v = localStorage.getItem(THEME_KEY);
  return isThemeId(v) ? v : DEFAULT_THEME;
}

export function initTheme(): void {
  document.documentElement.dataset.theme = storedTheme();
}
