import { createTheme } from '@mui/material/styles';

const typography = {
  fontFamily: [
    '"Plus Jakarta Sans"',
    '"Segoe UI"',
    'Tahoma',
    'sans-serif',
  ].join(','),
  h4: {
    fontFamily: '"Space Grotesk", "Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h5: {
    fontFamily: '"Space Grotesk", "Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h6: {
    fontFamily: '"Space Grotesk", "Plus Jakarta Sans", sans-serif',
    fontWeight: 600,
    fontSize: '1.2rem',
    lineHeight: 1.3,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.7,
  },
  body2: {
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
};

const getComponents = (mode) => {
  const isDark = mode === 'dark';
  const paperShadow = isDark
    ? '0 18px 40px rgba(2, 6, 23, 0.55)'
    : '0 18px 40px rgba(15, 23, 42, 0.12)';
  const paperBorder = isDark
    ? 'rgba(148, 163, 184, 0.12)'
    : 'rgba(148, 163, 184, 0.25)';
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.7)' : '#ffffff';
  const inputBorder = isDark
    ? 'rgba(148, 163, 184, 0.35)'
    : 'rgba(148, 163, 184, 0.45)';
  const focusShadow = isDark
    ? '0 0 0 3px rgba(56, 189, 248, 0.25)'
    : '0 0 0 3px rgba(31, 111, 139, 0.18)';

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          fontSize: '0.95rem',
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: isDark
              ? '0 10px 20px rgba(2, 6, 23, 0.45)'
              : '0 10px 20px rgba(15, 23, 42, 0.15)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: inputBg,
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
            '&.Mui-focused': {
              boxShadow: focusShadow,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: inputBorder,
          },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark
              ? 'rgba(148, 163, 184, 0.55)'
              : 'rgba(148, 163, 184, 0.75)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: isDark ? 'rgba(226, 232, 240, 0.75)' : '#5c6773',
          fontWeight: 500,
          '&.Mui-focused': {
            color: isDark ? '#7dd3fc' : '#1f6f8b',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: `1px solid ${paperBorder}`,
          boxShadow: paperShadow,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: isDark ? 'rgba(226, 232, 240, 0.65)' : 'rgba(15, 23, 42, 0.6)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
        },
      },
    },
  };
};

const baseTheme = {
  typography,
  shape: {
    borderRadius: 16,
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f6f8b',
      light: '#4d97ae',
      dark: '#114a5c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e48f4d',
      light: '#f3b37a',
      dark: '#c46d2f',
      contrastText: '#1a1d21',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1d21',
      secondary: '#5b6772',
    },
    divider: 'rgba(148, 163, 184, 0.3)',
  },
  ...baseTheme,
  components: getComponents('light'),
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7dd3fc',
      light: '#bae6fd',
      dark: '#38bdf8',
      contrastText: '#0b1220',
    },
    secondary: {
      main: '#fbbf24',
      light: '#fde68a',
      dark: '#f59e0b',
      contrastText: '#0b1220',
    },
    background: {
      default: '#0b1220',
      paper: '#101826',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5f5',
    },
    divider: 'rgba(148, 163, 184, 0.2)',
  },
  ...baseTheme,
  components: getComponents('dark'),
});

export { theme, darkTheme };
