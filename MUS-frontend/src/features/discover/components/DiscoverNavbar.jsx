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
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#171424' : '#ffffff'),
        borderBottom: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? alpha('#fff', 0.08) : 'divider'),
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1320,
          mx: 'auto',
          px: { xs: 1.5, sm: 2.5, md: 3.5 },
          height: 74,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center">
          <IconButton size="small" sx={{ color: 'text.primary' }}>
            <Menu />
          </IconButton>
          <Stack
            component={RouterLink}
            to="/"
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ textDecoration: 'none' }}
          >
            <Box component="img" src={logo} alt="MUS Logo" sx={{ height: 34, width: 'auto', objectFit: 'contain' }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: 'text.primary', letterSpacing: '-0.01em' }}>MUS</Typography>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Discover
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Recommendations
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={toggleTheme}
            aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            size="small"
            sx={{
              color: 'text.primary',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18) },
            }}
          >
            {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/dashboard"
                variant="contained"
                sx={{
                  borderRadius: 999,
                  px: 2.4,
                  py: 0.75,
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={onLogout}
                sx={{
                  borderRadius: 999,
                  px: 2.2,
                  py: 0.7,
                  fontWeight: 700,
                  textTransform: 'none',
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
                borderRadius: 999,
                px: 2.4,
                py: 0.75,
                fontWeight: 800,
                textTransform: 'none',
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
