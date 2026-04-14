import { useState, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme } from '@/styles/theme';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ThemeContext } from '@/app/providers/ThemeContext';
import { LanguageProvider } from '@/app/providers/LanguageContext';
import PropTypes from 'prop-types';

const ThemeProviderComponent = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  const muiTheme = useMemo(() => {
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode]);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('theme-switching');
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });

    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 180);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <GlobalStyles
          styles={(theme) => {
            const isDark = theme.palette.mode === 'dark';
            return {
              ':root': {
                '--color-primary': theme.palette.primary.main,
                '--color-primary-light': theme.palette.primary.light,
                '--color-primary-dark': theme.palette.primary.dark,
                '--color-secondary': theme.palette.secondary.main,
                '--color-secondary-light': theme.palette.secondary.light || theme.palette.secondary.main,
                '--color-secondary-dark': theme.palette.secondary.dark || theme.palette.secondary.main,
                '--color-success': theme.palette.success.main,
                '--color-warning': theme.palette.warning.main,
                '--color-error': theme.palette.error.main,
                '--color-info': theme.palette.info.main,
                '--bg-default': theme.palette.background.default,
                '--bg-paper': theme.palette.background.paper,
                '--bg-hover': theme.palette.action.hover,
                '--text-primary': theme.palette.text.primary,
                '--text-secondary': theme.palette.text.secondary,
                '--text-disabled': theme.palette.text.disabled,
                '--border-color': theme.palette.divider,
                '--border-radius': `${theme.shape.borderRadius}px`,
                '--border-radius-lg': `${theme.shape.borderRadius + 4}px`,
                '--spacing-unit': theme.spacing(1),
                '--spacing-xs': 'calc(var(--spacing-unit) * 0.5)',
                '--spacing-sm': 'var(--spacing-unit)',
                '--spacing-md': 'calc(var(--spacing-unit) * 2)',
                '--spacing-lg': 'calc(var(--spacing-unit) * 3)',
                '--spacing-xl': 'calc(var(--spacing-unit) * 4)',
                '--spacing-xxl': 'calc(var(--spacing-unit) * 6)',
                '--shadow-sm': isDark
                  ? '0 2px 4px rgba(0, 0, 0, 0.3)'
                  : '0 2px 4px rgba(0, 0, 0, 0.08)',
                '--shadow-md': isDark
                  ? '0 4px 8px rgba(0, 0, 0, 0.4)'
                  : '0 4px 8px rgba(0, 0, 0, 0.1)',
                '--shadow-lg': isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.5)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
                '--transition-fast': '150ms ease-in-out',
                '--transition-normal': '300ms ease-in-out',
                '--transition-slow': '500ms ease-in-out',
                '--font-family': theme.typography.fontFamily,
              },
            };
          }}
        />
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

ThemeProviderComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AppProviders = ({ children }) => {
  return (
    <LanguageProvider>
      <ThemeProviderComponent>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProviderComponent>
    </LanguageProvider>
  );
};

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
