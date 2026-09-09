import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getLastExportAt, shouldNudgeExport } from '../lib/backup';
import { db } from '../lib/db';

export default function ExportNudge() {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('exportNudgeDismissed') === '1',
  );
  const show = useLiveQuery(
    async () => {
      const lastExport = await getLastExportAt();
      // updatedAt (not createdAt) drives the nudge so edits to existing
      // records — not just brand-new ones — count as "something to back up".
      const newest = await db.records.orderBy('updatedAt').last();
      return shouldNudgeExport(lastExport, newest?.updatedAt ?? null, new Date());
    },
    [],
    false,
  );

  if (!show || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-blue-soft p-4 dark:bg-night-surface">
      <p className="text-sm leading-relaxed">
        It's been a while —{' '}
        <Link to="/settings" className="font-medium text-blue-dusty underline">
          back up your records
        </Link>{' '}
        so they're safe.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem('exportNudgeDismissed', '1');
          setDismissed(true);
        }}
        className="p-1 text-mist dark:text-night-mist"
      >
        ✕
      </button>
    </div>
  );
}
