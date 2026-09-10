import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './db';
import {
  activeThought,
  addCustomEmotion,
  allEmotionNames,
  completeRecord,
  deleteRecord,
  getRecord,
  getSetting,
  getWorksheetFormat,
  hotThought,
  listCompletedRecords,
  listCustomEmotions,
  listOpenRecords,
  newRecord,
  removeCustomEmotion,
  saveRecord,
  setSetting,
  WORKSHEET_FORMAT_KEY,
} from './repository';
import { DEFAULT_EMOTIONS } from './constants';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
});

describe('records', () => {
  test('newRecord starts open and empty', () => {
    const r = newRecord('classic');
    expect(r.status).toBe('open');
    expect(r.situation).toBe('');
    expect(r.emotions).toEqual([]);
    expect(r.completedAt).toBeNull();
    expect(r.id).toBeUndefined();
  });

  test('saveRecord assigns an id and persists', async () => {
    const r = newRecord('classic');
    r.situation = 'Missed the bus';
    const id = await saveRecord(r);
    expect(r.id).toBe(id);
    const loaded = await getRecord(id);
    expect(loaded?.situation).toBe('Missed the bus');
  });

  test('saveRecord updates in place on second save', async () => {
    const r = newRecord('classic');
    const id = await saveRecord(r);
    r.situation = 'edited';
    await saveRecord(r);
    expect(await db.records.count()).toBe(1);
    expect((await getRecord(id))?.situation).toBe('edited');
  });

  test('completeRecord flips status and stamps completedAt', async () => {
    const r = newRecord('classic');
    await saveRecord(r);
    await completeRecord(r);
    const loaded = await getRecord(r.id!);
    expect(loaded?.status).toBe('completed');
    expect(loaded?.completedAt).not.toBeNull();
  });

  test('lists split by status, newest first', async () => {
    const a = newRecord('classic');
    a.createdAt = '2026-01-01T10:00:00.000Z';
    await saveRecord(a);
    const b = newRecord('classic');
    b.createdAt = '2026-02-01T10:00:00.000Z';
    await saveRecord(b);
    const c = newRecord('classic');
    await saveRecord(c);
    await completeRecord(c);
    const open = await listOpenRecords();
    expect(open.map((r) => r.id)).toEqual([b.id, a.id]);
    const completed = await listCompletedRecords();
    expect(completed.map((r) => r.id)).toEqual([c.id]);
  });

  test('listCompletedRecords orders by completedAt, not createdAt', async () => {
    // d was created after e, but completed before it — completedAt should win.
    const d = newRecord('classic');
    d.createdAt = '2026-03-01T10:00:00.000Z';
    await saveRecord(d);
    d.status = 'completed';
    d.completedAt = '2026-03-05T10:00:00.000Z';
    await saveRecord(d);

    const e = newRecord('classic');
    e.createdAt = '2026-03-02T10:00:00.000Z';
    await saveRecord(e);
    e.status = 'completed';
    e.completedAt = '2026-03-10T10:00:00.000Z';
    await saveRecord(e);

    const completed = await listCompletedRecords();
    expect(completed.map((r) => r.id)).toEqual([e.id, d.id]);
  });

  test('deleteRecord removes the record', async () => {
    const r = newRecord('classic');
    const id = await saveRecord(r);
    await deleteRecord(id);
    expect(await getRecord(id)).toBeUndefined();
  });

  test('hotThought returns the hot thought text or empty string', () => {
    const r = newRecord('classic');
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

describe('newRecord formats', () => {
  test('realistic records start with belief 50 and empty realistic fields', () => {
    const r = newRecord('realistic');
    expect(r.format).toBe('realistic');
    expect(r.beliefBefore).toBe(50);
    expect(r.beliefAfter).toBeNull();
    expect(r.negativeThought).toBe('');
    expect(r.alternativeThought).toBe('');
    expect(r.emotionNow).toBeNull();
  });

  test('classic records start with null beliefs', () => {
    const r = newRecord('classic');
    expect(r.format).toBe('classic');
    expect(r.beliefBefore).toBeNull();
  });

  test('activeThought picks the format-native thought', () => {
    const rt = { ...newRecord('realistic'), negativeThought: 'I always fail' };
    expect(activeThought(rt)).toBe('I always fail');
    const c = { ...newRecord('classic'), thoughts: [{ text: 'hot one', isHot: true }] };
    expect(activeThought(c)).toBe('hot one');
  });

  test('worksheet format setting defaults to realistic', async () => {
    expect(await getWorksheetFormat()).toBe('realistic');
    await setSetting(WORKSHEET_FORMAT_KEY, 'classic');
    expect(await getWorksheetFormat()).toBe('classic');
  });
});
