export type RecordStatus = 'open' | 'completed';

export interface EmotionRating {
  emotion: string;
  before: number; // 0-100
  after: number | null; // null until re-rated in the final step
}

export interface AutomaticThought {
  text: string;
  isHot: boolean;
}

export type WorksheetFormat = 'realistic' | 'classic';

export interface EmotionNow {
  emotion: string;
  strength: number; // 0-100
}

export interface ThoughtRecord {
  id?: number;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  situation: string;
  emotions: EmotionRating[];
  thoughts: AutomaticThought[];
  evidenceFor: string;
  evidenceAgainst: string;
  distortions: string[];
  balancedThought: string;
  format: WorksheetFormat;
  // Realistic Thinking fields — empty/null on classic records
  negativeThought: string;
  beliefBefore: number | null; // 0-100
  alternativeThought: string;
  beliefAfter: number | null; // 0-100, null until the alternative step is passed
  emotionNow: EmotionNow | null;
}

export interface CustomEmotion {
  id?: number;
  name: string;
}

export interface Setting {
  key: string;
  value: string;
}
