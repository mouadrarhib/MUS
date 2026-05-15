import { memo, useMemo } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';

import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '@/app/providers/ThemeContext';
import { useNotifications } from '@/features/discover/hooks/useNotifications';
import ResourcePreviewNavLinks  from '@/features/discover/components/ResourcePreviewNavLinks';
import NotificationMenu          from '@/features/discover/components/NotificationMenu';
import ResourcePreviewAuthActions from '@/features/discover/components/ResourcePreviewAuthActions';
import SessionInboxMenu from '@/shared/components/ui/navigation/SessionInboxMenu';

// Static configurations extracted
const NAVBAR_WRAPPER_SX = (theme) => ({
  position: 'sticky', top: 0, zIndex: theme.zIndex.appBar, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(18,15,30,0.82)' : 'rgba(255,255,255,0.78)',
  borderBottom: '1px solid', borderColor: 'var(--border)',
  boxShadow: theme.palette.mode === 'dark' ? '0 1px 12px rgba(0,0,0,0.4)' : '0 1px 12px rgba(0,0,0,0.04)',
});

const THEME_BTN_SX = (theme) => ({
  color: 'text.primary', bgcolor: alpha(theme.palette.primary.main, 0.06),
  border: '1px solid', borderColor: 'var(--border)',
  borderRadius: 2, p: 0.8, transition: 'all 0.22s ease',
  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14), borderColor: alpha(theme.palette.primary.main, 0.3), transform: 'rotate(15deg)' },
});

const DiscoverNavbar = memo(({ onLogout, isAuthenticated = true }) => {
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  const { notifications, loading, unreadCount, load, handleClick } = useNotifications(isAuthenticated);

  const sessionUnreadCount = useMemo(() => notifications.reduce((total, item) => {
    const type = String(item?.type || '').trim().toUpperCase();
    return total + ((type.startsWith('SESSION_') && !item?.is_read) ? 1 : 0);
  }, 0), [notifications]);

  const navItems = useMemo(() => [
    { label: 'Discover', to: '/discover', active: location.pathname === '/discover' },
    { label: 'Recommendations', to: '/discover/recommendations', active: location.pathname === '/discover/recommendations' },
    { label: 'Tutors', to: '/discover/tutors', active: location.pathname.startsWith('/discover/tutors') },
  ], [location.pathname]);

  return (
    <Box component="header" sx={NAVBAR_WRAPPER_SX}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, py: 1, gap: 1 }}>
        <ResourcePreviewNavLinks navItems={navItems} />
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {isAuthenticated && <SessionInboxMenu badgeCount={sessionUnreadCount} onOpenBooking={(id) => navigate(`/dashboard/sessions?booking=${id}&chat=1`)} />}
          {isAuthenticated && <NotificationMenu unreadCount={unreadCount} loading={loading} notifications={notifications} onRefresh={load} onNotificationClick={handleClick} />}
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={toggleTheme} size="small" aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} sx={THEME_BTN_SX}>
              {mode === 'light' ? <DarkMode sx={{ fontSize: 18 }} /> : <LightMode sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
          <ResourcePreviewAuthActions isAuthenticated={isAuthenticated} onLogout={onLogout} />
        </Stack>
      </Stack>
    </Box>
  );
});

DiscoverNavbar.displayName = 'DiscoverNavbar';
// Removed deprecated propTypes default initialization
DiscoverNavbar.propTypes = { onLogout: PropTypes.func, isAuthenticated: PropTypes.bool };

export default DiscoverNavbar;
