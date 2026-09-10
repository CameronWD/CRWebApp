import type { Dispatch } from 'react';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { IntensitySlider, StepShell } from '../../components/ui';
import { STEP_HELP } from '../../lib/stepHelp';

export default function RerateStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  return (
    <StepShell
      title="How do those feelings sit now?"
      subtitle="With your balanced thought in mind, rate the same feelings again. Any shift counts — it doesn't have to reach zero."
      help={STEP_HELP.rerate}
    >
      <div className="flex flex-col gap-3">
        {record.emotions.map((e) => (
          <IntensitySlider
            key={e.emotion}
            label={e.emotion}
            value={e.after ?? e.before}
            hint={`was ${e.before}`}
            onChange={(v) => dispatch({ type: 'setAfter', emotion: e.emotion, value: v })}
          />
        ))}
      </div>
    </StepShell>
  );
}
