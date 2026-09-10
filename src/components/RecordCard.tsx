import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { EmotionRating, ThoughtRecord } from '../lib/types';
import { formatRelative } from '../lib/format';

export function EmotionSummary({ rating }: { rating: EmotionRating }) {
  const text =
    rating.after === null
      ? `${rating.emotion} ${rating.before}`
      : `${rating.emotion} ${rating.before} → ${rating.after}`;
  return (
    <span className="inline-flex items-baseline rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage-deep dark:bg-night-surface dark:text-sage">
      {text}
    </span>
  );
}

export function RtEmotionSummary({ record }: { record: ThoughtRecord }) {
  const before = record.emotions[0];
  if (!before) return null;
  const now = record.emotionNow;
  const text = !now
    ? `${before.emotion} ${before.before}`
    : now.emotion === before.emotion
      ? `${before.emotion} ${before.before} → ${now.strength}`
      : `${before.emotion} ${before.before} → ${now.emotion} ${now.strength}`;
  return (
    <span className="inline-flex items-baseline rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage-deep dark:bg-night-surface dark:text-sage">
      {text}
    </span>
  );
}

export type RecordCardTarget = 'wizard' | 'detail';

export function RecordCard({
  record,
  openTo = 'wizard',
}: {
  record: ThoughtRecord;
  openTo?: RecordCardTarget;
}) {
  const to =
    record.status === 'open' && openTo === 'wizard'
      ? `/complete/${record.id}`
      : `/record/${record.id}`;
  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="block rounded-2xl bg-surface p-4 shadow-sm dark:bg-night-surface"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-mist dark:text-night-mist">
            {formatRelative(record.createdAt)}
          </span>
          {record.status === 'open' && (
            <span className="text-xs font-medium text-blue-dusty">Unfinished</span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed">{record.situation}</p>
        {record.emotions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {record.emotions.map((e) => (
              <EmotionSummary key={e.emotion} rating={e} />
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
