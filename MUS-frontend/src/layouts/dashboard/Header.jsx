import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  InputBase,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useThemeMode } from '@/app/providers/ThemeContext';
import { DRAWER_WIDTH } from './Sidebar';

const Header = ({ onMenuClick, isSidebarOpen = true }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleProfile = () => {
    navigate('/dashboard/profile');
    handleCloseUserMenu();
  };

  const handleSettings = () => {
    navigate('/dashboard/settings');
    handleCloseUserMenu();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseUserMenu();
  };

  // Notifications fictives
  const notifications = [
    { id: 1, message: 'Nouvelle ressource en attente de validation', time: '5 min' },
    { id: 2, message: '3 nouveaux utilisateurs inscrits', time: '1 h' },
    { id: 3, message: 'Rapport mensuel disponible', time: '2 h' },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: '100%', lg: isSidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
        ml: { xs: 0, lg: isSidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Menu Icon (Mobile only) */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.primary, 0.06),
            },
            mr: 2,
            ml: { xs: 0, sm: 2 },
            width: { xs: 'auto', sm: 'auto', md: 400 },
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </Box>
          <InputBase
            placeholder="Rechercher..."
            sx={{
              color: 'inherit',
              width: '100%',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1.5, 1.5, 1.5, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                transition: theme.transitions.create('width'),
                width: '100%',
              },
            }}
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toggle Theme */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.06),
              },
            }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleOpenNotifications}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.06),
              },
            }}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={handleOpenUserMenu}
            sx={{
              p: 0.5,
              ml: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.06),
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
          </IconButton>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          onClick={handleCloseUserMenu}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: 2,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                borderRadius: 1,
                mx: 1,
                my: 0.5,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.full_name || 'Admin User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'admin@example.com'}
            </Typography>
          </Box>
          <Divider />
          
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mon profil</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Paramètres</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Déconnexion</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorElNotifications}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotifications}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              width: 320,
              maxHeight: 400,
              borderRadius: 2,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
          <Divider />
          
          {notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleCloseNotifications}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 0,
                alignItems: 'flex-start',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Il y a {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          <Divider />
          <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            >
              Voir toutes les notifications
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
