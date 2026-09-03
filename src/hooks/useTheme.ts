import { useState, useEffect, useCallback } from 'react';
import { getTheme, setTheme as saveTheme } from '@/lib/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(getTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback((t: 'dark' | 'light') => {
    setThemeState(t);
    saveTheme(t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggle };
}
