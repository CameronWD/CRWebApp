import Dexie, { type Table } from 'dexie';
import type { CustomEmotion, Setting, ThoughtRecord } from './types';

export class ThoughtDb extends Dexie {
  records!: Table<ThoughtRecord, number>;
  customEmotions!: Table<CustomEmotion, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('thought-records');
    this.version(1).stores({
      records: '++id, status, createdAt',
      customEmotions: '++id, &name',
      settings: '&key',
    });
    this.version(2).stores({
      records: '++id, status, createdAt, updatedAt',
    });
  }
}

export const db = new ThoughtDb();
