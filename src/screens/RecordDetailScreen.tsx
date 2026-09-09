import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ThoughtRecord } from '../lib/types';
import { deleteRecord, getRecord } from '../lib/repository';
import { formatFullDate } from '../lib/format';
import { ConfirmSheet } from '../components/ui';
import { EmotionSummary } from '../components/RecordCard';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-wide text-mist dark:text-night-mist">{label}</h2>
      <div className="mt-1.5 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default function RecordDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ThoughtRecord | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isInteger(n)) {
      navigate('/');
      return;
    }
    void getRecord(n)
      .then((r) => {
        if (r) setRecord(r);
        else navigate('/');
      })
      .catch(() => navigate('/'));
  }, [id, navigate]);

  if (!record) return null;

  const remove = async () => {
    await deleteRecord(record.id!);
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-6 pt-4 pb-10">
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="p-2 text-mist dark:text-night-mist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Link
          to={record.status === 'open' ? `/complete/${record.id}` : `/edit/${record.id}`}
          className="rounded-full bg-sage-soft px-4 py-2 text-sm font-medium text-sage-deep dark:bg-night-surface dark:text-sage"
        >
          {record.status === 'open' ? 'Continue' : 'Edit'}
        </Link>
      </header>

      <div>
        <p className="text-xs text-mist dark:text-night-mist">{formatFullDate(record.createdAt)}</p>
        <h1 className="mt-1 font-display text-xl font-medium leading-snug">{record.situation}</h1>
      </div>

      {record.emotions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {record.emotions.map((e) => (
            <EmotionSummary key={e.emotion} rating={e} />
          ))}
        </div>
      )}

      {record.thoughts.length > 0 && (
        <Section label="What went through my mind">
          <ul className="flex flex-col gap-1">
            {record.thoughts.map((t, i) => (
              <li key={i} className={t.isHot ? 'font-medium' : ''}>
                {t.text}
                {t.isHot && <span className="ml-2 text-xs text-sage-deep dark:text-sage">hot thought</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {record.evidenceFor && <Section label="Evidence for">{record.evidenceFor}</Section>}
      {record.evidenceAgainst && <Section label="Evidence against">{record.evidenceAgainst}</Section>}

      {record.distortions.length > 0 && (
        <Section label="Thinking traps">
          <div className="flex flex-wrap gap-1.5">
            {record.distortions.map((d) => (
              <span key={d} className="rounded-full bg-blue-soft px-2.5 py-1 text-xs font-medium text-blue-dusty dark:bg-night-surface">
                {d}
              </span>
            ))}
          </div>
        </Section>
      )}

      {record.balancedThought && (
        <Section label="A fairer take">
          <blockquote className="rounded-2xl bg-sage-soft/60 p-4 italic dark:bg-night-surface">
            “<span>{record.balancedThought}</span>”
          </blockquote>
        </Section>
      )}

      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-4 self-center text-sm text-red-800/80 dark:text-red-400/80"
      >
        Delete
      </button>

      <ConfirmSheet
        open={confirming}
        title="Delete this record?"
        body="It will be gone from this device for good. If you've exported a backup, it stays in that file."
        confirmLabel="Delete record"
        onConfirm={() => void remove()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
