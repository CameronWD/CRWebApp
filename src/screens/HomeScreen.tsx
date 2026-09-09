import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { listCompletedRecords, listOpenRecords } from '../lib/repository';
import { RecordCard } from '../components/RecordCard';
import ExportNudge from '../components/ExportNudge';

export default function HomeScreen() {
  const open = useLiveQuery(listOpenRecords, [], []);
  const completed = useLiveQuery(listCompletedRecords, [], []);
  const recent = completed.slice(0, 5);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-xl font-medium">Thought Records</h1>
        <Link to="/settings" aria-label="Settings" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <ExportNudge />

      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          to="/new"
          className="block rounded-3xl bg-sage-deep p-6 text-white shadow-md dark:bg-sage dark:text-night-bg"
        >
          <span className="font-display text-2xl font-medium">New record</span>
          <p className="mt-1 text-sm opacity-80">Catch a difficult moment while it's fresh.</p>
        </Link>
      </motion.div>

      {open.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
            To finish
          </h2>
          {open.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </section>
      )}

      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
              Recent
            </h2>
            <Link to="/records" className="text-sm text-sage-deep dark:text-sage">
              See all
            </Link>
          </div>
          {recent.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </section>
      )}

      {open.length === 0 && completed.length === 0 && (
        <p className="mt-8 text-center text-sm leading-relaxed text-mist dark:text-night-mist">
          When something stirs you up, capture it here.
        </p>
      )}
    </div>
  );
}
