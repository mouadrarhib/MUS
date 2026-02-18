// src/shared/components/ui/navigation/Navbar.jsx
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
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
  LightMode
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

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: NAVBAR_HEIGHT,
      }}
    >
      <Toolbar sx={{ height: NAVBAR_HEIGHT, px: { xs: 2, sm: 3 }, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
        {/* Menu Toggle Button */}
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          sx={{
            mr: isArabic ? 0 : 2,
            ml: isArabic ? 2 : 0,
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box display="flex" alignItems="center">
          <Box
            component="img"
            src={logo}
            alt="MUS Logo"
            sx={{
              height: 50,
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle Button */}
        <IconButton
          onClick={handleThemeToggle}
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          sx={{
            mr: 1,
            color: 'text.primary',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
              borderColor: 'primary.main',
              transform: 'rotate(12deg)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 2,
            },
          }}
        >
          {mode === 'light' ? (
            <DarkMode sx={{ fontSize: 20 }} />
          ) : (
            <LightMode sx={{ fontSize: 20, color: 'warning.main' }} />
          )}
        </IconButton>

        {/* User Profile Section */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1.5}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              transition: 'all 0.2s',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
                boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
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
                fontWeight={600} 
                color="text.primary"
                sx={{ lineHeight: 1.3 }}
              >
                {user?.full_name || 'User'}
              </Typography>
                <Box
                  component="span"
                sx={{
                  display: 'inline-block',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
                >
                  {primaryRole}
                </Box>
              </Box>

            {/* Avatar */}
            <Avatar
              sx={{
                width: 42,
                height: 42,
                bgcolor: 'primary.main',
                fontWeight: 700,
                fontSize: '1.1rem',
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
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
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderLeft: '1px solid',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
              },
            }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'No email'}
              </Typography>
            </Box>

            <Divider />

            {/* Menu Items */}
            <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              {t('navbar.profile')}
            </MenuItem>

            <MenuItem onClick={handleSettings} sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              {t('navbar.settings')}
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2, color: 'error.main' }}>
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
