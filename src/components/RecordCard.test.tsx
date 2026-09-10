import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import type { ThoughtRecord } from '../lib/types';
import { newRecord } from '../lib/repository';
import { RecordCard } from './RecordCard';

function make(status: 'open' | 'completed', id: number): ThoughtRecord {
  const now = new Date().toISOString();
  return {
    id,
    status,
    createdAt: now,
    updatedAt: now,
    completedAt: status === 'completed' ? now : null,
    situation: 'A situation',
    emotions: [],
    thoughts: [],
    evidenceFor: '',
    evidenceAgainst: '',
    distortions: [],
    balancedThought: '',
    format: 'classic',
    negativeThought: '',
    beliefBefore: null,
    alternativeThought: '',
    beliefAfter: null,
    emotionNow: null,
  };
}

function renderCard(record: ThoughtRecord, openTo?: 'wizard' | 'detail') {
  return render(
    <HashRouter>
      <RecordCard record={record} openTo={openTo} />
    </HashRouter>,
  );
}

test('open records link to the continue wizard by default', () => {
  renderCard(make('open', 1));
  expect(screen.getByRole('link')).toHaveAttribute('href', '#/complete/1');
});

test('open records link to the detail view when openTo is detail', () => {
  renderCard(make('open', 1), 'detail');
  expect(screen.getByRole('link')).toHaveAttribute('href', '#/record/1');
});

test('completed records always link to the detail view', () => {
  renderCard(make('completed', 2), 'wizard');
  expect(screen.getByRole('link')).toHaveAttribute('href', '#/record/2');
});

describe('realistic records', () => {
  test('open record shows the before emotion only', () => {
    const r = {
      ...newRecord('realistic'),
      id: 1,
      situation: 's',
      emotions: [{ emotion: 'Anxious', before: 80, after: null }],
    };
    renderCard(r);
    expect(screen.getByText('Anxious 80')).toBeInTheDocument();
  });

  test('completed record shows the journey, collapsing a same-name emotion', () => {
    const base = {
      ...newRecord('realistic'),
      id: 1,
      situation: 's',
      status: 'completed' as const,
      emotions: [{ emotion: 'Anxious', before: 80, after: null }],
    };
    const { rerender } = render(
      <HashRouter>
        <RecordCard record={{ ...base, emotionNow: { emotion: 'Calm', strength: 30 } }} />
      </HashRouter>,
    );
    expect(screen.getByText('Anxious 80 → Calm 30')).toBeInTheDocument();
    rerender(
      <HashRouter>
        <RecordCard record={{ ...base, emotionNow: { emotion: 'Anxious', strength: 30 } }} />
      </HashRouter>,
    );
    expect(screen.getByText('Anxious 80 → 30')).toBeInTheDocument();
  });
});
