import { beforeEach, expect, test } from 'vitest';
import { applyTheme, DEFAULT_THEME, initTheme, isThemeId, storedTheme, THEMES } from './themes';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.remove();
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

test('applyTheme keeps the theme-color meta in step (light scheme)', () => {
  applyTheme('sand');
  const meta = document.querySelector('meta[name="theme-color"]');
  expect(meta?.getAttribute('content')).toBe('#FAF6F0');
});

test('syncThemeColor creates the meta when missing and initTheme syncs it', () => {
  localStorage.setItem('theme', 'ocean');
  initTheme();
  const meta = document.querySelector('meta[name="theme-color"]');
  expect(meta?.getAttribute('content')).toBe('#F4F7F9');
});

test('syncThemeColor uses the night colour when the scheme is dark', () => {
  const original = window.matchMedia;
  window.matchMedia = ((q: string) =>
    ({
      matches: true,
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
  try {
    applyTheme('sand');
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#201B17');
  } finally {
    window.matchMedia = original;
  }
});

test('initTheme re-syncs the meta when the colour scheme flips', () => {
  const original = window.matchMedia;
  let matches = false;
  let handler: (() => void) | undefined;
  window.matchMedia = ((q: string) =>
    ({
      get matches() {
        return matches;
      },
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_: string, h: () => void) => {
        handler = h;
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
  try {
    localStorage.setItem('theme', 'ocean');
    initTheme();
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#F4F7F9');
    matches = true;
    handler?.();
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#161C20');
  } finally {
    window.matchMedia = original;
  }
});
