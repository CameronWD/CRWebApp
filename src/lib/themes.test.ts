import { beforeEach, expect, test } from 'vitest';
import { applyTheme, DEFAULT_THEME, initTheme, isThemeId, storedTheme, THEMES } from './themes';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

test('exactly four themes, sage first', () => {
  expect(THEMES.map((t) => t.id)).toEqual(['sage', 'dusk', 'ocean', 'sand']);
  expect(DEFAULT_THEME).toBe('sage');
});

test('applyTheme sets the html attribute and persists', () => {
  applyTheme('ocean');
  expect(document.documentElement.dataset.theme).toBe('ocean');
  expect(localStorage.getItem('theme')).toBe('ocean');
});

test('storedTheme falls back to the default on garbage', () => {
  localStorage.setItem('theme', 'neon');
  expect(storedTheme()).toBe(DEFAULT_THEME);
});

test('initTheme applies the stored theme at boot', () => {
  localStorage.setItem('theme', 'sand');
  initTheme();
  expect(document.documentElement.dataset.theme).toBe('sand');
});

test('isThemeId accepts ids and rejects everything else', () => {
  expect(isThemeId('dusk')).toBe(true);
  expect(isThemeId('pink')).toBe(false);
  expect(isThemeId(3)).toBe(false);
});
