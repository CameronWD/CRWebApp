import { db } from './db';
import { DEFAULT_EMOTIONS } from './constants';
import type { CustomEmotion, ThoughtRecord, WorksheetFormat } from './types';

export function newRecord(format: WorksheetFormat): ThoughtRecord {
  const now = new Date().toISOString();
  return {
    status: 'open',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    situation: '',
    emotions: [],
    thoughts: [],
    evidenceFor: '',
    evidenceAgainst: '',
    distortions: [],
    balancedThought: '',
    format,
    negativeThought: '',
    beliefBefore: format === 'realistic' ? 50 : null,
    alternativeThought: '',
    beliefAfter: null,
    emotionNow: null,
  };
}

export async function saveRecord(record: ThoughtRecord): Promise<number> {
  record.updatedAt = new Date().toISOString();
  if (record.id === undefined) {
    const { id: _unused, ...fields } = record;
    void _unused;
    const id = await db.records.add(fields as ThoughtRecord);
    record.id = id;
    return id;
  }
  await db.records.put(record);
  return record.id;
}

export async function completeRecord(record: ThoughtRecord): Promise<number> {
  record.status = 'completed';
  record.completedAt = new Date().toISOString();
  return saveRecord(record);
}

export async function getRecord(id: number): Promise<ThoughtRecord | undefined> {
  return db.records.get(id);
}

export async function deleteRecord(id: number): Promise<void> {
  await db.records.delete(id);
}

function newestFirst(records: ThoughtRecord[]): ThoughtRecord[] {
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listOpenRecords(): Promise<ThoughtRecord[]> {
  return newestFirst(await db.records.where('status').equals('open').toArray());
}

export async function listCompletedRecords(): Promise<ThoughtRecord[]> {
  const records = await db.records.where('status').equals('completed').toArray();
  return [...records].sort((a, b) =>
    (b.completedAt ?? b.createdAt).localeCompare(a.completedAt ?? a.createdAt),
  );
}

export function hotThought(record: ThoughtRecord): string {
  return record.thoughts.find((t) => t.isHot)?.text ?? '';
}

/** The thought a record works on: the Negative Thought (realistic) or the Hot Thought (classic). */
export function activeThought(record: ThoughtRecord): string {
  return record.format === 'realistic' ? record.negativeThought : hotThought(record);
}

export async function listCustomEmotions(): Promise<CustomEmotion[]> {
  return db.customEmotions.toArray();
}

export async function allEmotionNames(): Promise<string[]> {
  const custom = await listCustomEmotions();
  return [...DEFAULT_EMOTIONS, ...custom.map((c) => c.name)];
}

export async function addCustomEmotion(name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) return;
  const existing = await allEmotionNames();
  if (existing.some((e) => e.toLowerCase() === clean.toLowerCase())) return;
  await db.customEmotions.add({ name: clean });
}

export async function removeCustomEmotion(id: number): Promise<void> {
  await db.customEmotions.delete(id);
}

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.settings.get(key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

export const WORKSHEET_FORMAT_KEY = 'worksheetFormat';

export async function getWorksheetFormat(): Promise<WorksheetFormat> {
  return (await getSetting(WORKSHEET_FORMAT_KEY)) === 'classic' ? 'classic' : 'realistic';
}
