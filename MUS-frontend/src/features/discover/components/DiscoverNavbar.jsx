import { Box, Button, IconButton, Stack, Typography, alpha } from '@mui/material';
import { Menu, LightMode, DarkMode } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeMode } from '@/app/providers/ThemeContext';
import logo from '@/assets/images/logo.png';

const DiscoverNavbar = ({ onLogout, isAuthenticated }) => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(16px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(18,15,30,0.82)'
            : 'rgba(255,255,255,0.78)',
        borderBottom: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.06)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 1px 12px rgba(0,0,0,0.4)'
            : '0 1px 12px rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1320,
          mx: 'auto',
          px: { xs: 1.5, sm: 2.5, md: 3.5 },
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Hamburger + Logo + Nav links */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            size="small"
            sx={{
              color: 'text.primary',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              borderRadius: 2,
              p: 0.8,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
              },
            }}
          >
            <Menu sx={{ fontSize: 20 }} />
          </IconButton>

          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            alignItems="center"
            sx={{ textDecoration: 'none' }}
          >
            <Box component="img" src={logo} alt="MUS Logo" sx={{ height: 40, width: 'auto', objectFit: 'contain' }} />
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {['Discover', 'Recommendations'].map((label) => (
              <Typography
                key={label}
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 2,
                  cursor: 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {label}
              </Typography>
            ))}
          </Stack>
        </Stack>

        {/* Right: Theme toggle + Auth buttons */}
        <Stack direction="row" spacing={0.8} alignItems="center">
          <IconButton
            onClick={toggleTheme}
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            size="small"
            sx={{
              color: 'text.primary',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              borderRadius: 2,
              p: 0.8,
              transition: 'all 0.22s ease',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                transform: 'rotate(15deg)',
              },
            }}
          >
            {mode === 'light' ? <DarkMode sx={{ fontSize: 18 }} /> : <LightMode sx={{ fontSize: 18, color: 'warning.main' }} />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/dashboard"
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 0.65,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #7c5cfc 0%, #5b3fdd 100%)',
                  boxShadow: '0 2px 8px rgba(124,92,252,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6e4fe8 0%, #4e36cc 100%)',
                    boxShadow: '0 4px 14px rgba(124,92,252,0.4)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={onLogout}
                sx={{
                  borderRadius: 2,
                  px: 1.8,
                  py: 0.6,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'error.main',
                    color: 'error.main',
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 2.2,
                py: 0.7,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #7c5cfc 0%, #5b3fdd 100%)',
                boxShadow: '0 2px 8px rgba(124,92,252,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6e4fe8 0%, #4e36cc 100%)',
                  boxShadow: '0 4px 14px rgba(124,92,252,0.4)',
                },
              }}
            >
              Sign in
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default DiscoverNavbar;
