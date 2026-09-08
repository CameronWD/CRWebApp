import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { completeRecord, newRecord, saveRecord } from '../lib/repository';
import HomeScreen from './HomeScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.settings.clear();
});

function renderHome() {
  return render(
    <HashRouter>
      <HomeScreen />
    </HashRouter>,
  );
}

test('shows the new record button', async () => {
  renderHome();
  expect(await screen.findByText('New record')).toBeInTheDocument();
});

test('lists open records under To finish', async () => {
  const r = newRecord();
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  await saveRecord(r);
  renderHome();
  expect(await screen.findByText('To finish')).toBeInTheDocument();
  expect(await screen.findByText(/Argument at work/)).toBeInTheDocument();
});

test('lists completed records under Recent', async () => {
  const r = newRecord();
  r.situation = 'Missed a call from mum';
  r.emotions = [{ emotion: 'Guilty', before: 70, after: 30 }];
  r.balancedThought = 'She knows I love her.';
  await saveRecord(r);
  await completeRecord(r);
  renderHome();
  expect(await screen.findByText('Recent')).toBeInTheDocument();
  expect(await screen.findByText(/Missed a call/)).toBeInTheDocument();
  expect(await screen.findByText(/70 → 30/)).toBeInTheDocument();
});

test('empty state shows a gentle prompt', async () => {
  renderHome();
  expect(
    await screen.findByText('When something stirs you up, capture it here.'),
  ).toBeInTheDocument();
});
