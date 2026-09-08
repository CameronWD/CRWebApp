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
    [
      'record missing situation',
      JSON.stringify({
        app: 'thought-records',
        version: 1,
        exportedAt: 'x',
        records: [
          {
            status: 'open',
            createdAt: 'x',
            updatedAt: 'x',
            completedAt: null,
            emotions: [],
            thoughts: [],
            evidenceFor: '',
            evidenceAgainst: '',
            distortions: [],
            balancedThought: '',
          },
        ],
        customEmotions: [],
      }),
    ],
    [
      'record with emotions not an array',
      JSON.stringify({
        app: 'thought-records',
        version: 1,
        exportedAt: 'x',
        records: [
          {
            status: 'open',
            createdAt: 'x',
            updatedAt: 'x',
            completedAt: null,
            situation: '',
            emotions: 'nope',
            thoughts: [],
            evidenceFor: '',
            evidenceAgainst: '',
            distortions: [],
            balancedThought: '',
          },
        ],
        customEmotions: [],
      }),
    ],
    [
      'record with emotion.before as string',
      JSON.stringify({
        app: 'thought-records',
        version: 1,
        exportedAt: 'x',
        records: [
          {
            status: 'open',
            createdAt: 'x',
            updatedAt: 'x',
            completedAt: null,
            situation: '',
            emotions: [{ emotion: 'Anxious', before: '80', after: null }],
            thoughts: [],
            evidenceFor: '',
            evidenceAgainst: '',
            distortions: [],
            balancedThought: '',
          },
        ],
        customEmotions: [],
      }),
    ],
    [
      'customEmotion missing name',
      JSON.stringify({
        app: 'thought-records',
        version: 1,
        exportedAt: 'x',
        records: [],
        customEmotions: [{ id: 1 }],
      }),
    ],
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
