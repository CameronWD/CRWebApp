import { useLiveQuery } from 'dexie-react-hooks';
import { listCompletedRecords, listOpenRecords } from '../lib/repository';
import { RecordCard } from '../components/RecordCard';
import AppHeader, { BackLink } from '../components/AppHeader';

export default function RecordListScreen() {
  const open = useLiveQuery(listOpenRecords, [], []);
  const completed = useLiveQuery(listCompletedRecords, [], []);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <AppHeader title="All records" left={<BackLink />} />
      {open.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-mist dark:text-night-mist">To finish</h2>
          {open.map((r) => (
            <RecordCard key={r.id} record={r} openTo="detail" />
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
