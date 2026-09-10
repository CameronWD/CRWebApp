import { describe, expect, test } from 'vitest';
import { STEP_HELP, type StepHelp } from './stepHelp';

const WITH_EXAMPLE = [
  'situation', 'thoughts', 'negativeThought', 'balanced', 'alternative',
  'evidenceFor', 'evidenceAgainst',
] as const;

describe('STEP_HELP', () => {
  test('every entry has a title and at least one non-empty paragraph', () => {
    for (const [key, help] of Object.entries(STEP_HELP) as [string, StepHelp][]) {
      expect(help.title.trim(), key).not.toBe('');
      expect(help.paragraphs.length, key).toBeGreaterThan(0);
      for (const p of help.paragraphs) expect(p.trim(), key).not.toBe('');
    }
  });

  test('steps that used to show an example placeholder carry an example', () => {
    for (const key of WITH_EXAMPLE) {
      expect(STEP_HELP[key].example, key).toBeTruthy();
    }
  });

  test('covers every content step and nothing else', () => {
    expect(Object.keys(STEP_HELP).sort()).toEqual([
      'alternative', 'balanced', 'distortions', 'emotionBefore', 'emotionNow',
      'emotionsClassic', 'evidenceAgainst', 'evidenceFor', 'negativeThought',
      'rerate', 'situation', 'thoughts',
    ]);
  });
});
