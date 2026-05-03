// src/shared/components/ui/navigation/Navbar.jsx
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Badge,
  CircularProgress,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useThemeMode } from '@/app/providers/ThemeContext';
import userSettingsService from '@/services/userSettingsService';
import notificationService from '@/services/notificationService';
import sessionService from '@/services/sessionService';
import { useCallback, useEffect, useMemo, useState } from 'react';
import logo from '@/assets/images/logo.png';
import { useLanguage } from '@/app/providers/LanguageContext';
import SessionInboxMenu from '@/shared/components/ui/navigation/SessionInboxMenu';
import UserProfileMenu from '@/shared/components/ui/navigation/UserProfileMenu';
import NotificationInboxMenu from '@/shared/components/ui/navigation/NotificationInboxMenu';

const NAVBAR_HEIGHT = 64;

export const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const { user, roles, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [streamConnected, setStreamConnected] = useState(false);

  const sessionUnreadCount = useMemo(
    () => notifications.reduce((total, item) => {
      const type = String(item?.type || '').trim().toUpperCase();
      const isSession = type.startsWith('SESSION_');
      return total + (isSession && !item?.is_read ? 1 : 0);
    }, 0),
    [notifications]
  );

  const deriveNotificationTarget = (notification) => {
    const type = String(notification?.type || '').trim().toUpperCase();
    const payload = notification?.payload || {};
    const caseId = Number(payload.case_id || 0);
    const resourceId = Number(payload.resource_id || 0);
    const questionId = Number(payload.question_id || 0);
    const answerId = Number(payload.answer_id || 0);
    const commentId = Number(payload.comment_id || 0);
    const bookingId = Number(payload.booking_id || 0);

    if (type.startsWith('SESSION_')) {
      return bookingId > 0 ? `/dashboard/sessions?booking=${bookingId}&chat=1` : '/dashboard/sessions';
    }

    if (type.startsWith('CONFUSION_') && caseId > 0) {
      return `/dashboard/confusion?case=${caseId}`;
    }
    if (resourceId > 0) {
      const params = new URLSearchParams();
      if (questionId > 0) params.set('question', String(questionId));
      if (answerId > 0) params.set('answer', String(answerId));
      if (commentId > 0) params.set('comment', String(commentId));
      const suffix = params.toString();
      return suffix
        ? `/discover/resources/${resourceId}/preview?${suffix}`
        : `/discover/resources/${resourceId}/preview`;
    }
    return '/dashboard';
  };

  const mergeNotifications = (incomingRows = []) => {
    setNotifications((prev) => {
      const seen = new Set();
      const merged = [...incomingRows, ...prev].filter((row) => {
        const id = row?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      merged.sort((a, b) => {
        const aTime = new Date(a?.created_at || 0).getTime();
        const bTime = new Date(b?.created_at || 0).getTime();
        return bTime - aTime;
      });
      return merged.slice(0, 60);
    });
  };

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const data = await notificationService.list({ limit: 20, page: 1 });
      setNotifications(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      setNotificationsError('Failed to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  }, [user?.id]);

  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;
    try {
      await notificationService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true, read_at: item.read_at || new Date().toISOString() }
            : item
        )
      );
    } catch {
      // keep UI resilient when mark-read fails
    }
  };

  const markAllVisibleAsRead = async () => {
    const unreadIds = notifications.filter((item) => !item?.is_read).map((item) => item.id);
    if (!unreadIds.length) return;
    await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)));
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
    navigate(deriveNotificationTarget(notification));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotificationsError('');
  };

  const clearNotificationsPersisted = async () => {
    try {
      await notificationService.clearAll();
    } finally {
      clearNotifications();
    }
  };

  const handleProfile = () => {
    navigate('/dashboard/profile');
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
  };

  const handleLogout = () => {
    navigate('/', { replace: true });
    logout();
  };

  const handleThemeToggle = async () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    toggleTheme();

    if (!user?.id) return;

    try {
      const fontSize = localStorage.getItem('fontSize') || 'medium';
      await userSettingsService.updateAppearance(user.id, {
        theme_mode: nextMode,
        font_size: fontSize,
      });
    } catch (error) {
      console.error('Failed to persist theme from navbar:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    loadNotifications();

    const stopStream = notificationService.openStream({
      onNotification: (incoming) => {
        mergeNotifications([incoming]);
        setStreamConnected(true);
      },
      onError: () => {
        setStreamConnected(false);
      },
    });

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => {
      stopStream();
      window.clearInterval(interval);
      setStreamConnected(false);
    };
  }, [user?.id, loadNotifications]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(18,15,30,0.82)'
            : 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(16px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
        borderBottom: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.06)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 1px 12px rgba(0,0,0,0.4)'
            : '0 1px 12px rgba(0,0,0,0.04)',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: NAVBAR_HEIGHT,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 60 },
          px: { xs: 0.75, sm: 1.75, md: 2.25 },
          py: { xs: 0.35, sm: 0.8 },
          flexDirection: isArabic ? 'row-reverse' : 'row',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 0.5, sm: 0.9 },
          alignItems: 'center',
        }}
      >
        {/* Menu Toggle */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          sx={{
            mr: isArabic ? 0 : { xs: 0.75, sm: 1.25 },
            ml: isArabic ? { xs: 0.75, sm: 1.25 } : 0,
            color: 'text.primary',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            borderRadius: 2,
            p: { xs: 0.65, sm: 0.8 },
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          <MenuIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Logo */}
        <Box display="flex" alignItems="center">
          <Box
            component="img"
            src={logo}
            alt="MUS Logo"
            sx={{
              height: { xs: 32, sm: 34, md: 36 },
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Discover Resources Button */}
        <Button
          onClick={() => navigate('/discover')}
          variant="contained"
          sx={{
            mr: { xs: 0.6, sm: 0.9, md: 1 },
            borderRadius: 2,
            px: { md: 1.35, lg: 1.75 },
            py: { md: 0.52, lg: 0.6 },
            fontWeight: 700,
            textTransform: 'none',
            fontSize: { md: '0.74rem', lg: '0.78rem' },
            minWidth: 0,
            display: { xs: 'none', md: 'inline-flex' },
            background: 'linear-gradient(135deg, #7c5cfc 0%, #5b3fdd 100%)',
            boxShadow: '0 2px 8px rgba(124,92,252,0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6e4fe8 0%, #4e36cc 100%)',
              boxShadow: '0 4px 14px rgba(124,92,252,0.35)',
            },
          }}
        >
          Discover Resources
        </Button>

        <Box sx={{ mr: 1 }}>
          <SessionInboxMenu
            badgeCount={sessionUnreadCount}
            onOpenBooking={(bookingId) => navigate(`/dashboard/sessions?booking=${bookingId}&chat=1`)}
            onClear={async () => {
              await sessionService.clearInbox();
            }}
          />
        </Box>

        <Box sx={{ mr: 1 }}>
          <NotificationInboxMenu
            notifications={notifications}
            loading={notificationsLoading}
            error={notificationsError}
            streamConnected={streamConnected}
            onRefresh={loadNotifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={markAllVisibleAsRead}
            onClear={clearNotificationsPersisted}
          />
        </Box>

        {/* Theme Toggle */}
        <IconButton
          onClick={handleThemeToggle}
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          sx={{
            mr: { xs: 0.45, sm: 0.75, md: 1.15 },
            color: 'text.primary',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            borderRadius: 2,
            p: { xs: 0.65, sm: 0.8 },
            transition: 'all 0.22s ease',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
              transform: 'rotate(15deg)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          {mode === 'light' ? (
            <DarkMode sx={{ fontSize: 18 }} />
          ) : (
            <LightMode sx={{ fontSize: 18, color: 'warning.main' }} />
          )}
        </IconButton>

        <UserProfileMenu
          user={user}
          roles={roles}
          isArabic={isArabic}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onLogout={handleLogout}
          labels={{
            profile: t('navbar.profile'),
            settings: t('navbar.settings'),
            logout: t('navbar.logout'),
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool,
};

export { NAVBAR_HEIGHT };
