import { Box, Button, IconButton, Stack, Typography, alpha, Badge, Menu as MuiMenu, MenuItem, Divider, CircularProgress } from '@mui/material';
import { Menu, LightMode, DarkMode } from '@mui/icons-material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '@/app/providers/ThemeContext';
import notificationService from '@/services/notificationService';
import logo from '@/assets/images/logo.png';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotificationsNone } from '@mui/icons-material';

const DiscoverNavbar = ({ onLogout, isAuthenticated }) => {
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationsOpen = Boolean(notificationAnchorEl);
  const unreadCount = useMemo(
    () => notifications.reduce((total, item) => total + (item?.is_read ? 0 : 1), 0),
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingNotifications(true);
    try {
      const data = await notificationService.list({ page: 1, limit: 15 });
      setNotifications(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  const deriveNotificationTarget = (notification) => {
    const payload = notification?.payload || {};
    const resourceId = Number(payload.resource_id || 0);
    const questionId = Number(payload.question_id || 0);
    if (resourceId > 0) {
      return questionId > 0
        ? `/discover/resources/${resourceId}/preview?question=${questionId}`
        : `/discover/resources/${resourceId}/preview`;
    }
    return '/dashboard';
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;
    if (!notification.is_read) {
      try {
        await notificationService.markRead(notification.id);
      } catch {
        // keep navigation responsive
      }
    }
    setNotificationAnchorEl(null);
    navigate(deriveNotificationTarget(notification));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    loadNotifications();
    const stopStream = notificationService.openStream({
      onNotification: (incoming) => {
        setNotifications((prev) => {
          const merged = [incoming, ...prev].filter((item, index, arr) => arr.findIndex((row) => row.id === item.id) === index);
          return merged.slice(0, 40);
        });
      },
    });

    return () => {
      stopStream();
    };
  }, [isAuthenticated, loadNotifications]);

  const navItems = [
    { label: 'Discover', to: '/discover', active: location.pathname === '/discover' },
    { label: 'Recommendations', to: '/discover/recommendations', active: location.pathname === '/discover/recommendations' },
  ];

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
            {navItems.map((item) => (
              <Typography
                key={item.label}
                variant="body2"
                component={RouterLink}
                to={item.to}
                sx={{
                  fontWeight: 600,
                  color: item.active ? 'primary.main' : 'text.secondary',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 2,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  bgcolor: (theme) => (item.active ? alpha(theme.palette.primary.main, 0.1) : 'transparent'),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>
        </Stack>

        {/* Right: Theme toggle + Auth buttons */}
        <Stack direction="row" spacing={0.8} alignItems="center">
          {isAuthenticated ? (
            <>
              <IconButton
                onClick={(event) => setNotificationAnchorEl(event.currentTarget)}
                aria-label="Open notifications"
                size="small"
                sx={{
                  color: 'text.primary',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  borderRadius: 2,
                  p: 0.8,
                }}
              >
                <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
                  <NotificationsNone sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
              <MuiMenu
                anchorEl={notificationAnchorEl}
                open={notificationsOpen}
                onClose={() => setNotificationAnchorEl(null)}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                PaperProps={{
                  sx: {
                    width: 360,
                    maxWidth: 'calc(100vw - 20px)',
                    borderRadius: 2,
                  },
                }}
              >
                <Box sx={{ px: 1.4, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700}>Notifications</Typography>
                  <Button size="small" onClick={loadNotifications} sx={{ textTransform: 'none' }}>Refresh</Button>
                </Box>
                <Divider />
                {loadingNotifications ? (
                  <Box sx={{ py: 2.4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : notifications.length ? (
                  notifications.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      sx={{
                        whiteSpace: 'normal',
                        alignItems: 'flex-start',
                        borderLeft: '3px solid',
                        borderLeftColor: item.is_read ? 'transparent' : 'primary.main',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={700}>{item.title || 'Notification'}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.body || ''}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
                  </Box>
                )}
              </MuiMenu>
            </>
          ) : null}

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
