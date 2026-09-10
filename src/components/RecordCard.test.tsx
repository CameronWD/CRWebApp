import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import type { ThoughtRecord } from '../lib/types';
import { db } from '../lib/db';
import { getRecord, newRecord, saveRecord } from '../lib/repository';
import { RecordCard } from './RecordCard';

beforeEach(async () => {
  await db.records.clear();
});

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

describe('swipe to delete', () => {
  test('every card renders an accessible Delete action', () => {
    const r = { ...newRecord('classic'), id: 1, situation: 's' };
    renderCard(r);
    expect(screen.getByRole('button', { name: 'Delete record' })).toBeInTheDocument();
  });

  test('delete goes through the confirmation sheet and removes the record', async () => {
    const id = await saveRecord({ ...newRecord('classic'), situation: 'doomed' });
    const r = (await getRecord(id))!;
    renderCard(r);
    fireEvent.click(screen.getByRole('button', { name: 'Delete record' }));
    expect(screen.getByText('Delete this record?')).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete record' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    await waitFor(async () => expect(await getRecord(id)).toBeUndefined());
  });

  test('cancelling the sheet keeps the record', async () => {
    const id = await saveRecord({ ...newRecord('classic'), situation: 'spared' });
    const r = (await getRecord(id))!;
    renderCard(r);
    fireEvent.click(screen.getByRole('button', { name: 'Delete record' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(await getRecord(id)).toBeTruthy();
    // ConfirmSheet unmounts via an AnimatePresence exit animation, which
    // completes asynchronously (real elapsed time) even in jsdom.
    await waitFor(() => {
      expect(screen.queryByText('Delete this record?')).not.toBeInTheDocument();
    });
  });

  test('a tap while revealed closes the reveal instead of navigating', () => {
    const r = { ...newRecord('classic'), id: 1, situation: 's' };
    renderCard(r);
    // Focusing the delete action reveals the card (keyboard path).
    fireEvent.focus(screen.getByRole('button', { name: 'Delete record' }));
    const link = screen.getByRole('link');
    const clickEvent = createEvent.click(link);
    fireEvent(link, clickEvent);
    expect(clickEvent.defaultPrevented).toBe(true);
  });

  test('a plain tap on a non-revealed card still navigates', () => {
    const r = { ...newRecord('classic'), id: 1, situation: 's' };
    renderCard(r);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#/complete/1');
    // React Router's own Link handler calls preventDefault on every
    // intercepted left-click to perform its client-side navigation, so
    // defaultPrevented is always true once navigation proceeds — checking
    // it can't distinguish "navigated" from "guard blocked it". The guard's
    // own effect (an early preventDefault + close()) is already covered by
    // the "revealed" case above; here we assert the guard did NOT step in
    // by checking that navigation actually happened.
    fireEvent.click(link);
    expect(window.location.hash).toBe('#/complete/1');
  });
});
