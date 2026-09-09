import { useState } from 'react';
import { motion } from 'framer-motion';
import { THEMES, applyTheme, storedTheme, type ThemeId } from '../lib/themes';

export default function ThemePicker() {
  const [current, setCurrent] = useState<ThemeId>(() => storedTheme());

  const select = (id: ThemeId) => {
    applyTheme(id);
    setCurrent(id);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {THEMES.map((t) => (
        <motion.button
          key={t.id}
          type="button"
          whileTap={{ scale: 0.97 }}
          aria-pressed={t.id === current}
          onClick={() => select(t.id)}
          className={`rounded-2xl p-4 text-left shadow-sm transition-all ${
            t.id === current
              ? 'bg-sage-soft ring-2 ring-sage-deep dark:bg-night-surface dark:ring-sage'
              : 'bg-surface dark:bg-night-surface'
          }`}
        >
          <span className="flex gap-1.5">
            {t.swatch.map((c) => (
              <span
                key={c}
                className="h-5 w-5 rounded-full border border-ink/10 dark:border-night-ink/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
          <span className="mt-2 block text-sm font-medium">{t.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
