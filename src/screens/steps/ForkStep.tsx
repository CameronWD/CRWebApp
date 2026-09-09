import { Button, StepShell } from '../../components/ui';

export default function ForkStep({
  onKeepGoing,
  onSaveForLater,
}: {
  onKeepGoing: () => void;
  onSaveForLater: () => void;
}) {
  return (
    <StepShell
      title="Saved. Want to keep going?"
      subtitle="You can work through the rest now, or come back when you have a quieter moment. It'll be waiting on the home screen."
    >
      <div className="mt-2 flex flex-col gap-3">
        <Button onClick={onKeepGoing}>Keep going</Button>
        <Button variant="secondary" onClick={onSaveForLater}>
          Save for later
        </Button>
      </div>
    </StepShell>
  );
}
