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
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Person,
  DarkMode,
  LightMode,
  EmojiEvents
} from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useThemeMode } from '@/app/providers/ThemeContext';
import userSettingsService from '@/services/userSettingsService';
import { useState } from 'react';
import logo from '@/assets/images/logo.png';
import { useLanguage } from '@/app/providers/LanguageContext';

const NAVBAR_HEIGHT = 64;

export const Navbar = ({ onMenuClick, sidebarOpen, sidebarWidth = 280 }) => {
  const { user, roles, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate('/dashboard/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/dashboard/settings');
  };

  const handleLogout = () => {
    handleMenuClose();
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

  const getPrimaryRole = () => {
    const roleCandidates =
      Array.isArray(roles) && roles.length > 0
        ? roles
        : Array.isArray(user?.roles)
          ? user.roles
          : user?.role
            ? [user.role]
            : [];

    if (!roleCandidates.length) return "STUDENT";

    const normalizedRoles = roleCandidates
      .map((role) => String(role || "").trim().toUpperCase().replace(/^ROLE_/, ""))
      .filter(Boolean);

    const priority = ["ADMIN", "TEACHER", "MODERATOR", "STUDENT", "USER"];
    const prioritized = priority.find((role) => normalizedRoles.includes(role));
    return prioritized || normalizedRoles[0];
  };

  const primaryRole = getPrimaryRole();
  const userPoints = Number(user?.points || 0);

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
      <Toolbar sx={{ height: NAVBAR_HEIGHT, px: { xs: 2, sm: 3 }, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
        {/* Menu Toggle */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          sx={{
            mr: isArabic ? 0 : 1.5,
            ml: isArabic ? 1.5 : 0,
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
              height: 42,
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
            mr: 1,
            borderRadius: 2,
            px: 2,
            py: 0.65,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.82rem',
            display: { xs: 'none', sm: 'inline-flex' },
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

        {/* Theme Toggle */}
        <IconButton
          onClick={handleThemeToggle}
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          sx={{
            mr: 1.5,
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

        {/* User Profile Section */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            sx={{
              px: 1.5,
              py: 0.8,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
              transition: 'all 0.22s ease',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                boxShadow: (theme) => `0 2px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
            onClick={handleMenuOpen}
            role="button"
            tabIndex={0}
            aria-label="Open user menu"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleMenuOpen(event);
              }
            }}
          >
            {/* User Name and Role - Hidden on mobile */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="text.primary"
                sx={{ lineHeight: 1.3, fontSize: '0.85rem' }}
              >
                {user?.full_name || 'User'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.6, mt: 0.3 }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    color: 'primary.main',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {primaryRole}
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.35,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.warning.main, 0.18),
                    color: 'warning.dark',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 10 }} />
                  {userPoints}
                </Box>
              </Box>
            </Box>

            {/* Avatar */}
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: '2px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(255,255,255,0.9)',
                boxShadow: '0 2px 8px rgba(124,92,252,0.3)',
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </Avatar>
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            anchorOrigin={{ horizontal: isArabic ? 'left' : 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: isArabic ? 'left' : 'right', vertical: 'top' }}
            MenuListProps={{
              'aria-label': 'User menu',
              autoFocusItem: open,
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                minWidth: 220,
                mt: 1.5,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                backdropFilter: 'blur(16px)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(24,20,36,0.95)'
                    : 'rgba(255,255,255,0.95)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.5)'
                    : '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'visible',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: isArabic ? 'auto' : 14,
                  left: isArabic ? 14 : 'auto',
                  width: 10,
                  height: 10,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(24,20,36,0.95)'
                      : 'rgba(255,255,255,0.95)',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderLeft: '1px solid',
                  borderTop: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={700}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user?.email || 'No email'}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1,
                  py: 0.35,
                  borderRadius: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.warning.main, 0.18),
                  color: 'warning.dark',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                <EmojiEvents sx={{ fontSize: 13 }} />
                {userPoints} pts
              </Box>
            </Box>

            <Divider sx={{ borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

            {/* Menu Items */}
            <MenuItem
              onClick={handleProfile}
              sx={{
                py: 1.2,
                px: 2,
                mx: 0.5,
                my: 0.3,
                borderRadius: 1.5,
                transition: 'all 0.15s ease',
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              {t('navbar.profile')}
            </MenuItem>

            <MenuItem
              onClick={handleSettings}
              sx={{
                py: 1.2,
                px: 2,
                mx: 0.5,
                my: 0.3,
                borderRadius: 1.5,
                transition: 'all 0.15s ease',
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              {t('navbar.settings')}
            </MenuItem>

            <Divider sx={{ borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.2,
                px: 2,
                mx: 0.5,
                my: 0.3,
                borderRadius: 1.5,
                color: 'error.main',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              {t('navbar.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool,
  sidebarWidth: PropTypes.number,
};

export { NAVBAR_HEIGHT };
