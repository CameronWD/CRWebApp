import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { EmotionRating, ThoughtRecord } from '../lib/types';
import { formatRelative } from '../lib/format';
import { deleteRecord } from '../lib/repository';
import { ConfirmSheet } from './ui';

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

const REVEAL_WIDTH = 84;

// Only one card may be revealed at a time across the whole app.
let closeActiveCard: (() => void) | null = null;

export function RecordCard({
  record,
  openTo = 'wizard',
}: {
  record: ThoughtRecord;
  openTo?: RecordCardTarget;
}) {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const dragging = useRef(false);

  const close = () => setRevealed(false);

  const reveal = () => {
    if (closeActiveCard && closeActiveCard !== close) closeActiveCard();
    closeActiveCard = close;
    setRevealed(true);
  };

  // Scrolling closes the revealed card.
  useEffect(() => {
    if (!revealed) return;
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [revealed]);

  const to =
    record.status === 'open' && openTo === 'wizard'
      ? `/complete/${record.id}`
      : `/record/${record.id}`;

  const remove = async () => {
    setConfirming(false);
    setRevealed(false);
    await deleteRecord(record.id!);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Delete record"
        onFocus={reveal}
        onClick={() => setConfirming(true)}
        className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center rounded-2xl bg-red-800/10 text-xs font-medium text-red-800/80 dark:bg-red-400/10 dark:text-red-400/80"
      >
        Delete
      </button>
      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={0.05}
        animate={{ x: revealed ? -REVEAL_WIDTH : 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 40 }}
        onDragStart={() => {
          dragging.current = true;
          if (closeActiveCard && closeActiveCard !== close) closeActiveCard();
        }}
        onDragEnd={(_, info) => {
          const settled = (revealed ? -REVEAL_WIDTH : 0) + info.offset.x;
          if (settled < -REVEAL_WIDTH / 2) reveal();
          else close();
          // Let the post-drag click fire (and be suppressed) before clearing.
          setTimeout(() => {
            dragging.current = false;
          }, 0);
        }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Link
          to={to}
          draggable={false}
          onClick={(e) => {
            if (dragging.current || revealed) {
              e.preventDefault();
              close();
            }
          }}
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
          {record.format === 'realistic' ? (
            record.emotions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <RtEmotionSummary record={record} />
              </div>
            )
          ) : (
            record.emotions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {record.emotions.map((e) => (
                  <EmotionSummary key={e.emotion} rating={e} />
                ))}
              </div>
            )
          )}
        </Link>
      </motion.div>

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
