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
    expect(stepsForMode('new')).toEqual([
      'situation', 'emotions', 'thoughts', 'fork',
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
  test('complete mode starts at evidence, no fork', () => {
    expect(stepsForMode('complete')).toEqual([
      'evidenceFor', 'evidenceAgainst', 'distortions', 'balanced', 'rerate', 'done',
    ]);
  });
  test('edit mode walks all steps except the fork', () => {
    expect(stepsForMode('edit')).toEqual([
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
    expect(stepsForMode('complete', false)).toEqual([
      'evidenceFor', 'evidenceAgainst', 'balanced', 'rerate', 'done',
    ]);
  });

  test('new and edit modes without distortions skip the step but keep everything else', () => {
    expect(stepsForMode('new', false)).not.toContain('distortions');
    expect(stepsForMode('new', false)).toContain('fork');
    expect(stepsForMode('edit', false)).not.toContain('distortions');
  });

  test('initWizard threads the flag through', () => {
    const s = initWizard(newRecord('classic'), 'complete', false);
    expect(s.steps).not.toContain('distortions');
  });
});
