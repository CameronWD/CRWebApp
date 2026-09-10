import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { AutoTextArea, StepShell } from '../../components/ui';
import { STEP_HELP } from '../../lib/stepHelp';

export default function SituationStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="What happened?"
      subtitle="Just the facts — what a camera would have seen. Where, when, who with."
      help={STEP_HELP.situation}
    >
      <AutoTextArea
        value={record.situation}
        onChange={(v) => dispatch({ type: 'patch', fields: { situation: v } })}
        autoFocus
      />
    </StepShell>
  );
}
