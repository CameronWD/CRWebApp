import type { ThoughtRecord, WorksheetFormat } from './types';

export type WizardMode = 'new' | 'complete' | 'edit';

export type WizardStep =
  | 'situation'
  | 'emotions'
  | 'thoughts'
  | 'fork'
  | 'evidenceFor'
  | 'evidenceAgainst'
  | 'distortions'
  | 'balanced'
  | 'rerate'
  | 'negativeThought'
  | 'emotionBefore'
  | 'alternative'
  | 'emotionNow'
  | 'done';

export function stepsForMode(
  mode: WizardMode,
  format: WorksheetFormat,
  includeDistortions = true,
): WizardStep[] {
  if (format === 'realistic') {
    const restructure: WizardStep[] = ['evidenceFor', 'evidenceAgainst', 'alternative', 'emotionNow', 'done'];
    switch (mode) {
      case 'new':
        return ['situation', 'negativeThought', 'emotionBefore', 'fork', ...restructure];
      case 'complete':
        return restructure;
      case 'edit':
        return ['situation', 'negativeThought', 'emotionBefore', ...restructure];
    }
  }
  const restructure = (
    ['evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done'] as WizardStep[]
  ).filter((s) => includeDistortions || s !== 'distortions');
  switch (mode) {
    case 'new':
      return ['situation', 'emotions', 'thoughts', 'fork', ...restructure];
    case 'complete':
      return restructure;
    case 'edit':
      return ['situation', 'emotions', 'thoughts', ...restructure];
  }
}

export interface WizardState {
  record: ThoughtRecord;
  steps: WizardStep[];
  stepIndex: number;
}

export function initWizard(
  record: ThoughtRecord,
  mode: WizardMode,
  includeDistortions = true,
): WizardState {
  return { record, steps: stepsForMode(mode, record.format, includeDistortions), stepIndex: 0 };
}

export type WizardAction =
  | { type: 'patch'; fields: Partial<ThoughtRecord> }
  | { type: 'toggleEmotion'; emotion: string }
  | { type: 'setBefore'; emotion: string; value: number }
  | { type: 'setAfter'; emotion: string; value: number }
  | { type: 'addThought'; text: string }
  | { type: 'removeThought'; index: number }
  | { type: 'setHot'; index: number }
  | { type: 'toggleDistortion'; name: string }
  | { type: 'setEmotionBefore'; emotion: string }
  | { type: 'setEmotionNow'; emotion: string }
  | { type: 'setNowStrength'; value: number }
  | { type: 'next' }
  | { type: 'back' };

export function currentStep(state: WizardState): WizardStep {
  return state.steps[state.stepIndex];
}

function withRecord(state: WizardState, record: ThoughtRecord): WizardState {
  return { ...state, record };
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  const r = state.record;
  switch (action.type) {
    case 'patch':
      return withRecord(state, { ...r, ...action.fields });
    case 'toggleEmotion': {
      const exists = r.emotions.some((e) => e.emotion === action.emotion);
      const emotions = exists
        ? r.emotions.filter((e) => e.emotion !== action.emotion)
        : [...r.emotions, { emotion: action.emotion, before: 50, after: null }];
      return withRecord(state, { ...r, emotions });
    }
    case 'setBefore':
    case 'setAfter': {
      const field = action.type === 'setBefore' ? 'before' : 'after';
      const emotions = r.emotions.map((e) =>
        e.emotion === action.emotion ? { ...e, [field]: action.value } : e,
      );
      return withRecord(state, { ...r, emotions });
    }
    case 'addThought': {
      const text = action.text.trim();
      if (!text) return state;
      const thoughts = [...r.thoughts, { text, isHot: r.thoughts.length === 0 }];
      return withRecord(state, { ...r, thoughts });
    }
    case 'removeThought': {
      const removed = r.thoughts[action.index];
      const thoughts = r.thoughts.filter((_, i) => i !== action.index);
      if (removed?.isHot && thoughts.length > 0) {
        thoughts[0] = { ...thoughts[0], isHot: true };
      }
      return withRecord(state, { ...r, thoughts });
    }
    case 'setHot': {
      const thoughts = r.thoughts.map((t, i) => ({ ...t, isHot: i === action.index }));
      return withRecord(state, { ...r, thoughts });
    }
    case 'toggleDistortion': {
      const has = r.distortions.includes(action.name);
      const distortions = has
        ? r.distortions.filter((d) => d !== action.name)
        : [...r.distortions, action.name];
      return withRecord(state, { ...r, distortions });
    }
    case 'setEmotionBefore': {
      const already = r.emotions[0]?.emotion === action.emotion;
      const emotions = already ? [] : [{ emotion: action.emotion, before: 50, after: null }];
      return withRecord(state, { ...r, emotions });
    }
    case 'setEmotionNow': {
      const emotionNow =
        r.emotionNow?.emotion === action.emotion ? null : { emotion: action.emotion, strength: 50 };
      return withRecord(state, { ...r, emotionNow });
    }
    case 'setNowStrength': {
      if (!r.emotionNow) return state;
      return withRecord(state, { ...r, emotionNow: { ...r.emotionNow, strength: action.value } });
    }
    case 'next': {
      const stepIndex = Math.min(state.stepIndex + 1, state.steps.length - 1);
      let record = r;
      if (state.steps[stepIndex] === 'rerate') {
        record = {
          ...record,
          emotions: record.emotions.map((e) => (e.after === null ? { ...e, after: e.before } : e)),
        };
      }
      if (state.steps[stepIndex] === 'emotionNow' && record.beliefAfter === null) {
        record = { ...record, beliefAfter: 50 };
      }
      return { ...state, stepIndex, record };
    }
    case 'back':
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 0) };
  }
}

export function canProceed(state: WizardState): boolean {
  const r = state.record;
  switch (currentStep(state)) {
    case 'situation':
      return r.situation.trim() !== '';
    case 'emotions':
      return r.emotions.length > 0;
    case 'thoughts':
      return r.thoughts.length > 0 && r.thoughts.some((t) => t.isHot);
    case 'balanced':
      return r.balancedThought.trim() !== '';
    case 'rerate':
      return r.emotions.length > 0 && r.emotions.every((e) => e.after !== null);
    case 'negativeThought':
      return r.negativeThought.trim() !== '';
    case 'emotionBefore':
      return r.emotions.length === 1;
    case 'alternative':
      return r.alternativeThought.trim() !== '';
    case 'emotionNow':
      return r.emotionNow !== null;
    default:
      return true;
  }
}
