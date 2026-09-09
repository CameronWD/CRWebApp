import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function AppHeader({
  title,
  left,
  right,
}: {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-5 bg-paper/80 px-5 backdrop-blur-md dark:bg-night-bg/80">
      <div className="flex items-center gap-3 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        {left}
        {title ? (
          <h1 className="min-w-0 flex-1 truncate font-display text-xl font-medium">{title}</h1>
        ) : (
          <span className="flex-1" />
        )}
        {right}
      </div>
    </header>
  );
}

export function BackLink({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} aria-label="Back" className="-ml-2 p-2 text-mist dark:text-night-mist">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
