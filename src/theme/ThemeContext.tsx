import React, { createContext, useContext, useMemo } from 'react';
import { ThemeConfig } from '../types/sdui';

const DEFAULT_THEME: ThemeConfig = {
  primary: '#2563EB',
  secondary: '#8B5CF6',
  background: '#F6FAFF',
  surface: '#FFFFFF',
  text: '#122033',
  textMuted: '#64748B',
  accent: '#FFD166',
};

interface ThemeContextValue {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_THEME });

interface Props {
  theme?: Partial<ThemeConfig>;
  children: React.ReactNode;
}

/**
 * Wraps the app and exposes the current theme. Theme is driven entirely from
 * JSON — flipping campaign JSON re-renders all consumers automatically.
 */
export const ThemeProvider: React.FC<Props> = ({ theme, children }) => {
  const value = useMemo<ThemeContextValue>(
    () => ({ theme: { ...DEFAULT_THEME, ...theme } }),
    [theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeConfig => useContext(ThemeContext).theme;
