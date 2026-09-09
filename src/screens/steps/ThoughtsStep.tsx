import { useState, type Dispatch } from 'react';
import { motion } from 'framer-motion';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { StepShell } from '../../components/ui';

export default function ThoughtsStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    dispatch({ type: 'addThought', text: draft });
    setDraft('');
  };

  return (
    <StepShell
      title="What went through your mind?"
      subtitle="Add each thought as it came. Then tap the one that stings the most — that's the one we'll work on."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex items-center gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="“I always mess this up”"
          aria-label="New thought"
          autoFocus
          className="min-w-0 flex-1 rounded-2xl bg-surface p-4 text-base shadow-sm outline-none ring-sage placeholder:text-mist/60 focus:ring-2 dark:bg-night-surface dark:placeholder:text-night-mist/60"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-2xl bg-sage-soft px-4 py-4 text-sm font-medium text-sage-deep disabled:opacity-40 dark:bg-night-surface dark:text-sage"
        >
          Add
        </button>
      </form>
      <div className="flex flex-col gap-2">
        {record.thoughts.map((t, i) => (
          <motion.div
            key={`${i}-${t.text}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm transition-colors ${
              t.isHot
                ? 'bg-sage-deep text-white dark:bg-sage dark:text-night-bg'
                : 'bg-surface dark:bg-night-surface'
            }`}
          >
            <button
              type="button"
              onClick={() => dispatch({ type: 'setHot', index: i })}
              className="min-w-0 flex-1 text-left text-sm leading-relaxed"
            >
              {t.text}
              {t.isHot && <span className="mt-1 block text-xs opacity-75">the one that stings</span>}
            </button>
            <button
              type="button"
              aria-label={`Remove thought: ${t.text}`}
              onClick={() => dispatch({ type: 'removeThought', index: i })}
              className="p-1 opacity-60"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </div>
    </StepShell>
  );
}
