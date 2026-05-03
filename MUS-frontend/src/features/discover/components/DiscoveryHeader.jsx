import { useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { Add, DarkMode, ExpandMore, LightMode, Search } from '@mui/icons-material';
import { useThemeMode } from '@/app/providers/ThemeContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useNotifications } from '@/features/discover/hooks/useNotifications';
import NotificationMenu from '@/features/discover/components/NotificationMenu';
import SessionInboxMenu from '@/shared/components/ui/navigation/SessionInboxMenu';
import logo from '@/assets/images/logo.png';

const navLinks = [
  { label: 'Discover', to: '/discover' },
  { label: 'Recommendations', to: '/discover/recommendations' },
  { label: 'Study Groups', to: '/dashboard/sessions' },
  { label: 'Become a Creator', to: '/dashboard/uploads' },
];

const DiscoveryHeader = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const { user, isAuthenticated } = useAuth();
  const { notifications, loading, unreadCount, load, handleClick } = useNotifications(Boolean(isAuthenticated));

  const sessionUnreadCount = useMemo(
    () => notifications.reduce((total, item) => {
      const type = String(item?.type || '').trim().toUpperCase();
      return total + (type.startsWith('SESSION_') && !item?.is_read ? 1 : 0);
    }, 0),
    [notifications]
  );

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: { xs: 2, md: 3 }, py: 1.6, maxWidth: 1540, mx: 'auto', gap: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={3} sx={{ minWidth: 0 }}>
          <Box component="img" src={logo} alt="MUS" sx={{ height: 48 }} />
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link, index) => (
              <Button
                key={link.label}
                component={RouterLink}
                to={link.to}
                size="small"
                sx={(theme) => ({
                  color: index === 0 ? theme.palette.primary.main : theme.palette.text.secondary,
                  textTransform: 'none',
                  fontWeight: index === 0 ? 700 : 500,
                  borderBottom: index === 0 ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                  borderRadius: 0,
                  px: 1,
                })}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Paper
            sx={(theme) => ({
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 99,
              border: '1px solid',
              borderColor: theme.palette.divider,
              width: 260,
              boxShadow: 'none',
              bgcolor: theme.palette.background.paper,
            })}
          >
            <Search sx={{ color: 'text.disabled', fontSize: 20 }} />
            <InputBase placeholder="Search resources..." sx={{ ml: 1, fontSize: 14 }} />
          </Paper>

          {isAuthenticated && (
            <SessionInboxMenu
              badgeCount={sessionUnreadCount}
              onOpenBooking={(bookingId) => navigate(`/dashboard/sessions?booking=${bookingId}&chat=1`)}
            />
          )}

          {isAuthenticated && (
            <NotificationMenu
              unreadCount={unreadCount}
              loading={loading}
              notifications={notifications}
              onRefresh={load}
              onNotificationClick={handleClick}
            />
          )}

          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton
              onClick={toggleTheme}
              aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
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
          </Tooltip>

          <Button
            component={RouterLink}
            to="/dashboard"
            variant="outlined"
            sx={(theme) => ({
              borderRadius: 99,
              textTransform: 'none',
              px: 2,
              fontWeight: 700,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              bgcolor: theme.palette.background.paper,
            })}
          >
            Dashboard
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={(theme) => ({
              borderRadius: 99,
              textTransform: 'none',
              bgcolor: theme.palette.primary.main,
              px: 2.2,
              fontWeight: 700,
              boxShadow: `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.45)' : 'rgba(79,70,229,0.28)'}`,
            })}
          >
            Create
          </Button>

          <IconButton onClick={() => navigate('/dashboard/profile')} sx={{ p: 0 }}>
            <Avatar src={user?.avatar_url || ''} sx={{ width: 36, height: 36 }}>
              {user?.full_name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <IconButton onClick={() => navigate('/dashboard/profile')} sx={{ p: 0.4 }}>
            <ExpandMore sx={{ color: 'text.secondary', fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default DiscoveryHeader;
