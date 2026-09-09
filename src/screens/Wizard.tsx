import { useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ThoughtRecord } from '../lib/types';
import {
  canProceed,
  currentStep,
  initWizard,
  wizardReducer,
  type WizardMode,
} from '../lib/wizard';
import { saveRecord } from '../lib/repository';
import { Button, ProgressDots } from '../components/ui';
import { BackButton } from '../components/AppHeader';
import SituationStep from './steps/SituationStep';
import EmotionsStep from './steps/EmotionsStep';
import ThoughtsStep from './steps/ThoughtsStep';
import ForkStep from './steps/ForkStep';
import EvidenceStep from './steps/EvidenceStep';
import DistortionsStep from './steps/DistortionsStep';
import BalancedStep from './steps/BalancedStep';
import RerateStep from './steps/RerateStep';
import DoneStep from './steps/DoneStep';

export default function Wizard({
  initialRecord,
  mode,
  includeDistortions = true,
}: {
  initialRecord: ThoughtRecord;
  mode: WizardMode;
  includeDistortions?: boolean;
}) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    wizardReducer,
    initWizard(initialRecord, mode, includeDistortions),
  );
  const step = currentStep(state);
  const exiting = useRef(false);

  // Autosave whenever the step index changes (not on every keystroke).
  const prevStepIndex = useRef(state.stepIndex);
  useEffect(() => {
    if (prevStepIndex.current === state.stepIndex) return;
    prevStepIndex.current = state.stepIndex;
    const needsId = state.record.id === undefined;
    void saveRecord(state.record).then((id) => {
      if (needsId) dispatch({ type: 'patch', fields: { id } });
    });
  }, [state.stepIndex, state.record]);

  // Completing: crossing into 'done' on an open record marks it completed.
  const handleNext = () => {
    const nextStep = state.steps[state.stepIndex + 1];
    if (nextStep === 'done' && state.record.status === 'open') {
      dispatch({
        type: 'patch',
        fields: { status: 'completed', completedAt: new Date().toISOString() },
      });
    }
    dispatch({ type: 'next' });
  };

  // Return to the page the user came from when there is one; home otherwise.
  // React Router records an entry index in history.state — 0 means this is
  // the first in-app page (deep link / fresh install), so back would leave the app.
  const leave = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === 'number' && idx > 0) navigate(-1);
    else navigate('/');
  };

  const exit = async () => {
    if (exiting.current) return;
    exiting.current = true;
    const worthKeeping = state.record.id !== undefined || state.record.situation.trim() !== '';
    if (worthKeeping) await saveRecord(state.record);
    leave();
  };

  const handleBack = () => {
    if (state.stepIndex === 0) void exit();
    else dispatch({ type: 'back' });
  };

  const dotsTotal = state.steps.length - 1; // 'done' gets no dot
  const showChrome = step !== 'done';
  const showFooter = showChrome && step !== 'fork';

  return (
    <div className="flex min-h-svh flex-col pt-[max(1rem,env(safe-area-inset-top))]">
      {showChrome && (
        <header className="mb-6 flex items-center justify-between">
          <BackButton onClick={handleBack} />
          <ProgressDots current={Math.min(state.stepIndex, dotsTotal - 1)} total={dotsTotal} />
          <button type="button" onClick={() => void exit()} aria-label="Close" className="p-2 text-mist dark:text-night-mist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
      )}

      <div className="flex-1">
        {/* keying by step remounts StepShell so its enter animation plays on every step change */}
        <div key={step}>
            {step === 'situation' && <SituationStep record={state.record} dispatch={dispatch} />}
            {step === 'emotions' && <EmotionsStep record={state.record} dispatch={dispatch} />}
            {step === 'thoughts' && <ThoughtsStep record={state.record} dispatch={dispatch} />}
            {step === 'fork' && (
              <ForkStep onKeepGoing={handleNext} onSaveForLater={leave} />
            )}
            {step === 'evidenceFor' && <EvidenceStep record={state.record} dispatch={dispatch} kind="for" />}
            {step === 'evidenceAgainst' && <EvidenceStep record={state.record} dispatch={dispatch} kind="against" />}
            {step === 'distortions' && <DistortionsStep record={state.record} dispatch={dispatch} />}
            {step === 'balanced' && <BalancedStep record={state.record} dispatch={dispatch} />}
            {step === 'rerate' && <RerateStep record={state.record} dispatch={dispatch} />}
            {step === 'done' && <DoneStep record={state.record} onFinish={() => navigate('/')} />}
        </div>
      </div>

      {showFooter && (
        <footer className="sticky bottom-0 z-20 -mx-5 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 dark:from-night-bg dark:via-night-bg">
          <Button
            onClick={handleNext}
            disabled={!canProceed(state)}
            className="w-full"
          >
            Next
          </Button>
        </footer>
      )}
    </div>
  );
}
