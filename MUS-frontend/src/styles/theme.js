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
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontFamily: '"Space Grotesk"',
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontFamily: '"Space Grotesk"',
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontFamily: '"Space Grotesk"',
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontFamily: '"Space Grotesk"',
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontFamily: '"Space Grotesk"',
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
  },
};

// Espacements et bordures
const spacing = (factor) => `calc(${factor} * var(--spacing-unit))`;

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

const sharedPalette = {
  primary: {
    main: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
    dark: 'var(--color-primary-dark)',
    contrastText: '#ffffff',
  },
  secondary: {
    main: 'var(--color-secondary)',
    light: 'var(--color-secondary-light)',
    dark: 'var(--color-secondary-dark)',
    contrastText: '#ffffff',
  },
  success: {
    main: 'var(--color-success)',
  },
  warning: {
    main: 'var(--color-warning)',
  },
  error: {
    main: 'var(--color-error)',
  },
  info: {
    main: 'var(--color-info)',
  },
  background: {
    default: 'var(--bg-default)',
    paper: 'var(--bg-paper)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    disabled: 'var(--text-disabled)',
  },
  divider: 'var(--border-color)',
};

// Thème clair
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...sharedPalette,
  },
  typography,
  spacing,
  shape,
  transitions,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: 'var(--color-primary-light)',
            },
          },
        },
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
        },
      },
    },
  },
});

// Thème sombre
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...sharedPalette,
  },
  typography,
  spacing,
  shape,
  transitions,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 500,
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
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
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
