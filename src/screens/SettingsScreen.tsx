import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { downloadBackup, getLastExportAt, parseBackup, restoreBackup, type BackupFile } from '../lib/backup';
import { listCustomEmotions, removeCustomEmotion } from '../lib/repository';
import { formatRelative } from '../lib/format';
import { Button, ConfirmSheet } from '../components/ui';

export default function SettingsScreen() {
  const lastExport = useLiveQuery(getLastExportAt, [], null);
  const custom = useLiveQuery(listCustomEmotions, [], []);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);
  const [imported, setImported] = useState(false);

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
    <div className="flex flex-col gap-8 pt-4 pb-10">
      <header className="flex items-center gap-3">
        <Link to="/" aria-label="Back" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-medium">Settings</h1>
      </header>

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
