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
