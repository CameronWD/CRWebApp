import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { completeRecord, newRecord, saveRecord } from '../lib/repository';
import RecordListScreen from './RecordListScreen';

beforeEach(async () => {
  await db.records.clear();
});

test('the All records list routes open records to the detail view', async () => {
  const r = newRecord('classic');
  r.situation = 'Half captured';
  await saveRecord(r);
  render(
    <HashRouter>
      <RecordListScreen />
    </HashRouter>,
  );
  const card = (await screen.findByText('Half captured')).closest('a');
  expect(card).toHaveAttribute('href', `#/record/${r.id}`);
});

test('deleting from a card removes it from the list', async () => {
  const r = newRecord('classic');
  r.situation = 'Ready to be cleared out';
  await saveRecord(r);
  await completeRecord(r);
  render(
    <HashRouter>
      <RecordListScreen />
    </HashRouter>,
  );
  await screen.findByText('Ready to be cleared out');
  const del = await screen.findByRole('button', { name: 'Delete record' });
  fireEvent.click(del);
  const sheetConfirm = screen.getAllByRole('button', { name: 'Delete record' })[1];
  fireEvent.click(sheetConfirm);
  await waitFor(() => {
    expect(screen.queryByText('Ready to be cleared out')).not.toBeInTheDocument();
  });
});
