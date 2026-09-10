import type { ThoughtRecord } from '../../lib/types';
import { Button, StepShell } from '../../components/ui';
import { EmotionSummary, RtEmotionSummary } from '../../components/RecordCard';

export default function DoneStep({
  record,
  onFinish,
}: {
  record: ThoughtRecord;
  onFinish: () => void;
}) {
  return (
    <StepShell
      title="Well done."
      subtitle="Working through this takes real effort. Here's how the feelings shifted:"
    >
      {record.format === 'realistic' ? (
        <>
          <div className="flex flex-wrap gap-2">
            <RtEmotionSummary record={record} />
          </div>
          {record.alternativeThought && (
            <blockquote className="rounded-2xl bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:bg-night-surface">
              “{record.alternativeThought}”
            </blockquote>
          )}
          {record.beliefBefore !== null && record.beliefAfter !== null && (
            <p className="text-xs text-mist dark:text-night-mist">
              Belief in the thought: {record.beliefBefore}% → believed the alternative {record.beliefAfter}%
            </p>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {record.emotions.map((e) => (
              <EmotionSummary key={e.emotion} rating={e} />
            ))}
          </div>
          {record.balancedThought && (
            <blockquote className="rounded-2xl bg-sage-soft/60 p-4 text-sm italic leading-relaxed dark:bg-night-surface">
              “{record.balancedThought}”
            </blockquote>
          )}
        </>
      )}
      <div className="mt-4">
        <Button onClick={onFinish} className="w-full">
          Back home
        </Button>
      </div>
    </StepShell>
  );
}
