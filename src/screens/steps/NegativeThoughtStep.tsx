import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { AutoTextArea, IntensitySlider, StepShell } from '../../components/ui';

export default function NegativeThoughtStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      kicker="Identifying negative thoughts"
      title="What was your thought?"
      subtitle="The thought that went through your mind in that moment, in its own words."
    >
      <AutoTextArea
        value={record.negativeThought}
        onChange={(v) => dispatch({ type: 'patch', fields: { negativeThought: v } })}
        placeholder="“I always mess this up”"
        autoFocus
      />
      <IntensitySlider
        label="How much do you believe in this thought?"
        value={record.beliefBefore ?? 50}
        onChange={(v) => dispatch({ type: 'patch', fields: { beliefBefore: v } })}
      />
    </StepShell>
  );
}
