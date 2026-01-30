import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Badge,
  Collapse,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import navigationConfig from './config-navigation';
import Logo from '@/assets/images/logo.png';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose, isDesktop }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState({});

  // Calculer les sections qui devraient être ouvertes basées sur la route actuelle
  // Utiliser useMemo au lieu de useEffect pour éviter le warning
  const initialOpenSections = useMemo(() => {
    const currentPath = location.pathname;
    const sections = {};
    
    navigationConfig.forEach((section, sectionIndex) => {
      if (section.items) {
        const isActive = section.items.some(item => currentPath.startsWith(item.path));
        if (isActive) {
          sections[sectionIndex] = true;
        }
      }
    });
    
    return sections;
  }, [location.pathname]);

  // Fusionner les sections initiales avec les sections manuellement ouvertes/fermées
  const effectiveOpenSections = useMemo(() => {
    return { ...initialOpenSections, ...openSections };
  }, [initialOpenSections, openSections]);

  const handleToggleSection = (sectionIndex) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionIndex]: !effectiveOpenSections[sectionIndex],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (!isDesktop) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavItem = (item, index) => {
    const active = isActivePath(item.path);

    return (
      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          sx={{
            borderRadius: 1,
            mx: 1.5,
            px: 2,
            py: 1,
            minHeight: 44,
            color: active ? 'primary.main' : 'text.secondary',
            backgroundColor: active 
              ? alpha(theme.palette.primary.main, 0.08) 
              : 'transparent',
            '&:hover': {
              backgroundColor: active
                ? alpha(theme.palette.primary.main, 0.12)
                : alpha(theme.palette.text.primary, 0.04),
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: active ? 'primary.main' : 'text.secondary',
            }}
          >
            {item.badge ? (
              <Badge badgeContent={item.badge} color="error">
                {item.icon}
              </Badge>
            ) : (
              item.icon
            )}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: active ? 600 : 500,
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const renderNavSection = (section, sectionIndex) => {
    // Section simple (sans sous-items)
    if (!section.items) {
      return renderNavItem(section, sectionIndex);
    }

    // Section avec sous-items
    const isOpen = effectiveOpenSections[sectionIndex] || false;

    return (
      <Box key={sectionIndex} sx={{ mb: 1 }}>
        {/* Titre de section cliquable */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleToggleSection(sectionIndex)}
            sx={{
              px: 2.5,
              py: 1,
              mx: 1.5,
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={section.title}
              primaryTypographyProps={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: 'text.secondary',
              }}
            />
            {isOpen ? (
              <ExpandLess fontSize="small" sx={{ color: 'text.secondary' }} />
            ) : (
              <ExpandMore fontSize="small" sx={{ color: 'text.secondary' }} />
            )}
          </ListItemButton>
        </ListItem>

        {/* Sous-items */}
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List disablePadding>
            {section.items.map((item, itemIndex) => renderNavItem(item, itemIndex))}
          </List>
        </Collapse>
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo et titre */}
      <Box
        sx={{
          px: 2.5,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
          }}
        />
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Moroccan Uni Student
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Profil utilisateur */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          m: 1.5,
          borderRadius: 2,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {user?.full_name?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            noWrap
            color="text.primary"
          >
            {user?.full_name || 'Admin User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email || 'admin@example.com'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
        <List disablePadding>
          {navigationConfig.map((section, index) => renderNavSection(section, index))}
        </List>
      </Box>

      <Divider />

      {/* Bouton de déconnexion */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            px: 2,
            py: 1.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Déconnexion"
            primaryTypographyProps={{
              fontSize: 14,
              fontWeight: 600,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };
