import { useMemo, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Add from '@mui/icons-material/Add';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';

import { useThemeMode } from '@/app/providers/ThemeContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useLanguage } from '@/app/providers/LanguageContext';
import { useNotifications } from '@/features/discover/hooks/useNotifications';
import SessionInboxMenu from '@/shared/components/ui/navigation/SessionInboxMenu';
import NotificationInboxMenu from '@/shared/components/ui/navigation/NotificationInboxMenu';
import UserProfileMenu from '@/shared/components/ui/navigation/UserProfileMenu';
import userSettingsService from '@/services/userSettingsService';
import sessionService from '@/services/sessionService';
import logo from '@/assets/images/logo.png';

const navLinks = [
  { label: 'Discover', to: '/discover' },
  { label: 'Tutors', to: '/discover/tutors' },
  { label: 'How to become a creator', to: '/discover/how-to-become-creator' },
];

const HEADER_WRAPPER_SX = (theme) => ({ bgcolor: theme.palette.background.paper, borderBottom: '1px solid', borderColor: theme.palette.divider, position: 'sticky', top: 0, zIndex: 20 });

const NAV_LINK_SX = (isActive) => (theme) => ({
  position: 'relative', color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
  textTransform: 'none', fontWeight: isActive ? 700 : 500, borderRadius: 1, px: 1.5, py: 0.5,
  transition: 'color 0.2s, background-color 0.2s',
  '&:hover': { color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.04) },
  '&::after': { content: '""', position: 'absolute', bottom: -4, left: 12, right: 12, height: 3, borderRadius: 3, bgcolor: theme.palette.primary.main, transform: isActive ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'center' }
});

const THEME_BTN_SX = (theme) => ({
  color: 'text.primary', bgcolor: alpha(theme.palette.primary.main, 0.06),
  border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  borderRadius: 2, p: 0.8, transition: 'all 0.22s ease',
  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14), borderColor: alpha(theme.palette.primary.main, 0.3), transform: 'rotate(15deg)' },
});

const DASHBOARD_BTN_SX = (theme) => ({ borderRadius: 99, textTransform: 'none', px: 2, fontWeight: 700, borderColor: theme.palette.divider, color: theme.palette.text.primary, bgcolor: theme.palette.background.paper });
const CREATE_BTN_SX = (theme) => ({ borderRadius: 99, textTransform: 'none', bgcolor: theme.palette.primary.main, px: 2.2, fontWeight: 700, boxShadow: `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(37,99,235,0.45)' : 'rgba(79,70,229,0.28)'}` });


const DiscoveryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { user, roles, logout, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const { notifications, loading, load, clearPersisted, handleClick } = useNotifications(Boolean(isAuthenticated));

  const sessionUnreadCount = useMemo(
    () => notifications.reduce((total, item) => {
      const type = String(item?.type || '').trim().toUpperCase();
      return total + (type.startsWith('SESSION_') && !item?.is_read ? 1 : 0);
    }, 0),
    [notifications]
  );

  const handleThemeToggle = useCallback(async () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    toggleTheme();

    if (!user?.id) return;

    try {
      const fontSize = localStorage.getItem('fontSize') || user?.settings?.font_size || 'medium';
      await userSettingsService.updateAppearance(user.id, {
        theme_mode: nextMode,
        font_size: fontSize,
      });
    } catch (error) {
      console.error('Failed to persist theme from discover navbar:', error);
    }
  }, [mode, toggleTheme, user]);

  const handleOpenBooking = useCallback((bookingId) => {
    navigate(`/dashboard/sessions?booking=${bookingId}&chat=1`);
  }, [navigate]);

  const handleClearSessions = useCallback(async () => {
    await sessionService.clearInbox();
  }, []);

  const handleProfile = useCallback(() => navigate('/dashboard/profile'), [navigate]);
  const handleSettings = useCallback(() => navigate('/dashboard/settings'), [navigate]);
  const handleLogout = useCallback(() => {
    navigate('/', { replace: true });
    logout();
  }, [navigate, logout]);

  return (
    <Box sx={HEADER_WRAPPER_SX}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: 2, md: 3 }, py: 1.6, maxWidth: 1540, mx: 'auto', gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={3} sx={{ minWidth: 0 }}>
          <Box component="img" src={logo} alt="MUS" sx={{ height: 48 }} />
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Button key={link.label} component={RouterLink} to={link.to} size="small" sx={NAV_LINK_SX(isActive)}>
                  {link.label}
                </Button>
              );
            })}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.2}>
          {isAuthenticated && (
            <SessionInboxMenu badgeCount={sessionUnreadCount} onOpenBooking={handleOpenBooking} onClear={handleClearSessions} />
          )}

          {isAuthenticated && (
            <NotificationInboxMenu notifications={notifications} loading={loading} onRefresh={load} onNotificationClick={handleClick} onClear={clearPersisted} streamConnected />
          )}

          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={handleThemeToggle} aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} sx={THEME_BTN_SX}>
              {mode === 'light' ? <DarkMode sx={{ fontSize: 18 }} /> : <LightMode sx={{ fontSize: 18, color: 'warning.main' }} />}
            </IconButton>
          </Tooltip>

          <Button component={RouterLink} to="/dashboard" variant="outlined" sx={DASHBOARD_BTN_SX}>
            Dashboard
          </Button>

          <Button component={RouterLink} to="/dashboard/uploads" variant="contained" startIcon={<Add />} sx={CREATE_BTN_SX}>
            Create
          </Button>

          <UserProfileMenu
            user={user} roles={roles} isArabic={isArabic}
            onProfile={handleProfile} onSettings={handleSettings} onLogout={handleLogout}
            labels={{ profile: 'Profile', settings: 'Settings', logout: 'Logout' }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default DiscoveryHeader;
