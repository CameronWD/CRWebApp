import type { Dispatch } from 'react';
import { motion } from 'framer-motion';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { DISTORTIONS } from '../../lib/constants';
import { StepShell } from '../../components/ui';

export default function DistortionsStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="Spot any patterns?"
      subtitle="These are common thinking traps. Tag any that fit the thought — or none at all."
    >
      <div className="flex flex-col gap-2">
        {DISTORTIONS.map((d) => {
          const selected = record.distortions.includes(d.name);
          return (
            <motion.button
              key={d.name}
              type="button"
              whileTap={{ scale: 0.98 }}
              aria-pressed={selected}
              onClick={() => dispatch({ type: 'toggleDistortion', name: d.name })}
              className={`rounded-2xl p-4 text-left transition-colors ${
                selected
                  ? 'bg-sage-deep text-white dark:bg-sage dark:text-night-bg'
                  : 'bg-surface shadow-sm dark:bg-night-surface'
              }`}
            >
              <span className="block text-sm font-medium">{d.name}</span>
              <span className={`mt-0.5 block text-xs leading-relaxed ${selected ? 'opacity-80' : 'text-mist dark:text-night-mist'}`}>
                {d.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}
