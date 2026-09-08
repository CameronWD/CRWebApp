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
}

export interface CustomEmotion {
  id?: number;
  name: string;
}

export interface Setting {
  key: string;
  value: string;
}
