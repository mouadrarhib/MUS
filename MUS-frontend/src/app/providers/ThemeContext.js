import { createContext, useContext } from 'react';

export const ThemeContext = createContext();

/**
 * Hook personnalisé pour accéder au contexte du thème
 * Renommé pour éviter conflit avec useTheme de MUI
 */
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within AppProviders');
  }
  return context;
};
