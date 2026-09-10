import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { completeRecord, newRecord, saveRecord } from '../lib/repository';
import RecordDetailScreen from './RecordDetailScreen';

beforeEach(async () => {
  await db.records.clear();
});

async function seedCompleted() {
  const r = newRecord('classic');
  r.situation = 'Argument at work';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: 45 }];
  r.thoughts = [{ text: 'I will be fired', isHot: true }];
  r.evidenceFor = 'Manager was short with me';
  r.evidenceAgainst = 'Good review last month';
  r.distortions = ['Catastrophising'];
  r.balancedThought = 'One tense chat is not a firing';
  await saveRecord(r);
  await completeRecord(r);
  return r;
}

function renderDetail(id: number) {
  return render(
    <MemoryRouter initialEntries={[`/record/${id}`]}>
      <Routes>
        <Route path="/record/:id" element={<RecordDetailScreen />} />
        <Route path="/" element={<div>home</div>} />
        <Route path="/records" element={<div>records list</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

test('shows every section of a completed record', async () => {
  const r = await seedCompleted();
  renderDetail(r.id!);
  expect(await screen.findByText('Argument at work')).toBeInTheDocument();
  expect(screen.getByText(/80 → 45/)).toBeInTheDocument();
  expect(screen.getByText('I will be fired')).toBeInTheDocument();
  expect(screen.getByText('Manager was short with me')).toBeInTheDocument();
  expect(screen.getByText('Good review last month')).toBeInTheDocument();
  expect(screen.getByText('Catastrophising')).toBeInTheDocument();
  expect(screen.getByText('One tense chat is not a firing')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Edit' })).toBeInTheDocument();
});

test('a non-numeric id redirects home instead of hanging blank', async () => {
  renderDetail(NaN);
  expect(await screen.findByText('home')).toBeInTheDocument();
});

test('open records offer Continue instead of Edit', async () => {
  const r = newRecord('classic');
  r.situation = 'Half captured';
  await saveRecord(r);
  renderDetail(r.id!);
  expect(await screen.findByRole('link', { name: 'Continue' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
});

test('delete asks for confirmation then removes the record', async () => {
  const r = await seedCompleted();
  renderDetail(r.id!);
  await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
  expect(screen.getByText('Delete this record?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Delete record' }));
  expect(await screen.findByText('records list')).toBeInTheDocument();
  expect(await db.records.count()).toBe(0);
});

test('an open record can also be deleted', async () => {
  const r = newRecord('classic');
  r.situation = 'Half captured';
  await saveRecord(r);
  renderDetail(r.id!);
  await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
  expect(screen.getByText('Delete this record?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Delete record' }));
  expect(await screen.findByText('records list')).toBeInTheDocument();
  expect(await db.records.count()).toBe(0);
});

test('an open record with no situation shows a gentle fallback heading', async () => {
  const r = newRecord('classic');
  await saveRecord(r);
  renderDetail(r.id!);
  expect(await screen.findByText('Not written yet')).toBeInTheDocument();
});

test('shows every section of a completed classic record (regression guard)', async () => {
  const r = await seedCompleted();
  renderDetail(r.id!);
  expect(await screen.findByText('Argument at work')).toBeInTheDocument();
  expect(screen.getByText('What went through my mind')).toBeInTheDocument();
  expect(screen.getByText('I will be fired')).toBeInTheDocument();
  expect(screen.getByText('hot thought')).toBeInTheDocument();
  expect(screen.getByText('Evidence for')).toBeInTheDocument();
  expect(screen.getByText('Evidence against')).toBeInTheDocument();
  expect(screen.getByText('Thinking traps')).toBeInTheDocument();
  expect(screen.getByText('Catastrophising')).toBeInTheDocument();
  expect(screen.getByText('A fairer take')).toBeInTheDocument();
  expect(screen.getByText('One tense chat is not a firing')).toBeInTheDocument();
});

async function seedCompletedRealistic() {
  const r = newRecord('realistic');
  r.situation = 'Missed the deadline';
  r.emotions = [{ emotion: 'Anxious', before: 80, after: null }];
  r.negativeThought = 'I always let people down';
  r.beliefBefore = 90;
  r.evidenceFor = 'I was late this time';
  r.evidenceAgainst = 'I have hit every other deadline this year';
  r.alternativeThought = 'One missed deadline is not a pattern';
  r.beliefAfter = 40;
  r.emotionNow = { emotion: 'Calm', strength: 30 };
  await saveRecord(r);
  await completeRecord(r);
  return r;
}

test('shows the realistic-thinking sections for a completed realistic record', async () => {
  const r = await seedCompletedRealistic();
  renderDetail(r.id!);
  expect(await screen.findByText('Missed the deadline')).toBeInTheDocument();
  expect(screen.getByText('I always let people down')).toBeInTheDocument();
  expect(screen.getByText('Believed 90%')).toBeInTheDocument();
  expect(screen.getByText('Evidence for the thought')).toBeInTheDocument();
  expect(screen.getByText('I was late this time')).toBeInTheDocument();
  expect(screen.getByText('Evidence against the thought')).toBeInTheDocument();
  expect(screen.getByText('I have hit every other deadline this year')).toBeInTheDocument();
  expect(screen.getByText('One missed deadline is not a pattern')).toBeInTheDocument();
  expect(screen.getByText('Believed 40%')).toBeInTheDocument();
  expect(screen.queryByText('hot thought')).not.toBeInTheDocument();
  expect(screen.queryByText('Thinking traps')).not.toBeInTheDocument();
});
