import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

const buttonStyles = {
  primary:
    'bg-sage-deep text-white shadow-sm active:bg-sage dark:bg-sage dark:text-night-bg dark:active:bg-sage-deep',
  secondary:
    'bg-sage-soft text-sage-deep dark:bg-night-surface dark:text-sage',
  ghost: 'text-mist dark:text-night-mist',
  danger: 'bg-red-800/90 text-white dark:bg-red-900',
} as const;

export function Button({
  variant = 'primary',
  disabled,
  onClick,
  children,
  className = '',
  type = 'button',
}: {
  variant?: keyof typeof buttonStyles;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-2xl px-6 py-4 font-body text-base font-medium transition-colors disabled:opacity-40 ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Chip({
  label,
  selected,
  onTap,
}: {
  label: string;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onTap}
      aria-pressed={selected}
      className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
        selected
          ? 'bg-sage-deep text-white dark:bg-sage dark:text-night-bg'
          : 'bg-surface text-ink shadow-sm dark:bg-night-surface dark:text-night-ink'
      }`}
    >
      {label}
    </motion.button>
  );
}

export function IntensitySlider({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm dark:bg-night-surface">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-mist dark:text-night-mist">
          {hint && <span className="mr-2">{hint}</span>}
          <span className="text-base font-semibold text-ink dark:text-night-ink">{value}</span>
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} intensity`}
        className="w-full accent-sage-deep dark:accent-sage"
      />
    </div>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-5 bg-sage-deep dark:bg-sage'
              : 'w-1.5 bg-sage-soft dark:bg-night-surface'
          }`}
        />
      ))}
    </div>
  );
}

export function StepShell({
  title,
  subtitle,
  kicker,
  children,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-5 pb-6"
    >
      <div>
        {kicker && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-mist dark:text-night-mist">{kicker}</p>
        )}
        <h2 className="font-display text-2xl font-medium">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-mist dark:text-night-mist">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function AutoTextArea({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      rows={4}
      className="w-full resize-none rounded-2xl bg-surface p-4 text-base leading-relaxed shadow-sm outline-none ring-sage placeholder:text-mist/60 focus:ring-2 dark:bg-night-surface dark:placeholder:text-night-mist/60"
    />
  );
}

export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 dark:bg-black/50"
          onClick={onCancel}
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md rounded-t-3xl bg-paper p-6 pb-10 dark:bg-night-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-medium">{title}</h3>
            <p className="mt-2 text-sm text-mist dark:text-night-mist">{body}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button variant="danger" onClick={onConfirm}>
                {confirmLabel}
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-surface p-4 text-left shadow-sm dark:bg-night-surface"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-mist dark:text-night-mist">
            {description}
          </span>
        )}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-sage-deep dark:bg-sage' : 'bg-sage-soft dark:bg-night-bg'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all dark:bg-night-ink ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  );
}
