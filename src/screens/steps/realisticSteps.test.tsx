import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { db } from '../../lib/db';
import { newRecord } from '../../lib/repository';
import NegativeThoughtStep from './NegativeThoughtStep';
import EmotionBeforeStep from './EmotionBeforeStep';
import AlternativeStep from './AlternativeStep';
import EmotionNowStep from './EmotionNowStep';
import EvidenceStep from './EvidenceStep';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
});

function rt(overrides = {}) {
  return { ...newRecord('realistic'), ...overrides };
}

describe('NegativeThoughtStep', () => {
  test('uses the worksheet wording and patches the thought and belief', () => {
    const dispatch = vi.fn();
    render(<NegativeThoughtStep record={rt()} dispatch={dispatch} />);
    expect(screen.getByText('What was your thought?')).toBeInTheDocument();
    expect(screen.getByText('Identifying negative thoughts')).toBeInTheDocument();
    expect(screen.getByText('How much do you believe in this thought?')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I always fail' } });
    expect(dispatch).toHaveBeenCalledWith({ type: 'patch', fields: { negativeThought: 'I always fail' } });
  });
});

describe('EmotionBeforeStep', () => {
  test('single-select chips dispatch setEmotionBefore and show the strength question', () => {
    const dispatch = vi.fn();
    render(<EmotionBeforeStep record={rt({ emotions: [{ emotion: 'Anxious', before: 80, after: null }] })} dispatch={dispatch} />);
    expect(screen.getByText('What was your emotion?')).toBeInTheDocument();
    expect(screen.getByText('How strong was the emotion?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sad'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setEmotionBefore', emotion: 'Sad' });
  });
});

describe('AlternativeStep', () => {
  test('quotes the negative thought and patches the alternative', () => {
    const dispatch = vi.fn();
    render(<AlternativeStep record={rt({ negativeThought: 'I always fail' })} dispatch={dispatch} />);
    expect(screen.getByText('What is your alternative thought?')).toBeInTheDocument();
    expect(screen.getByText('Realistic Thinking')).toBeInTheDocument();
    expect(screen.getByText(/I always fail/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'One setback' } });
    expect(dispatch).toHaveBeenCalledWith({ type: 'patch', fields: { alternativeThought: 'One setback' } });
  });
});

describe('EmotionNowStep', () => {
  test('dispatches setEmotionNow and shows the strength slider once chosen', () => {
    const dispatch = vi.fn();
    render(<EmotionNowStep record={rt({ emotionNow: { emotion: 'Calm', strength: 30 } })} dispatch={dispatch} />);
    expect(screen.getByText('What is your emotion now?')).toBeInTheDocument();
    expect(screen.getByText('How strong is the emotion?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sad'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'setEmotionNow', emotion: 'Sad' });
  });
});

describe('EvidenceStep in realistic format', () => {
  test('uses the worksheet titles and quotes the negative thought', () => {
    const dispatch = vi.fn();
    render(<EvidenceStep record={rt({ negativeThought: 'I always fail' })} dispatch={dispatch} kind="for" />);
    expect(screen.getByText('Evidence for the thought')).toBeInTheDocument();
    expect(screen.getByText('Gathering the evidence')).toBeInTheDocument();
    expect(screen.getByText(/I always fail/)).toBeInTheDocument();
  });
  test('classic format keeps its existing title', () => {
    const dispatch = vi.fn();
    render(<EvidenceStep record={newRecord('classic')} dispatch={dispatch} kind="for" />);
    expect(screen.getByText('What makes this thought feel true?')).toBeInTheDocument();
  });
});
