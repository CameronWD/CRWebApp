import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// Adjustment from the spec: the project's global test environment is jsdom
// (see vite.config.ts), and jsdom polyfills the global `URL` constructor with
// its own implementation, which resolves `new URL('../x', import.meta.url)`
// against the fake jsdom window location instead of the real module URL —
// `readFileSync(new URL(...))` then fails with "URL must be of scheme file".
// Resolving the path through node:url's `fileURLToPath` (which works on the
// plain import.meta.url string, unaffected by the global URL patch) sidesteps
// that without needing a per-file environment override.
const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../index.css'), 'utf8');

function tokensOf(block: string): string[] {
  return [...block.matchAll(/--c-[a-z-]+(?=:)/g)].map((m) => m[0]).sort();
}

test('all four theme blocks declare an identical set of 13 tokens', () => {
  const blocks = [...css.matchAll(/:root(?:\[data-theme='(?:dusk|ocean|sand)'\])?\s*\{([^}]+)\}/g)].map((m) => m[1]);
  expect(blocks).toHaveLength(4);
  const reference = tokensOf(blocks[0]);
  expect(reference).toHaveLength(13);
  for (const block of blocks.slice(1)) {
    expect(tokensOf(block)).toEqual(reference);
  }
});
