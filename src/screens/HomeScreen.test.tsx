import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { db } from '../lib/db';
import { completeRecord, newRecord, saveRecord } from '../lib/repository';
import HomeScreen from './HomeScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.settings.clear();
  vi.mocked(window.scrollTo).mockClear();
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
  const r = newRecord('classic');
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  await saveRecord(r);
  renderHome();
  expect(await screen.findByText('To finish')).toBeInTheDocument();
  expect(await screen.findByText(/Argument at work/)).toBeInTheDocument();
});

test('lists completed records under Recent', async () => {
  const r = newRecord('classic');
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

test('completed section sits above open records, and records run oldest to newest', async () => {
  const a = newRecord('classic');
  a.situation = 'older open';
  a.createdAt = '2026-09-01T10:00:00.000Z';
  await saveRecord(a);
  const b = newRecord('classic');
  b.situation = 'newer open';
  b.createdAt = '2026-09-05T10:00:00.000Z';
  await saveRecord(b);
  const c = newRecord('classic');
  c.situation = 'a completed one';
  await saveRecord(c);
  await completeRecord(c);
  renderHome();

  const recent = await screen.findByText('Recent');
  const toFinish = await screen.findByText('To finish');
  expect(recent.compareDocumentPosition(toFinish) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

  const older = await screen.findByText(/older open/);
  const newer = await screen.findByText(/newer open/);
  expect(older.compareDocumentPosition(newer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('To finish cards link to the completion wizard, and See all appears when there is nothing Recent', async () => {
  const r = newRecord('classic');
  r.situation = 'Argument at work';
  await saveRecord(r);
  renderHome();

  const situation = await screen.findByText(/Argument at work/);
  const link = situation.closest('a');
  expect(link).toHaveAttribute('href', `#/complete/${r.id}`);

  const seeAll = screen.getByRole('link', { name: 'See all' });
  expect(seeAll).toHaveAttribute('href', '#/records');
});

test('deleting an open record from its card removes it from the list', async () => {
  const r = newRecord('classic');
  r.situation = 'Overdue apology';
  await saveRecord(r);
  renderHome();

  await screen.findByText(/Overdue apology/);
  const del = await screen.findByRole('button', { name: 'Delete record' });
  fireEvent.click(del);
  const sheetConfirm = screen.getAllByRole('button', { name: 'Delete record' })[1];
  fireEvent.click(sheetConfirm);
  await waitFor(() => {
    expect(screen.queryByText(/Overdue apology/)).not.toBeInTheDocument();
  });
});

test('anchors scroll to the bottom once both open and completed records have loaded', async () => {
  const open = newRecord('classic');
  open.situation = 'An open one';
  await saveRecord(open);
  const completed = newRecord('classic');
  completed.situation = 'A completed one';
  await saveRecord(completed);
  await completeRecord(completed);

  renderHome();

  expect(await screen.findByText(/An open one/)).toBeInTheDocument();
  expect(await screen.findByText(/A completed one/)).toBeInTheDocument();
  expect(vi.mocked(window.scrollTo)).toHaveBeenCalled();
});
