import { describe, expect, test } from 'vitest';
import { newRecord } from './repository';
import {
  canProceed,
  currentStep,
  initWizard,
  stepsForMode,
  wizardReducer,
  type WizardState,
} from './wizard';

function fresh(mode: 'new' | 'complete' | 'edit' = 'new'): WizardState {
  return initWizard(newRecord('classic'), mode);
}

describe('step order', () => {
  test('new mode walks all steps including the fork', () => {
    expect(stepsForMode('new', 'classic')).toEqual([
      'situation', 'emotions', 'thoughts', 'fork',
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
  test('complete mode starts at evidence, no fork', () => {
    expect(stepsForMode('complete', 'classic')).toEqual([
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
  test('edit mode walks all steps except the fork', () => {
    expect(stepsForMode('edit', 'classic')).toEqual([
      'situation', 'emotions', 'thoughts',
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
});

describe('navigation', () => {
  test('next and back move within bounds', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'back' });
    expect(s.stepIndex).toBe(0);
    s = wizardReducer(s, { type: 'next' });
    expect(currentStep(s)).toBe('emotions');
    s = wizardReducer(s, { type: 'back' });
    expect(currentStep(s)).toBe('situation');
  });

  test('entering rerate prefills after with before values', () => {
    let s = fresh('complete');
    s = wizardReducer(s, {
      type: 'patch',
      fields: { emotions: [{ emotion: 'Anxious', before: 80, after: null }] },
    });
    while (currentStep(s) !== 'rerate') s = wizardReducer(s, { type: 'next' });
    expect(s.record.emotions[0].after).toBe(80);
  });

  test('rerate prefill keeps an existing after value', () => {
    let s = fresh('complete');
    s = wizardReducer(s, {
      type: 'patch',
      fields: { emotions: [{ emotion: 'Anxious', before: 80, after: 30 }] },
    });
    while (currentStep(s) !== 'rerate') s = wizardReducer(s, { type: 'next' });
    expect(s.record.emotions[0].after).toBe(30);
  });
});

describe('emotions', () => {
  test('toggleEmotion adds with before 50, toggles off, setBefore/setAfter update', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'toggleEmotion', emotion: 'Anxious' });
    expect(s.record.emotions).toEqual([{ emotion: 'Anxious', before: 50, after: null }]);
    s = wizardReducer(s, { type: 'setBefore', emotion: 'Anxious', value: 85 });
    expect(s.record.emotions[0].before).toBe(85);
    s = wizardReducer(s, { type: 'setAfter', emotion: 'Anxious', value: 40 });
    expect(s.record.emotions[0].after).toBe(40);
    s = wizardReducer(s, { type: 'toggleEmotion', emotion: 'Anxious' });
    expect(s.record.emotions).toEqual([]);
  });
});

describe('thoughts', () => {
  test('first thought becomes hot; setHot moves it; remove reassigns hot', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'addThought', text: 'I always fail' });
    s = wizardReducer(s, { type: 'addThought', text: 'They think less of me' });
    expect(s.record.thoughts.map((t) => t.isHot)).toEqual([true, false]);
    s = wizardReducer(s, { type: 'setHot', index: 1 });
    expect(s.record.thoughts.map((t) => t.isHot)).toEqual([false, true]);
    s = wizardReducer(s, { type: 'removeThought', index: 1 });
    expect(s.record.thoughts).toHaveLength(1);
    expect(s.record.thoughts[0].isHot).toBe(true);
  });

  test('blank thoughts are ignored', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'addThought', text: '   ' });
    expect(s.record.thoughts).toHaveLength(0);
  });
});

describe('distortions', () => {
  test('toggleDistortion adds and removes', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'toggleDistortion', name: 'Catastrophising' });
    expect(s.record.distortions).toEqual(['Catastrophising']);
    s = wizardReducer(s, { type: 'toggleDistortion', name: 'Catastrophising' });
    expect(s.record.distortions).toEqual([]);
  });
});

describe('canProceed', () => {
  test('situation requires text', () => {
    let s = fresh();
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'patch', fields: { situation: 'Missed the bus' } });
    expect(canProceed(s)).toBe(true);
  });

  test('emotions requires at least one', () => {
    let s = fresh();
    s = wizardReducer(s, { type: 'patch', fields: { situation: 'x' } });
    s = wizardReducer(s, { type: 'next' });
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'toggleEmotion', emotion: 'Sad' });
    expect(canProceed(s)).toBe(true);
  });

  test('thoughts requires at least one', () => {
    let s = fresh();
    s = { ...s, stepIndex: s.steps.indexOf('thoughts') };
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'addThought', text: 'a thought' });
    expect(canProceed(s)).toBe(true);
  });

  test('evidence and distortions are optional, balanced is required', () => {
    let s = fresh('complete');
    expect(canProceed(s)).toBe(true); // evidenceFor
    s = { ...s, stepIndex: s.steps.indexOf('balanced') };
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'patch', fields: { balancedThought: 'A fairer view' } });
    expect(canProceed(s)).toBe(true);
  });

  test('rerate requires every after value', () => {
    let s = fresh('complete');
    s = wizardReducer(s, {
      type: 'patch',
      fields: {
        emotions: [
          { emotion: 'Anxious', before: 80, after: null },
          { emotion: 'Sad', before: 60, after: null },
        ],
      },
    });
    s = { ...s, stepIndex: s.steps.indexOf('rerate') };
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'setAfter', emotion: 'Anxious', value: 40 });
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'setAfter', emotion: 'Sad', value: 30 });
    expect(canProceed(s)).toBe(true);
  });
});

describe('optional distortions step', () => {
  test('complete mode without distortions skips the step', () => {
    expect(stepsForMode('complete', 'classic', false)).toEqual([
      'evidenceFor', 'evidenceAgainst', 'balanced', 'rerate', 'done',
    ]);
  });

  test('new and edit modes without distortions skip the step but keep everything else', () => {
    expect(stepsForMode('new', 'classic', false)).not.toContain('distortions');
    expect(stepsForMode('new', 'classic', false)).toContain('fork');
    expect(stepsForMode('edit', 'classic', false)).not.toContain('distortions');
  });

  test('initWizard threads the flag through', () => {
    const s = initWizard(newRecord('classic'), 'complete', false);
    expect(s.steps).not.toContain('distortions');
  });
});

function freshRT(mode: 'new' | 'complete' | 'edit' = 'new'): WizardState {
  return initWizard(newRecord('realistic'), mode);
}

describe('realistic thinking step order', () => {
  test('new mode follows the worksheet order with the fork after section 1', () => {
    expect(stepsForMode('new', 'realistic')).toEqual([
      'situation', 'negativeThought', 'emotionBefore', 'fork',
      'evidenceFor', 'evidenceAgainst', 'alternative', 'emotionNow', 'done',
    ]);
  });
  test('complete mode starts at the evidence, no fork', () => {
    expect(stepsForMode('complete', 'realistic')).toEqual([
      'evidenceFor', 'evidenceAgainst', 'alternative', 'emotionNow', 'done',
    ]);
  });
  test('edit mode walks everything except the fork', () => {
    expect(stepsForMode('edit', 'realistic')).toEqual([
      'situation', 'negativeThought', 'emotionBefore',
      'evidenceFor', 'evidenceAgainst', 'alternative', 'emotionNow', 'done',
    ]);
  });
  test('distortions toggle never affects realistic steps', () => {
    expect(stepsForMode('new', 'realistic', true)).toEqual(stepsForMode('new', 'realistic', false));
  });
  test('initWizard reads the format off the record', () => {
    expect(freshRT().steps).toContain('negativeThought');
    expect(initWizard(newRecord('classic'), 'new').steps).toContain('thoughts');
  });
});

describe('realistic thinking actions', () => {
  test('setEmotionBefore keeps a single emotion and toggles off on re-tap', () => {
    let s = freshRT();
    s = wizardReducer(s, { type: 'setEmotionBefore', emotion: 'Anxious' });
    expect(s.record.emotions).toEqual([{ emotion: 'Anxious', before: 50, after: null }]);
    s = wizardReducer(s, { type: 'setEmotionBefore', emotion: 'Sad' });
    expect(s.record.emotions).toEqual([{ emotion: 'Sad', before: 50, after: null }]);
    s = wizardReducer(s, { type: 'setEmotionBefore', emotion: 'Sad' });
    expect(s.record.emotions).toEqual([]);
  });

  test('setEmotionNow toggles the after-emotion, which may differ from before', () => {
    let s = freshRT();
    s = wizardReducer(s, { type: 'setEmotionBefore', emotion: 'Anxious' });
    s = wizardReducer(s, { type: 'setEmotionNow', emotion: 'Calm' });
    expect(s.record.emotionNow).toEqual({ emotion: 'Calm', strength: 50 });
    s = wizardReducer(s, { type: 'setNowStrength', value: 20 });
    expect(s.record.emotionNow).toEqual({ emotion: 'Calm', strength: 20 });
    s = wizardReducer(s, { type: 'setEmotionNow', emotion: 'Calm' });
    expect(s.record.emotionNow).toBeNull();
  });

  test('setNowStrength without a chosen emotion is a no-op', () => {
    const s = freshRT();
    expect(wizardReducer(s, { type: 'setNowStrength', value: 20 })).toBe(s);
  });

  test('advancing past the alternative step defaults beliefAfter to 50', () => {
    let s = freshRT('complete'); // evidenceFor, evidenceAgainst, alternative, emotionNow, done
    s = wizardReducer(s, { type: 'next' }); // -> evidenceAgainst
    s = wizardReducer(s, { type: 'next' }); // -> alternative
    s = wizardReducer(s, { type: 'patch', fields: { alternativeThought: 'A fairer view' } });
    s = wizardReducer(s, { type: 'next' }); // -> emotionNow
    expect(s.record.beliefAfter).toBe(50);
  });
});

describe('realistic thinking gating', () => {
  test('each step gates on its own field', () => {
    let s = freshRT();
    expect(canProceed(s)).toBe(false); // situation empty
    s = wizardReducer(s, { type: 'patch', fields: { situation: 'x' } });
    expect(canProceed(s)).toBe(true);
    s = wizardReducer(s, { type: 'next' }); // negativeThought
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'patch', fields: { negativeThought: 'I always fail' } });
    expect(canProceed(s)).toBe(true);
    s = wizardReducer(s, { type: 'next' }); // emotionBefore
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'setEmotionBefore', emotion: 'Anxious' });
    expect(canProceed(s)).toBe(true);
  });

  test('alternative requires text and emotionNow requires a chosen emotion', () => {
    let s = freshRT('complete');
    s = wizardReducer(s, { type: 'next' });
    s = wizardReducer(s, { type: 'next' }); // alternative
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'patch', fields: { alternativeThought: 'ok' } });
    expect(canProceed(s)).toBe(true);
    s = wizardReducer(s, { type: 'next' }); // emotionNow
    expect(canProceed(s)).toBe(false);
    s = wizardReducer(s, { type: 'setEmotionNow', emotion: 'Calm' });
    expect(canProceed(s)).toBe(true);
  });
});
