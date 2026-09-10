import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from '../lib/db';
import {
  addCustomEmotion,
  getSetting,
  listCustomEmotions,
  newRecord,
  saveRecord,
  WORKSHEET_FORMAT_KEY,
} from '../lib/repository';
import type { BackupFile } from '../lib/backup';
import SettingsScreen from './SettingsScreen';

beforeEach(async () => {
  await db.records.clear();
  await db.customEmotions.clear();
  await db.settings.clear();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
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
  const existing = newRecord('classic');
  existing.situation = 'will be replaced';
  await saveRecord(existing);

  const incoming = newRecord('classic');
  incoming.situation = 'restored';
  const backup: BackupFile = {
    app: 'thought-records',
    version: 2,
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
  const existing = newRecord('classic');
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

test('theme picker switches and persists the theme', async () => {
  renderSettings();
  const dusk = await screen.findByRole('button', { name: /Dusk/ });
  await userEvent.click(dusk);
  expect(document.documentElement.dataset.theme).toBe('dusk');
  expect(localStorage.getItem('theme')).toBe('dusk');
  expect(dusk).toHaveAttribute('aria-pressed', 'true');
});

test('thinking-pattern toggle is off by default and persists when turned on', async () => {
  renderSettings();
  fireEvent.click(await screen.findByRole('radio', { name: /Classic/ }));
  const sw = await screen.findByRole('switch', { name: /Name the thinking pattern/ });
  expect(sw).toHaveAttribute('aria-checked', 'false');
  await userEvent.click(sw);
  expect(sw).toHaveAttribute('aria-checked', 'true');
  await waitFor(async () => {
    expect(await getSetting('namePatterns')).toBe('1');
  });
});

describe('worksheet format', () => {
  test('defaults to Realistic Thinking and hides the patterns toggle', async () => {
    renderSettings();
    const rt = await screen.findByRole('radio', { name: /Realistic Thinking/ });
    expect(rt).toBeChecked();
    expect(screen.queryByText('Name the thinking pattern')).not.toBeInTheDocument();
  });

  test('choosing Classic persists the setting and reveals the patterns toggle', async () => {
    renderSettings();
    fireEvent.click(await screen.findByRole('radio', { name: /Classic/ }));
    expect(await screen.findByText('Name the thinking pattern')).toBeInTheDocument();
    expect(await getSetting(WORKSHEET_FORMAT_KEY)).toBe('classic');
  });
});
