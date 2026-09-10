import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { setSetting } from '../lib/repository';
import WizardScreen from './WizardScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.settings.clear();
  await db.customEmotions.clear();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/new" element={<WizardScreen mode="new" />} />
        <Route path="/complete/:id" element={<WizardScreen mode="complete" />} />
        <Route path="/edit/:id" element={<WizardScreen mode="edit" />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('realistic flow follows the worksheet order end-to-end, and the format stamp outlives a later setting change', async () => {
  // 1. No worksheetFormat setting at all → defaults to realistic, situation first.
  const first = renderAt('/new');

  expect(await screen.findByText('What happened?')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'Missed a deadline at work');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // Order proof: situation → thought (not classic's emotions step).
  expect(await screen.findByText('What was your thought?')).toBeInTheDocument();
  expect(screen.getByText('How much do you believe in this thought?')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'I always let people down');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  // 2. Emotion before, then fork.
  expect(await screen.findByText('What was your emotion?')).toBeInTheDocument();
  await userEvent.click(screen.getByText('Anxious'));
  fireEvent.change(screen.getByRole('slider'), { target: { value: '70' } });
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('Saved. Want to keep going?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Save for later' }));

  const openRecords = await db.records.where('status').equals('open').toArray();
  expect(openRecords).toHaveLength(1);
  const saved = openRecords[0];
  expect(saved.format).toBe('realistic');
  expect(saved.id).toBeDefined();

  first.unmount();

  // Switching the setting afterwards must not retroactively change this record's format.
  await setSetting('worksheetFormat', 'classic');

  const second = renderAt(`/complete/${saved.id}`);
  expect(await screen.findByText('Evidence for the thought')).toBeInTheDocument();

  // 3. Finish the flow: evidence → alternative → emotion now → done.
  await userEvent.type(screen.getByRole('textbox'), 'I hit every deadline before this one');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('Evidence against the thought')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'One deadline does not mean I always fail');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('What is your alternative thought?')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'One missed deadline is not letting everyone down');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('What is your emotion now?')).toBeInTheDocument();
  await userEvent.click(screen.getByText('+ something else'));
  await userEvent.type(screen.getByLabelText('Custom emotion'), 'Calm');
  await userEvent.click(screen.getByRole('button', { name: 'Add' }));
  expect(await screen.findByText('How strong is the emotion?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('Well done.')).toBeInTheDocument();
  expect(screen.getByText(/One missed deadline is not letting everyone down/)).toBeInTheDocument();

  const done = await db.records.get(saved.id!);
  expect(done?.status).toBe('completed');
  expect(done?.beliefAfter).not.toBeNull();
  expect(done?.emotionNow?.emotion).toBe('Calm');

  second.unmount();
});

test('with worksheetFormat set to classic, /new starts the classic flow', async () => {
  await setSetting('worksheetFormat', 'classic');
  renderAt('/new');

  expect(await screen.findByText('What happened?')).toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox'), 'Something happened at the shops');
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('What are you feeling?')).toBeInTheDocument();
});
