import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { listCompletedRecords, listOpenRecords } from '../lib/repository';
import { RecordCard } from '../components/RecordCard';

export default function RecordListScreen() {
  const open = useLiveQuery(listOpenRecords, [], []);
  const completed = useLiveQuery(listCompletedRecords, [], []);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <header className="flex items-center gap-3">
        <Link to="/" aria-label="Back" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-xl font-medium">All records</h1>
      </header>
      {open.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">To finish</h2>
          {open.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </section>
      )}
      <section className="flex flex-col gap-3">
        {completed.map((r) => (
          <RecordCard key={r.id} record={r} />
        ))}
        {open.length === 0 && completed.length === 0 && (
          <p className="mt-8 text-center text-sm text-mist dark:text-night-mist">Nothing here yet.</p>
        )}
      </section>
    </div>
  );
}
