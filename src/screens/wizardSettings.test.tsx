import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord, saveRecord, setSetting } from '../lib/repository';
import WizardScreen from './WizardScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.settings.clear();
});

async function seedOpen() {
  const r = newRecord();
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  r.thoughts = [{ text: 'I will be fired', isHot: true }];
  await saveRecord(r);
  return r;
}

function renderComplete(id: number) {
  return render(
    <MemoryRouter initialEntries={[`/complete/${id}`]}>
      <Routes>
        <Route path="/complete/:id" element={<WizardScreen mode="complete" />} />
        <Route path="/" element={<div>home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('with the pattern setting off (default), evidence leads straight to the balanced step', async () => {
  const r = await seedOpen();
  renderComplete(r.id!);
  expect(await screen.findByText('What makes this thought feel true?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText("What doesn't fit that thought?")).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('What would a fairer take be?')).toBeInTheDocument();
  expect(screen.queryByText('Spot any patterns?')).not.toBeInTheDocument();
});

test('with the pattern setting on, the distortions step appears after evidence', async () => {
  await setSetting('namePatterns', '1');
  const r = await seedOpen();
  renderComplete(r.id!);
  expect(await screen.findByText('What makes this thought feel true?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByText("What doesn't fit that thought?");
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(await screen.findByText('Spot any patterns?')).toBeInTheDocument();
});
