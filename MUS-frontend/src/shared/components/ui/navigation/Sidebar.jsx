import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  Toolbar,
  Collapse,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ExpandLess, ExpandMore, Logout } from '@mui/icons-material';
import { useAuth } from '@/features/auth/context/AuthContext';

export const Sidebar = ({
  items = [],
  width = 280,
  open = true,
  onClose,
  variant = 'permanent',
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Access auth context

  const activePath = location.pathname;

  const isPathActive = (path) => {
    if (!path) return false;
    return activePath === path || activePath.startsWith(path + '/');
  };

  // --- LOGIC: Group Expansion Management ---
  const initialOpenGroups = useMemo(() => {
    const result = {};
    items.forEach((item, index) => {
      if (item?.type === 'group' && Array.isArray(item.children)) {
        const key = item.key || `group-${index}`;
        result[key] = item.children.some((child) => isPathActive(child.path));
      }
    });
    return result;
  }, [items, activePath]);

  const [openGroups, setOpenGroups] = useState(initialOpenGroups);

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleItemClick = (path) => {
    if (path) navigate(path);
    if (isMobile && onClose) onClose();
  };

  // --- CONTENT: The Scrollable List ---
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. Header (Logo Area) */}
      <Toolbar sx={{ px: 2.5, minHeight: 64 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
          MUS<Box component="span" sx={{ color: 'text.primary' }}>Dashboard</Box>
        </Typography>
      </Toolbar>
      <Divider />

      {/* 2. Navigation Items (Scrollable) */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 2 }}>
        <List component="nav" disablePadding>
          {items.map((item, index) => {
            // --- RENDER SECTION HEADER ---
            if (item.type === 'section') {
              return (
                <Box key={index} sx={{ mt: 2.5, mb: 1, px: 1.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            }

            // --- RENDER GROUP (Dropdown) ---
            if (item.type === 'group') {
              const groupKey = item.key || `group-${index}`;
              const isOpen = openGroups[groupKey];
              const isActive = item.children?.some(c => isPathActive(c.path));
              
              return (
                <Box key={groupKey} sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    onClick={() => toggleGroup(groupKey)}
                    selected={isActive}
                    sx={{ borderRadius: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {item.children.map((child, idx) => (
                        <ListItemButton
                          key={idx}
                          onClick={() => handleItemClick(child.path)}
                          selected={isPathActive(child.path)}
                          sx={{ borderRadius: 1.5, mt: 0.5 }}
                        >
                           <ListItemIcon sx={{ minWidth: 36, color: isPathActive(child.path) ? 'primary.main' : 'inherit' }}>
                             {child.icon}
                           </ListItemIcon>
                          <ListItemText primary={child.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            // --- RENDER SINGLE ITEM ---
            const isActive = isPathActive(item.path);
            return (
              <ListItemButton
                key={index}
                onClick={() => handleItemClick(item.path)}
                selected={isActive}
                sx={{ 
                  borderRadius: 1.5, 
                  mb: 0.5,
                  bgcolor: isActive ? 'primary.lighter' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.primary'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* 3. Footer (User Profile) */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1.5, 
            borderRadius: 2,
            bgcolor: 'action.hover',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/dashboard/profile')}
        >
          <Avatar 
            src={user?.avatar} 
            sx={{ width: 40, height: 40, mr: 1.5 }}
          >
            {user?.full_name?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {user?.full_name || 'Guest'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {user?.role || 'Visitor'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : variant}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' },
        ...sx
      }}
      {...props}
    >
      {drawerContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  items: PropTypes.array,
  width: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  variant: PropTypes.string,
  sx: PropTypes.object
};