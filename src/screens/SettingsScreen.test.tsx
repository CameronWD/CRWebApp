import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { beforeEach, expect, test } from 'vitest';
import { db } from '../lib/db';
import { addCustomEmotion, listCustomEmotions } from '../lib/repository';
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
