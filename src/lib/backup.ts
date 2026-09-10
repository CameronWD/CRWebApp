import { db } from './db';
import { withFormatDefaults, type StoredRecord } from './migrate';
import { getSetting, setSetting } from './repository';
import type { CustomEmotion, ThoughtRecord } from './types';

export interface BackupFile {
  app: 'thought-records';
  version: 2;
  exportedAt: string;
  records: ThoughtRecord[];
  customEmotions: CustomEmotion[];
}

export const LAST_EXPORT_KEY = 'lastExportAt';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export async function createBackup(): Promise<BackupFile> {
  return {
    app: 'thought-records',
    version: 2,
    exportedAt: new Date().toISOString(),
    records: await db.records.toArray(),
    customEmotions: await db.customEmotions.toArray(),
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidEmotionRating(value: unknown): boolean {
  if (!isObject(value)) return false;
  if (typeof value.emotion !== 'string') return false;
  if (typeof value.before !== 'number') return false;
  if (value.after !== null && typeof value.after !== 'number') return false;
  return true;
}

function isValidThought(value: unknown): boolean {
  if (!isObject(value)) return false;
  if (typeof value.text !== 'string') return false;
  if (typeof value.isHot !== 'boolean') return false;
  return true;
}

function isValidFormatFields(value: Record<string, unknown>): boolean {
  if (value.format !== 'realistic' && value.format !== 'classic') return false;
  if (typeof value.negativeThought !== 'string') return false;
  if (typeof value.alternativeThought !== 'string') return false;
  if (value.beliefBefore !== null && typeof value.beliefBefore !== 'number') return false;
  if (value.beliefAfter !== null && typeof value.beliefAfter !== 'number') return false;
  const now = value.emotionNow;
  if (now !== null) {
    if (!isObject(now)) return false;
    if (typeof now.emotion !== 'string' || typeof now.strength !== 'number') return false;
  }
  return true;
}

function isValidRecord(value: unknown, version: 1 | 2): boolean {
  if (!isObject(value)) return false;
  if (value.status !== 'open' && value.status !== 'completed') return false;
  if (typeof value.situation !== 'string') return false;
  if (typeof value.createdAt !== 'string') return false;
  if (typeof value.updatedAt !== 'string') return false;
  if (typeof value.evidenceFor !== 'string') return false;
  if (typeof value.evidenceAgainst !== 'string') return false;
  if (typeof value.balancedThought !== 'string') return false;
  if (!Array.isArray(value.emotions) || !value.emotions.every(isValidEmotionRating)) return false;
  if (!Array.isArray(value.thoughts) || !value.thoughts.every(isValidThought)) return false;
  if (!Array.isArray(value.distortions) || !value.distortions.every((d) => typeof d === 'string')) return false;
  if (value.completedAt !== null && typeof value.completedAt !== 'string') return false;
  if ('id' in value && typeof value.id !== 'number') return false;
  if (version === 2 && !isValidFormatFields(value)) return false;
  return true;
}

function isValidCustomEmotion(value: unknown): boolean {
  if (!isObject(value)) return false;
  if (typeof value.name !== 'string') return false;
  if ('id' in value && typeof value.id !== 'number') return false;
  return true;
}

export function parseBackup(json: string): BackupFile {
  const fail = () => new Error("This file doesn't look like a Thought Records backup.");
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw fail();
  }
  if (typeof data !== 'object' || data === null) throw fail();
  const d = data as Record<string, unknown>;
  if (d.app !== 'thought-records' || (d.version !== 1 && d.version !== 2)) throw fail();
  const version = d.version as 1 | 2;
  if (!Array.isArray(d.records) || !Array.isArray(d.customEmotions)) throw fail();
  if (!d.records.every((r) => isValidRecord(r, version))) throw fail();
  if (!d.customEmotions.every(isValidCustomEmotion)) throw fail();
  return {
    app: 'thought-records',
    version: 2,
    exportedAt: d.exportedAt as string,
    records: (d.records as StoredRecord[]).map(withFormatDefaults),
    customEmotions: d.customEmotions as CustomEmotion[],
  };
}

export async function restoreBackup(backup: BackupFile): Promise<void> {
  await db.transaction('rw', db.records, db.customEmotions, async () => {
    await db.records.clear();
    await db.customEmotions.clear();
    await db.records.bulkAdd(backup.records);
    await db.customEmotions.bulkAdd(backup.customEmotions);
  });
}

export async function downloadBackup(): Promise<void> {
  const backup = await createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thought-records-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  await setSetting(LAST_EXPORT_KEY, backup.exportedAt);
}

export async function getLastExportAt(): Promise<string | null> {
  return getSetting(LAST_EXPORT_KEY);
}

export function shouldNudgeExport(
  lastExportAt: string | null,
  newestRecordAt: string | null,
  now: Date,
): boolean {
  if (!newestRecordAt) return false;
  if (!lastExportAt) return true;
  const stale = now.getTime() - Date.parse(lastExportAt) > FOURTEEN_DAYS_MS;
  const newSince = newestRecordAt > lastExportAt;
  return stale && newSince;
}
