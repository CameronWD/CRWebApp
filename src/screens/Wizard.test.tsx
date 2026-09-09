import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord } from '../lib/repository';
import Wizard from './Wizard';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
});

function renderNewWizard() {
  return render(
    <HashRouter>
      <Wizard initialRecord={newRecord()} mode="new" />
    </HashRouter>,
  );
}

test('starts on the situation step with Next disabled until text is entered', async () => {
  renderNewWizard();
  expect(await screen.findByText('What happened?')).toBeInTheDocument();
  const next = screen.getByRole('button', { name: 'Next' });
  expect(next).toBeDisabled();
  await userEvent.type(screen.getByRole('textbox'), 'Missed the bus');
  expect(next).toBeEnabled();
});

test('walks situation → emotions → thoughts → fork', async () => {
  renderNewWizard();
  await userEvent.type(await screen.findByRole('textbox'), 'Missed the bus');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Emotions step: default chips are shown, tap one, a slider appears
  expect(await screen.findByText('What are you feeling?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Anxious' }));
  expect(screen.getByRole('slider')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Thoughts step: add a thought
  expect(await screen.findByText('What went through your mind?')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'I always mess up');
  await userEvent.click(screen.getByRole('button', { name: 'Add' }));
  expect(screen.getByText('I always mess up')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Fork step
  expect(await screen.findByText('Saved. Want to keep going?')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Keep going' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save for later' })).toBeInTheDocument();
});

test('autosaves the record when moving between steps', async () => {
  renderNewWizard();
  await userEvent.type(await screen.findByRole('textbox'), 'Missed the bus');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByText('What are you feeling?');
  const records = await db.records.toArray();
  expect(records).toHaveLength(1);
  expect(records[0].situation).toBe('Missed the bus');
});
