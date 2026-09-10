import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { downloadBackup, getLastExportAt, parseBackup, restoreBackup, type BackupFile } from '../lib/backup';
import {
  getSetting,
  setSetting,
  listCustomEmotions,
  removeCustomEmotion,
  getWorksheetFormat,
  WORKSHEET_FORMAT_KEY,
} from '../lib/repository';
import type { WorksheetFormat } from '../lib/types';
import { formatRelative } from '../lib/format';
import { Button, ConfirmSheet, Switch } from '../components/ui';
import ThemePicker from '../components/ThemePicker';
import AppHeader, { BackLink } from '../components/AppHeader';

function FormatOption({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`rounded-2xl p-4 text-left shadow-sm transition-shadow ${
        selected ? 'bg-surface ring-2 ring-sage dark:bg-night-surface' : 'bg-surface dark:bg-night-surface'
      }`}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="mt-0.5 block text-xs leading-relaxed text-mist dark:text-night-mist">{description}</span>
    </button>
  );
}

export default function SettingsScreen() {
  const lastExport = useLiveQuery(getLastExportAt, [], null);
  const custom = useLiveQuery(listCustomEmotions, [], []);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const [imported, setImported] = useState(false);
  const [namePatterns, setNamePatterns] = useState(false);
  const [format, setFormat] = useState<WorksheetFormat>('realistic');

  useEffect(() => {
    void getSetting('namePatterns').then((v) => setNamePatterns(v === '1'));
  }, []);

  useEffect(() => {
    void getWorksheetFormat().then(setFormat);
  }, []);

  const togglePatterns = (on: boolean) => {
    setNamePatterns(on);
    void setSetting('namePatterns', on ? '1' : '0');
  };

  const chooseFormat = (f: WorksheetFormat) => {
    setFormat(f);
    void setSetting(WORKSHEET_FORMAT_KEY, f);
  };

  const onFile = async (file: File) => {
    setError(null);
    try {
      setPending(parseBackup(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that file.');
    }
  };

  const doImport = async () => {
    if (!pending) return;
    try {
      await restoreBackup(pending);
      setImported(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not import that backup.');
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <AppHeader title="Settings" left={<BackLink />} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Theme</h2>
        <ThemePicker />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Worksheet</h2>
        <p className="text-sm leading-relaxed text-mist dark:text-night-mist">
          Which worksheet new records follow. Existing records always keep the one they were written with.
        </p>
        <div role="radiogroup" aria-label="Worksheet format" className="flex flex-col gap-2">
          <FormatOption
            title="Realistic Thinking"
            description="Your therapist's worksheet: one thought with a belief rating, one emotion, evidence, then an alternative thought."
            selected={format === 'realistic'}
            onSelect={() => chooseFormat('realistic')}
          />
          <FormatOption
            title="Classic"
            description="The original 8-step flow: several emotions and thoughts, a hot thought, and a balanced thought."
            selected={format === 'classic'}
            onSelect={() => chooseFormat('classic')}
          />
        </div>
      </section>

      {format === 'classic' && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Preferences</h2>
          <Switch
            checked={namePatterns}
            onChange={togglePatterns}
            label="Name the thinking pattern"
            description="Adds a step to tag thinking traps like catastrophising."
          />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Backup</h2>
        <p className="text-sm leading-relaxed text-mist dark:text-night-mist">
          Your records live only on this device. Export a backup file now and then and keep it somewhere safe.
        </p>
        <Button
          onClick={() => {
            setError(null);
            downloadBackup()
              .then(() => setExported(true))
              .catch((e: unknown) => {
                setError(e instanceof Error ? e.message : 'Could not export a backup.');
              });
          }}
        >
          Export backup
        </Button>
        <p className="text-xs text-mist dark:text-night-mist">
          {exported
            ? 'Backup exported just now.'
            : lastExport
              ? `Last exported ${formatRelative(lastExport)}.`
              : 'Never exported yet.'}
        </p>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          Import backup
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Backup file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = '';
          }}
        />
        {imported && <p className="text-xs text-mist dark:text-night-mist">Backup imported.</p>}
        {error && <p className="text-xs text-red-800/80 dark:text-red-400/80">{error}</p>}
      </section>

      {custom.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
            Your emotion words
          </h2>
          <div className="flex flex-col gap-2">
            {custom.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm dark:bg-night-surface">
                <span className="text-sm">{c.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${c.name}`}
                  onClick={() => void removeCustomEmotion(c.id!)}
                  className="p-1 text-mist dark:text-night-mist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">Privacy</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mist dark:text-night-mist">
          Everything you write is stored on your phone and never leaves this device. There is no account, no server
          and no tracking of any kind.
        </p>
      </section>

      <ConfirmSheet
        open={pending !== null}
        title="Replace everything?"
        body={`This will replace what's currently in the app with the backup (${pending?.records.length ?? 0} records). This can't be undone.`}
        confirmLabel="Replace and import"
        onConfirm={() => void doImport()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
