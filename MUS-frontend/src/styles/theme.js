import { createTheme } from '@mui/material/styles';

// Typographie cohérente
const typography = {
  fontFamily: [
    '"Plus Jakarta Sans"',
    '"Segoe UI"',
    'system-ui',
    '-apple-system',
    'sans-serif',
  ].join(','),
  h1: {
    fontFamily: '"Space Grotesk"',
    fontSize: 'clamp(2rem, 3vw, 3rem)',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontFamily: '"Space Grotesk"',
    fontSize: 'clamp(1.75rem, 2.5vw, 2.4rem)',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontFamily: '"Space Grotesk"',
    fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontFamily: '"Space Grotesk"',
    fontSize: 'clamp(1.35rem, 1.9vw, 1.75rem)',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontFamily: '"Space Grotesk"',
    fontSize: 'clamp(1.15rem, 1.5vw, 1.35rem)',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontFamily: '"Space Grotesk"',
    fontSize: 'clamp(0.95rem, 1.1vw, 1rem)',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: 'clamp(0.95rem, 1vw, 1rem)',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: 'clamp(0.82rem, 0.92vw, 0.9rem)',
    lineHeight: 1.55,
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
  },
};

// Espacements et bordures
const spacing = 8; // Base spacing unit

const shape = {
  borderRadius: 8,
};

// Animations et transitions
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Thème clair
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography,
  spacing,
  shape,
  transitions,
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: 'none',
          letterSpacing: '0.01em',
          transition:
            'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, box-shadow',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: 2,
          },
          '&.Mui-disabled': {
            opacity: 0.5,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)',
          },
        },
        outlined: {
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
        },
        sizeSmall: {
          padding: '5px 14px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition:
            'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          '&:hover': {
            transform: 'scale(1.08)',
          },
          '&:active': {
            transform: 'scale(0.96)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover fieldset': {
              borderColor: theme.palette.primary.light,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${theme.palette.primary.main}22`,
            },
          },
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiSwitch-thumb': {
            transition: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        keepMounted: true,
        transitionDuration: { enter: 120, exit: 80 },
      },
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          '&:not(.MuiBackdrop-invisible)': {
            transition: 'opacity 120ms cubic-bezier(0.4, 0, 0.2, 1) !important',
          },
        },
      },
    },
  },
});

// Thème sombre
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
    },
    background: {
      default: '#0a0a0a',
      paper: '#141414',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography,
  spacing,
  shape,
  transitions,
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontSize: '0.9rem',
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition:
            'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform, box-shadow',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: 2,
          },
          '&.Mui-disabled': {
            opacity: 0.4,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
          },
        },
        outlined: {
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          },
        },
        sizeSmall: {
          padding: '5px 14px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition:
            'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'color 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), ' +
            'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          '&:hover': {
            transform: 'scale(1.08)',
          },
          '&:active': {
            transform: 'scale(0.96)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        keepMounted: true,
        transitionDuration: { enter: 120, exit: 80 },
      },
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover fieldset': {
              borderColor: theme.palette.primary.light,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${theme.palette.primary.main}33`,
            },
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase': {
            transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiSwitch-thumb': {
            transition: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          '&:not(.MuiBackdrop-invisible)': {
            transition: 'opacity 120ms cubic-bezier(0.4, 0, 0.2, 1) !important',
          },
        },
      },
    },
  },
});

export const theme = lightTheme;

// Helper function to get card background based on theme mode
export const getCardBackground = (mode) => {
  return mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)';
};

// Helper function for theme-aware card sx prop
export const cardBackgroundSx = (theme) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
});
