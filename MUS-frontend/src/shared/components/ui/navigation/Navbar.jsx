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
  const showContributorPoints = primaryRole !== 'ADMIN';

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
          gap: { xs: 0.5, sm: 0.9 },
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

        {/* User Profile Section */}
        <Box display="flex" alignItems="center" gap={{ xs: 0.65, sm: 1.1 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={{ xs: 0.55, sm: 1.15 }}
            sx={{
              px: { xs: 0.75, sm: 1.2, md: 1.45 },
              py: { xs: 0.5, sm: 0.75 },
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
            <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'right' }}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="text.primary"
                sx={{ lineHeight: 1.3, fontSize: '0.82rem' }}
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
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {primaryRole}
                </Box>
                {showContributorPoints ? (
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
                       fontSize: '0.6rem',
                      fontWeight: 700,
                    }}
                  >
                    <EmojiEvents sx={{ fontSize: 10 }} />
                    {userPoints}
                  </Box>
                ) : null}
              </Box>
            </Box>

            {/* Avatar */}
            <Avatar
              sx={{
                width: { xs: 34, sm: 37, md: 38 },
                height: { xs: 34, sm: 37, md: 38 },
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)',
                fontWeight: 700,
                fontSize: { xs: '0.9rem', sm: '0.94rem' },
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
              sx: { p: 0 },
            }}
            PaperProps={{
              elevation: 0,
              sx: {
                width: 'min(100vw - 20px, 340px)',
                minWidth: { xs: 250, sm: 280 },
                mt: 1.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.07)',
                backdropFilter: 'blur(20px)',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(22,18,34,0.96)'
                    : 'rgba(255,255,255,0.97)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)'
                    : '0 12px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)',
                overflow: 'hidden',
              },
            }}
          >
            {/* Profile Card Header */}
            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                px: 2.5,
                pt: 2.5,
                pb: 2,
              }}
            >
              {/* Gradient background accent */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 72,
                  background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 60%, #10b981 100%)',
                  opacity: (theme) => theme.palette.mode === 'dark' ? 0.2 : 0.1,
                }}
              />

              <Box display="flex" alignItems="center" gap={1.5} position="relative" zIndex={1}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #7c5cfc 0%, #3b82f6 100%)',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    border: '3px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(124,92,252,0.3)'
                        : 'rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 14px rgba(124,92,252,0.35)',
                  }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>

                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    noWrap
                    sx={{ fontSize: '0.92rem', lineHeight: 1.3 }}
                  >
                    {user?.full_name || 'User'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block', fontSize: '0.76rem', mt: 0.15 }}
                  >
                    {user?.email || 'No email'}
                  </Typography>
                </Box>
              </Box>

              {/* Role & Points badges */}
              <Box display="flex" gap={0.8} mt={1.5} position="relative" zIndex={1}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.35,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                    color: 'primary.main',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  <Person sx={{ fontSize: 12 }} />
                  {primaryRole}
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 1,
                    py: 0.35,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.warning.main, 0.18),
                    color: 'warning.dark',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 12 }} />
                  {userPoints} pts
                </Box>
              </Box>
            </Box>

            <Divider sx={{
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }} />

            {/* Navigation Items */}
            <Box sx={{ py: 0.8, px: 0.8 }}>
              {[
                {
                  icon: Person,
                  label: t('navbar.profile'),
                  description: 'View & edit your profile',
                  onClick: handleProfile,
                  color: '#7c5cfc',
                },
                {
                  icon: Settings,
                  label: t('navbar.settings'),
                  description: 'Preferences & account',
                  onClick: handleSettings,
                  color: '#3b82f6',
                },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <MenuItem
                    key={item.label}
                    onClick={item.onClick}
                    sx={{
                      py: 1.2,
                      px: 1.5,
                      borderRadius: 2,
                      mb: 0.3,
                      gap: 1.5,
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        bgcolor: (theme) => alpha(item.color, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                        '& .menu-icon-box': {
                          borderColor: alpha(item.color, 0.35),
                          bgcolor: alpha(item.color, 0.15),
                        },
                      },
                    }}
                  >
                    <Box
                      className="menu-icon-box"
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(item.color, 0.08),
                        border: '1px solid',
                        borderColor: alpha(item.color, 0.15),
                        transition: 'all 0.18s ease',
                        flexShrink: 0,
                      }}
                    >
                      <ItemIcon sx={{ fontSize: 18, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Box>

            <Divider sx={{
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }} />

            {/* Logout */}
            <Box sx={{ py: 0.8, px: 0.8 }}>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.2,
                  px: 1.5,
                  borderRadius: 2,
                  gap: 1.5,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.07),
                    '& .logout-icon-box': {
                      borderColor: (theme) => alpha(theme.palette.error.main, 0.35),
                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                    },
                  },
                }}
              >
                <Box
                  className="logout-icon-box"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.error.main, 0.15),
                    transition: 'all 0.18s ease',
                    flexShrink: 0,
                  }}
                >
                  <Logout sx={{ fontSize: 18, color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="error.main" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                    {t('navbar.logout')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    Sign out of your account
                  </Typography>
                </Box>
              </MenuItem>
            </Box>
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
