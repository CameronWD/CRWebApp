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
