import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { hotThought } from '../../lib/repository';
import { AutoTextArea, StepShell } from '../../components/ui';
import { STEP_HELP } from '../../lib/stepHelp';

export default function BalancedStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="What would a fairer take be?"
      subtitle="Something believable that accounts for both sides — not forced positivity. What would you tell a friend?"
      help={STEP_HELP.balanced}
    >
      <blockquote className="rounded-2xl border-l-4 border-sage bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:border-sage dark:bg-night-surface">
        “{hotThought(record)}”
      </blockquote>
      {(record.evidenceFor || record.evidenceAgainst) && (
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-mist dark:text-night-mist">
          {record.evidenceFor && <p><span className="font-medium">For:</span> {record.evidenceFor}</p>}
          {record.evidenceAgainst && <p><span className="font-medium">Against:</span> {record.evidenceAgainst}</p>}
        </div>
      )}
      <AutoTextArea
        value={record.balancedThought}
        onChange={(v) => dispatch({ type: 'patch', fields: { balancedThought: v } })}
      />
    </StepShell>
  );
}
