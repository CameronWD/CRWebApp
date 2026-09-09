import { useState } from 'react';
import { isStandaloneDisplay, shouldShowInstallNudge } from '../lib/install';

const DISMISS_KEY = 'installNudgeDismissed';

export default function InstallNudge() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');
  if (!shouldShowInstallNudge(navigator.userAgent, isStandaloneDisplay(), dismissed)) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-sage-soft p-4 dark:bg-night-surface">
      <p className="text-sm leading-relaxed">
        <span className="font-medium">Add this to your Home Screen</span> so your records are kept
        safe: tap the Share button, then <span className="whitespace-nowrap">“Add to Home Screen”</span>.
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1');
          setDismissed(true);
        }}
        className="p-1 text-mist dark:text-night-mist"
      >
        ✕
      </button>
    </div>
  );
}
