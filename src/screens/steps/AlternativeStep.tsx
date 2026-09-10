import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { AutoTextArea, IntensitySlider, StepShell } from '../../components/ui';

export default function AlternativeStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      kicker="Realistic Thinking"
      title="What is your alternative thought?"
      subtitle="Something believable that fits the evidence on both sides — in your own words."
    >
      <blockquote className="rounded-2xl border-l-4 border-sage bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:border-sage dark:bg-night-surface">
        “{record.negativeThought}”
      </blockquote>
      {(record.evidenceFor || record.evidenceAgainst) && (
        <div className="flex flex-col gap-2 text-xs leading-relaxed text-mist dark:text-night-mist">
          {record.evidenceFor && <p><span className="font-medium">For:</span> {record.evidenceFor}</p>}
          {record.evidenceAgainst && <p><span className="font-medium">Against:</span> {record.evidenceAgainst}</p>}
        </div>
      )}
      <AutoTextArea
        value={record.alternativeThought}
        onChange={(v) => dispatch({ type: 'patch', fields: { alternativeThought: v } })}
        placeholder="A more realistic way to see it…"
      />
      <IntensitySlider
        label="How much do you believe in this thought?"
        value={record.beliefAfter ?? 50}
        onChange={(v) => dispatch({ type: 'patch', fields: { beliefAfter: v } })}
      />
    </StepShell>
  );
}
