'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-slate-100" />
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark' || resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2.5 rounded-xl transition-all duration-300 dark:bg-slate-800/90 bg-white dark:border-slate-700/80 border-slate-300 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-blue-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
