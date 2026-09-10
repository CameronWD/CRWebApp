import { useState, type Dispatch } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { ThoughtRecord } from '../../lib/types';
import type { WizardAction } from '../../lib/wizard';
import { addCustomEmotion, allEmotionNames } from '../../lib/repository';
import { Chip, IntensitySlider, StepShell } from '../../components/ui';
import { DEFAULT_EMOTIONS } from '../../lib/constants';

export default function EmotionNowStep({
  record,
  dispatch,
}: {
  record: ThoughtRecord;
  dispatch: Dispatch<WizardAction>;
}) {
  const names = useLiveQuery(allEmotionNames, [], [...DEFAULT_EMOTIONS]);
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState('');

  const selected = (name: string) => record.emotionNow?.emotion === name;

  const submitCustom = async () => {
    const clean = customName.trim();
    setCustomName('');
    setAdding(false);
    if (!clean) return;
    await addCustomEmotion(clean);
    const canonical =
      (await allEmotionNames()).find((n) => n.toLowerCase() === clean.toLowerCase()) ?? clean;
    if (!selected(canonical)) dispatch({ type: 'setEmotionNow', emotion: canonical });
  };

  return (
    <StepShell
      kicker="Realistic Thinking"
      title="What is your emotion now?"
      subtitle="With your alternative thought in mind. It can be a different emotion than before."
    >
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <Chip
            key={name}
            label={name}
            selected={selected(name)}
            onTap={() => dispatch({ type: 'setEmotionNow', emotion: name })}
          />
        ))}
        {adding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitCustom();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              autoFocus
              placeholder="Name it…"
              aria-label="Custom emotion"
              className="w-32 rounded-full bg-surface px-4 py-2.5 text-sm shadow-sm outline-none ring-sage focus:ring-2 dark:bg-night-surface"
            />
            <button type="submit" className="text-sm font-medium text-sage-deep dark:text-sage">
              Add
            </button>
          </form>
        ) : (
          <Chip label="+ something else" selected={false} onTap={() => setAdding(true)} />
        )}
      </div>
      {record.emotionNow && (
        <IntensitySlider
          label="How strong is the emotion?"
          value={record.emotionNow.strength}
          hint={
            record.emotions[0] && record.emotions[0].emotion === record.emotionNow.emotion
              ? `was ${record.emotions[0].before}`
              : undefined
          }
          onChange={(v) => dispatch({ type: 'setNowStrength', value: v })}
        />
      )}
    </StepShell>
  );
}
