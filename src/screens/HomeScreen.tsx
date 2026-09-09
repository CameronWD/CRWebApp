import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { listCompletedRecords, listOpenRecords } from '../lib/repository';
import { RecordCard } from '../components/RecordCard';
import ExportNudge from '../components/ExportNudge';
import InstallNudge from '../components/InstallNudge';
import AppHeader from '../components/AppHeader';

export default function HomeScreen() {
  const open = useLiveQuery(listOpenRecords, [], []);
  const completed = useLiveQuery(listCompletedRecords, [], []);
  // Newest records sit at the BOTTOM, nearest the thumb and the button.
  const recent = completed.slice(0, 5).reverse();
  const openOldestFirst = [...open].reverse();
  const hasAny = open.length > 0 || completed.length > 0;

  // Open the page anchored at the bottom, chat-style, re-anchoring as the two
  // record queries stream in so we don't latch onto a half-populated feed.
  useLayoutEffect(() => {
    if (!hasAny) return;
    window.scrollTo(0, document.body.scrollHeight);
  }, [open.length, completed.length, hasAny]);

  return (
    <div className="flex min-h-svh flex-col gap-8 pb-[calc(11rem+env(safe-area-inset-bottom))]">
      <AppHeader
        title="Thought Records"
        right={
          <Link to="/settings" aria-label="Settings" className="-mr-2 p-2 text-mist dark:text-night-mist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
        }
      />

      {!hasAny && (
        <p className="my-auto text-center text-sm leading-relaxed text-mist dark:text-night-mist">
          When something stirs you up, capture it here.
        </p>
      )}

      {hasAny && (
        <div className="mt-auto flex flex-col gap-8">
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

          {openOldestFirst.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">
                  To finish
                </h2>
                {recent.length === 0 && (
                  <Link to="/records" className="text-sm text-sage-deep dark:text-sage">
                    See all
                  </Link>
                )}
              </div>
              {openOldestFirst.map((r) => (
                <RecordCard key={r.id} record={r} />
              ))}
            </section>
          )}

          <InstallNudge />
          <ExportNudge />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto w-full max-w-md bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 dark:from-night-bg dark:via-night-bg">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link
              to="/new"
              className="block rounded-3xl bg-sage-deep p-6 text-white shadow-md dark:bg-sage dark:text-night-bg"
            >
              <span className="font-display text-2xl font-medium">New record</span>
              <p className="mt-1 text-sm opacity-80">Catch a difficult moment while it's fresh.</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
