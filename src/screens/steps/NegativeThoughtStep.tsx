import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { AutoTextArea, IntensitySlider, StepShell } from '../../components/ui';
import { STEP_HELP } from '../../lib/stepHelp';

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
      help={STEP_HELP.negativeThought}
    >
      <AutoTextArea
        value={record.negativeThought}
        onChange={(v) => dispatch({ type: 'patch', fields: { negativeThought: v } })}
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
