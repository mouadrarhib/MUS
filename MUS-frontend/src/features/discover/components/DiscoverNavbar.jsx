// src/features/discover/components/DiscoverNavbar.jsx
//
// RENAMED from ResourcePreviewPage.jsx → DiscoverNavbar.jsx
// The component was incorrectly named "ResourcePreviewPage" despite being a navbar.
//
import { memo, useMemo } from 'react';
import { Box, IconButton, Stack, Tooltip, alpha } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '@/app/providers/ThemeContext';
import { useNotifications } from '@/features/discover/hooks/useNotifications';
import ResourcePreviewNavLinks  from '@/features/discover/components/ResourcePreviewNavLinks';
import NotificationMenu          from '@/features/discover/components/NotificationMenu';
import ResourcePreviewAuthActions from '@/features/discover/components/ResourcePreviewAuthActions';
import SessionInboxMenu from '@/shared/components/ui/navigation/SessionInboxMenu';

/**
 * Top navigation bar for the Discover section.
 *
 * Responsibilities (only):
 *  - Layout (logo + nav links on the left, actions on the right)
 *  - Theme toggle
 *  - Compose sub-components: NavLinks, NotificationMenu, AuthActions
 *
 * All notification data & logic live in useNotifications().
 * All notification UI (open/close state, menu) lives in NotificationMenu.
 * This component stays under ~60 lines of JSX.
 */
const DiscoverNavbar = memo(({ onLogout, isAuthenticated = true }) => {
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  // All notification state & logic extracted to a custom hook
  const { notifications, loading, unreadCount, load, handleClick } =
    useNotifications(isAuthenticated);

  const sessionUnreadCount = useMemo(
    () => notifications.reduce((total, item) => {
      const type = String(item?.type || '').trim().toUpperCase();
      const isSession = type.startsWith('SESSION_');
      return total + (isSession && !item?.is_read ? 1 : 0);
    }, 0),
    [notifications],
  );

  // Memoized so NavLinks only re-renders when the pathname changes
  const navItems = useMemo(
    () => [
      {
        label: 'Discover',
        to: '/discover',
        active: location.pathname === '/discover',
      },
      {
        label: 'Recommendations',
        to: '/discover/recommendations',
        active: location.pathname === '/discover/recommendations',
      },
    ],
    [location.pathname],
  );

  return (
    <Box
      component="header"
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.appBar,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(18,15,30,0.82)'
          : 'rgba(255,255,255,0.78)',
        borderBottom: '1px solid',
        borderColor: theme.palette.mode === 'dark'
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.06)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 1px 12px rgba(0,0,0,0.4)'
          : '0 1px 12px rgba(0,0,0,0.04)',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 1.5, sm: 2, md: 3 },
          py: 1,
          gap: 1,
        }}
      >
        {/* ── Left: Logo + Nav links ──────────────────────────────── */}
        <ResourcePreviewNavLinks navItems={navItems} />

        {/* ── Right: Actions ──────────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {isAuthenticated && (
            <SessionInboxMenu
              badgeCount={sessionUnreadCount}
              onOpenBooking={(bookingId) => navigate(`/dashboard/sessions?booking=${bookingId}&chat=1`)}
            />
          )}

          {/* Notifications (authenticated users only) */}
          {isAuthenticated && (
            <NotificationMenu
              unreadCount={unreadCount}
              loading={loading}
              notifications={notifications}
              onRefresh={load}
              onNotificationClick={handleClick}
            />
          )}

          {/* Theme toggle */}
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              sx={(theme) => ({
                color: 'text.primary',
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.08)',
                borderRadius: 2,
                p: 0.8,
                transition: 'all 0.22s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  transform: 'rotate(15deg)',
                },
              })}
            >
              {mode === 'light' ? <DarkMode sx={{ fontSize: 18 }} /> : <LightMode sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          {/* Sign in / Dashboard + Logout */}
          <ResourcePreviewAuthActions
            isAuthenticated={isAuthenticated}
            onLogout={onLogout}
          />
        </Stack>
      </Stack>
    </Box>
  );
});

DiscoverNavbar.displayName = 'DiscoverNavbar';

DiscoverNavbar.propTypes = {
  // defaultProps is deprecated in React 18 — use default parameter values instead
  onLogout:        PropTypes.func,
  isAuthenticated: PropTypes.bool,
};

export default DiscoverNavbar;
