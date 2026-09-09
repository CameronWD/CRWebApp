import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import type { ThoughtRecord } from '../lib/types';
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
