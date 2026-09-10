import { describe, expect, test } from 'vitest';
import { withFormatDefaults, type StoredRecord } from './migrate';

const legacy: StoredRecord = {
  status: 'completed',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  completedAt: '2026-01-01T01:00:00.000Z',
  situation: 'Meeting ran over',
  emotions: [{ emotion: 'Anxious', before: 80, after: 40 }],
  thoughts: [{ text: 'I ruined it', isHot: true }],
  evidenceFor: 'x',
  evidenceAgainst: 'y',
  distortions: ['Catastrophising'],
  balancedThought: 'It was one meeting',
};

describe('withFormatDefaults', () => {
  test('stamps legacy records as classic with empty realistic fields', () => {
    const r = withFormatDefaults(legacy);
    expect(r.format).toBe('classic');
    expect(r.negativeThought).toBe('');
    expect(r.beliefBefore).toBeNull();
    expect(r.alternativeThought).toBe('');
    expect(r.beliefAfter).toBeNull();
    expect(r.emotionNow).toBeNull();
    expect(r.situation).toBe('Meeting ran over');
  });

  test('leaves already-stamped records untouched', () => {
    const rt = withFormatDefaults({
      ...legacy,
      format: 'realistic',
      negativeThought: 'I always fail',
      beliefBefore: 90,
      alternativeThought: 'One overrun is not failing',
      beliefAfter: 60,
      emotionNow: { emotion: 'Calm', strength: 30 },
    });
    expect(rt.format).toBe('realistic');
    expect(rt.negativeThought).toBe('I always fail');
    expect(rt.emotionNow).toEqual({ emotion: 'Calm', strength: 30 });
  });
});
