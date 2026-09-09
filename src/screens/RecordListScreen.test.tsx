import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { newRecord, saveRecord } from '../lib/repository';
import RecordListScreen from './RecordListScreen';

beforeEach(async () => {
  await db.records.clear();
});

test('the All records list routes open records to the detail view', async () => {
  const r = newRecord();
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
