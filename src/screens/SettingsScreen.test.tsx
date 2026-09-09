import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { addCustomEmotion, listCustomEmotions, newRecord, saveRecord } from '../lib/repository';
import type { BackupFile } from '../lib/backup';
import SettingsScreen from './SettingsScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
});

function renderSettings() {
  return render(
    <HashRouter>
      <SettingsScreen />
    </HashRouter>,
  );
}

test('shows export section with never-exported state', async () => {
  renderSettings();
  expect(await screen.findByRole('button', { name: 'Export backup' })).toBeInTheDocument();
  expect(screen.getByText(/Never exported/)).toBeInTheDocument();
});

test('lists custom emotions and removes one', async () => {
  await addCustomEmotion('Restless');
  renderSettings();
  expect(await screen.findByText('Restless')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Remove Restless' }));
  expect(await listCustomEmotions()).toHaveLength(0);
});

test('states the privacy promise', async () => {
  renderSettings();
  expect(await screen.findByText(/never leaves this device/i)).toBeInTheDocument();
});

test('importing a valid backup replaces existing data and shows confirmation', async () => {
  const existing = newRecord();
  existing.situation = 'will be replaced';
  await saveRecord(existing);

  const incoming = newRecord();
  incoming.situation = 'restored';
  const backup: BackupFile = {
    app: 'thought-records',
    version: 1,
    exportedAt: '2026-09-01T00:00:00.000Z',
    records: [incoming],
    customEmotions: [],
  };
  const json = JSON.stringify(backup);

  renderSettings();
  const input = screen.getByLabelText('Backup file');
  await userEvent.upload(input, new File([json], 'b.json', { type: 'application/json' }));

  expect(await screen.findByText('Replace everything?')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Replace and import' }));

  expect(await screen.findByText('Backup imported.')).toBeInTheDocument();
  const records = await db.records.toArray();
  expect(records).toHaveLength(1);
  expect(records[0].situation).toBe('restored');
});

test('importing a garbage file shows an error and leaves data untouched', async () => {
  const existing = newRecord();
  existing.situation = 'stays put';
  await saveRecord(existing);

  renderSettings();
  const input = screen.getByLabelText('Backup file');
  await userEvent.upload(input, new File(['not a backup'], 'garbage.json', { type: 'application/json' }));

  expect(await screen.findByText("This file doesn't look like a Thought Records backup.")).toBeInTheDocument();
  const records = await db.records.toArray();
  expect(records).toHaveLength(1);
  expect(records[0].situation).toBe('stays put');
});
