import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord, saveRecord } from '../lib/repository';
import type { ThoughtRecord } from '../lib/types';
import Wizard from './Wizard';

beforeEach(async () => {
  await db.records.clear();
});

async function captured(): Promise<ThoughtRecord> {
  const r = newRecord();
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  r.thoughts = [{ text: 'I will be fired', isHot: true }];
  await saveRecord(r);
  return r;
}

test('complete mode walks evidence → distortions → balanced → rerate → done and completes the record', async () => {
  const r = await captured();
  render(
    <HashRouter>
      <Wizard initialRecord={r} mode="complete" />
    </HashRouter>,
  );

  // Evidence for — shows the hot thought, is skippable
  expect(await screen.findByText('What makes this thought feel true?')).toBeInTheDocument();
  expect(screen.getByText(/I will be fired/)).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'My manager was short with me');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Evidence against
  expect(await screen.findByText("What doesn't fit that thought?")).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Distortions — tap one
  expect(await screen.findByText('Spot any patterns?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Catastrophising/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Balanced — required
  expect(await screen.findByText('What would a fairer take be?')).toBeInTheDocument();
  const next = screen.getByRole('button', { name: 'Next' });
  expect(next).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox'), 'One tense chat is not a firing');
  await userEvent.click(next);

  // Rerate — slider prefilled with before value
  expect(await screen.findByText('How do those feelings sit now?')).toBeInTheDocument();
  expect(screen.getByRole('slider')).toHaveValue('80');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Done — shows the drop and persists completion
  expect(await screen.findByText('Well done.')).toBeInTheDocument();
  expect(screen.getByText(/Anxious 80/)).toBeInTheDocument();
  const saved = await db.records.get(r.id!);
  expect(saved?.status).toBe('completed');
  expect(saved?.distortions).toEqual(['Catastrophising']);
});
