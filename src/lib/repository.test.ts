import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './db';
import {
  addCustomEmotion,
  allEmotionNames,
  completeRecord,
  deleteRecord,
  getRecord,
  getSetting,
  hotThought,
  listCompletedRecords,
  listCustomEmotions,
  listOpenRecords,
  newRecord,
  removeCustomEmotion,
  saveRecord,
  setSetting,
} from './repository';
import { DEFAULT_EMOTIONS } from './constants';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
});

describe('records', () => {
  test('newRecord starts open and empty', () => {
    const r = newRecord();
    expect(r.status).toBe('open');
    expect(r.situation).toBe('');
    expect(r.emotions).toEqual([]);
    expect(r.completedAt).toBeNull();
    expect(r.id).toBeUndefined();
  });

  test('saveRecord assigns an id and persists', async () => {
    const r = newRecord();
    r.situation = 'Missed the bus';
    const id = await saveRecord(r);
    expect(r.id).toBe(id);
    const loaded = await getRecord(id);
    expect(loaded?.situation).toBe('Missed the bus');
  });

  test('saveRecord updates in place on second save', async () => {
    const r = newRecord();
    const id = await saveRecord(r);
    r.situation = 'edited';
    await saveRecord(r);
    expect(await db.records.count()).toBe(1);
    expect((await getRecord(id))?.situation).toBe('edited');
  });

  test('completeRecord flips status and stamps completedAt', async () => {
    const r = newRecord();
    await saveRecord(r);
    await completeRecord(r);
    const loaded = await getRecord(r.id!);
    expect(loaded?.status).toBe('completed');
    expect(loaded?.completedAt).not.toBeNull();
  });

  test('lists split by status, newest first', async () => {
    const a = newRecord();
    a.createdAt = '2026-01-01T10:00:00.000Z';
    await saveRecord(a);
    const b = newRecord();
    b.createdAt = '2026-02-01T10:00:00.000Z';
    await saveRecord(b);
    const c = newRecord();
    await saveRecord(c);
    await completeRecord(c);
    const open = await listOpenRecords();
    expect(open.map((r) => r.id)).toEqual([b.id, a.id]);
    const completed = await listCompletedRecords();
    expect(completed.map((r) => r.id)).toEqual([c.id]);
  });

  test('deleteRecord removes the record', async () => {
    const r = newRecord();
    const id = await saveRecord(r);
    await deleteRecord(id);
    expect(await getRecord(id)).toBeUndefined();
  });

  test('hotThought returns the hot thought text or empty string', () => {
    const r = newRecord();
    expect(hotThought(r)).toBe('');
    r.thoughts = [
      { text: 'nobody cares', isHot: false },
      { text: 'I always ruin things', isHot: true },
    ];
    expect(hotThought(r)).toBe('I always ruin things');
  });
});

describe('custom emotions', () => {
  test('allEmotionNames starts with the 12 defaults', async () => {
    expect(await allEmotionNames()).toEqual([...DEFAULT_EMOTIONS]);
  });

  test('addCustomEmotion trims and appends', async () => {
    await addCustomEmotion('  Restless ');
    expect(await allEmotionNames()).toContain('Restless');
  });

  test('addCustomEmotion ignores blanks and case-insensitive duplicates', async () => {
    await addCustomEmotion('   ');
    await addCustomEmotion('anxious'); // duplicate of default 'Anxious'
    await addCustomEmotion('Restless');
    await addCustomEmotion('restless'); // duplicate of custom
    expect(await listCustomEmotions()).toHaveLength(1);
  });

  test('removeCustomEmotion deletes by id', async () => {
    await addCustomEmotion('Restless');
    const [c] = await listCustomEmotions();
    await removeCustomEmotion(c.id!);
    expect(await listCustomEmotions()).toHaveLength(0);
  });
});

describe('settings', () => {
  test('get returns null when unset, value after set', async () => {
    expect(await getSetting('lastExportAt')).toBeNull();
    await setSetting('lastExportAt', '2026-09-08T00:00:00.000Z');
    expect(await getSetting('lastExportAt')).toBe('2026-09-08T00:00:00.000Z');
  });
});
