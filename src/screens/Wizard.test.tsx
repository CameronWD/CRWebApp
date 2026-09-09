import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord } from '../lib/repository';
import Wizard from './Wizard';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  window.history.replaceState(null, '', '#/');
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

test('double-clicking Close on an unsaved record does not create two records', async () => {
  renderNewWizard();
  await userEvent.type(await screen.findByRole('textbox'), 'Missed the bus');
  const close = screen.getByRole('button', { name: 'Close' });
  await userEvent.dblClick(close);
  expect(await db.records.toArray()).toHaveLength(1);
});

function renderWizardWithRoutes() {
  return render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<div>home stub</div>} />
        <Route path="/new" element={<Wizard initialRecord={newRecord()} mode="new" />} />
      </Routes>
    </HashRouter>,
  );
}

test('closing a deep-linked wizard falls back to home (no history behind it)', async () => {
  window.history.replaceState(null, '', '#/new');
  renderWizardWithRoutes();
  await screen.findByText('What happened?');
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(await screen.findByText('home stub')).toBeInTheDocument();
});

test('closing the wizard after in-app navigation goes back to the previous page', async () => {
  window.history.replaceState(null, '', '#/');
  renderWizardWithRoutes();
  await screen.findByText('home stub');
  window.history.pushState({ idx: 1 }, '', '#/new');
  window.dispatchEvent(new PopStateEvent('popstate', { state: { idx: 1 } }));
  await screen.findByText('What happened?');
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(await screen.findByText('home stub')).toBeInTheDocument();
});

test('repeated autosaves across multiple step transitions update in place, not duplicate', async () => {
  renderNewWizard();
  await userEvent.type(await screen.findByRole('textbox'), 'Missed the bus');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('What are you feeling?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Anxious' }));
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('What went through your mind?')).toBeInTheDocument();

  const records = await db.records.toArray();
  expect(records).toHaveLength(1);
  expect(records[0].situation).toBe('Missed the bus');
});
