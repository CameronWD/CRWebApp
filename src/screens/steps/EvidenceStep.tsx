import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { activeThought } from '../../lib/repository';
import { AutoTextArea, StepShell } from '../../components/ui';
import { STEP_HELP } from '../../lib/stepHelp';

export default function EvidenceStep({
  record,
  dispatch,
  kind,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
  kind: 'for' | 'against';
}) {
  const field = kind === 'for' ? 'evidenceFor' : 'evidenceAgainst';
  const rt = record.format === 'realistic';
  return (
    <StepShell
      kicker={rt ? 'Gathering the evidence' : undefined}
      title={
        rt
          ? kind === 'for'
            ? 'Evidence for the thought'
            : 'Evidence against the thought'
          : kind === 'for'
            ? 'What makes this thought feel true?'
            : "What doesn't fit that thought?"
      }
      subtitle={
        kind === 'for'
          ? 'Facts only, not feelings. It’s okay if there are some.'
          : 'Facts that don’t line up with it — or what you’d point out to a friend who thought this.'
      }
      help={kind === 'for' ? STEP_HELP.evidenceFor : STEP_HELP.evidenceAgainst}
    >
      <blockquote className="rounded-2xl border-l-4 border-sage bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:border-sage dark:bg-night-surface">
        “{activeThought(record)}”
      </blockquote>
      <AutoTextArea
        value={record[field]}
        onChange={(v) =>
          dispatch({
            type: 'patch',
            fields: kind === 'for' ? { evidenceFor: v } : { evidenceAgainst: v },
          })
        }
      />
      <p className="text-xs text-mist dark:text-night-mist">Nothing coming? That’s fine — just tap Next.</p>
    </StepShell>
  );
}
