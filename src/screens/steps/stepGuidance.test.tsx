import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactElement } from 'react';
import { db } from '../../lib/db';
import { newRecord } from '../../lib/repository';
import SituationStep from './SituationStep';
import EmotionsStep from './EmotionsStep';
import ThoughtsStep from './ThoughtsStep';
import DistortionsStep from './DistortionsStep';
import BalancedStep from './BalancedStep';
import RerateStep from './RerateStep';
import NegativeThoughtStep from './NegativeThoughtStep';
import EmotionBeforeStep from './EmotionBeforeStep';
import EvidenceStep from './EvidenceStep';
import AlternativeStep from './AlternativeStep';
import EmotionNowStep from './EmotionNowStep';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
});

const dispatch = vi.fn();

const CASES: Array<{ name: string; el: ReactElement; helpTitle: string }> = [
  { name: 'SituationStep', el: <SituationStep record={newRecord('classic')} dispatch={dispatch} />, helpTitle: 'The situation' },
  { name: 'EmotionsStep', el: <EmotionsStep record={newRecord('classic')} dispatch={dispatch} />, helpTitle: 'Naming your emotions' },
  { name: 'ThoughtsStep', el: <ThoughtsStep record={newRecord('classic')} dispatch={dispatch} />, helpTitle: 'Catching the thoughts' },
  { name: 'DistortionsStep', el: <DistortionsStep record={newRecord('classic')} dispatch={dispatch} />, helpTitle: 'Thinking patterns' },
  { name: 'BalancedStep', el: <BalancedStep record={newRecord('classic')} dispatch={dispatch} />, helpTitle: 'A fairer take' },
  { name: 'RerateStep', el: <RerateStep record={newRecord('classic')} dispatch={dispatch} />, helpTitle: 'Rating the feelings again' },
  { name: 'NegativeThoughtStep', el: <NegativeThoughtStep record={newRecord('realistic')} dispatch={dispatch} />, helpTitle: 'Your thought' },
  { name: 'EmotionBeforeStep', el: <EmotionBeforeStep record={newRecord('realistic')} dispatch={dispatch} />, helpTitle: 'Your emotion' },
  { name: 'EvidenceStep for', el: <EvidenceStep record={newRecord('realistic')} dispatch={dispatch} kind="for" />, helpTitle: 'Evidence for the thought' },
  { name: 'EvidenceStep against', el: <EvidenceStep record={newRecord('classic')} dispatch={dispatch} kind="against" />, helpTitle: 'Evidence against the thought' },
  { name: 'AlternativeStep', el: <AlternativeStep record={newRecord('realistic')} dispatch={dispatch} />, helpTitle: 'Your alternative thought' },
  { name: 'EmotionNowStep', el: <EmotionNowStep record={newRecord('realistic')} dispatch={dispatch} />, helpTitle: 'Your emotion now' },
];

describe('every content step has an info button that opens its help', () => {
  for (const c of CASES) {
    test(c.name, () => {
      const { unmount } = render(c.el);
      fireEvent.click(screen.getByRole('button', { name: 'About this step' }));
      expect(screen.getByRole('dialog', { name: c.helpTitle })).toBeInTheDocument();
      unmount();
    });
  }
});

describe('example placeholders are gone', () => {
  test('no step ships a prefilled example', () => {
    for (const c of CASES) {
      const { unmount } = render(c.el);
      expect(screen.queryByPlaceholderText(/manager|mess this up|even-handed|realistic way|backs it up|add up/)).toBeNull();
      unmount();
    }
  });

  test('custom emotion inputs keep their functional placeholder', () => {
    render(<EmotionsStep record={newRecord('classic')} dispatch={dispatch} />);
    fireEvent.click(screen.getByText('+ something else'));
    expect(screen.getByPlaceholderText('Name it…')).toBeInTheDocument();
  });
});
