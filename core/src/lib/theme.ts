export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bm-theme';

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;

  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const prefersDark = window.matchMedia?.(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage failures
  }

  window.dispatchEvent(
    new CustomEvent('theme-change', {
      detail: { theme },
    }),
  );
}

export function initTheme() {
  const stored = getStoredTheme();
  const initial = stored ?? getSystemTheme();
  applyTheme(initial);
  return initial;
}

