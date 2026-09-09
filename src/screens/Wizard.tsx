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
import { Button, ProgressDots, StepShell } from '../components/ui';
import SituationStep from './steps/SituationStep';
import EmotionsStep from './steps/EmotionsStep';
import ThoughtsStep from './steps/ThoughtsStep';
import ForkStep from './steps/ForkStep';

export default function Wizard({
  initialRecord,
  mode,
}: {
  initialRecord: ThoughtRecord;
  mode: WizardMode;
}) {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(wizardReducer, initWizard(initialRecord, mode));
  const step = currentStep(state);

  // Autosave whenever the step index changes (not on every keystroke).
  const prevStepIndex = useRef(state.stepIndex);
  useEffect(() => {
    if (prevStepIndex.current === state.stepIndex) return;
    prevStepIndex.current = state.stepIndex;
    void saveRecord(state.record).then((id) => {
      if (state.record.id === undefined) dispatch({ type: 'patch', fields: { id } });
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

  const exit = async () => {
    const worthKeeping = state.record.id !== undefined || state.record.situation.trim() !== '';
    if (worthKeeping) await saveRecord(state.record);
    navigate('/');
  };

  const handleBack = () => {
    if (state.stepIndex === 0) void exit();
    else dispatch({ type: 'back' });
  };

  const dotsTotal = state.steps.length - 1; // 'done' gets no dot
  const showChrome = step !== 'done';
  const showFooter = showChrome && step !== 'fork';

  return (
    <div className="flex min-h-screen flex-col pt-4">
      {showChrome && (
        <header className="mb-6 flex items-center justify-between">
          <button type="button" onClick={handleBack} aria-label="Back" className="p-2 text-mist dark:text-night-mist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
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
              <ForkStep onKeepGoing={handleNext} onSaveForLater={() => navigate('/')} />
            )}
            {/* RESTRUCTURE_STUB — Task 8 replaces this block with the real restructure steps */}
            {(step === 'evidenceFor' ||
              step === 'evidenceAgainst' ||
              step === 'distortions' ||
              step === 'balanced' ||
              step === 'rerate' ||
              step === 'done') && (
              <StepShell title="Coming soon" subtitle="The restructuring steps arrive in the next task." />
            )}
        </div>
      </div>

      {showFooter && (
        <footer className="sticky bottom-0 -mx-5 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-8 pt-4 dark:from-night-bg dark:via-night-bg">
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
