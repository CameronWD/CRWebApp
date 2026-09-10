import type { ThoughtRecord } from './types';

type FormatFields = 'format' | 'negativeThought' | 'beliefBefore' | 'alternativeThought' | 'beliefAfter' | 'emotionNow';

/** A record as it may exist on disk from before worksheet formats existed. */
export type StoredRecord = Omit<ThoughtRecord, FormatFields> & Partial<Pick<ThoughtRecord, FormatFields>>;

export function withFormatDefaults(r: StoredRecord): ThoughtRecord {
  return {
    format: 'classic',
    negativeThought: '',
    beliefBefore: null,
    alternativeThought: '',
    beliefAfter: null,
    emotionNow: null,
    ...r,
  };
}
