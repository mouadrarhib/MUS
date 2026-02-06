// src/shared/components/ui/navigation/Sidebar.jsx
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

export const Sidebar = ({
  items = [],
  width = 280,
  open = true,
  onClose,
  variant = 'permanent',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  const isPathActive = (path) => {
    if (!path) return false;
    return activePath === path || activePath.startsWith(path + '/');
  };

  const handleItemClick = (path) => {
    if (path) navigate(path);
    if (onClose && variant === 'temporary') onClose();
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            M
          </Box>
          <Typography variant="h6" fontWeight="700" color="text.primary">
            MUS
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 2 }}>
        <List sx={{ p: 0 }}>
          {items.map((item, index) => {
            // Render section headers
            if (item.type === 'section') {
              return (
                <Box key={index} sx={{ mt: index > 0 ? 3 : 1, mb: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.5}
                    sx={{ px: 2 }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              );
            }

            const isActive = isPathActive(item.path);

            return (
              <ListItemButton
                key={index}
                onClick={() => handleItemClick(item.path)}
                selected={isActive}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s',
                  color: isActive ? 'primary.main' : 'text.primary',
                  bgcolor: isActive ? alpha('#667eea', 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? alpha('#667eea', 0.15) : 'action.hover',
                  },
                  '&.Mui-selected': {
                    bgcolor: alpha('#667eea', 0.1),
                    '&:hover': {
                      bgcolor: alpha('#667eea', 0.15),
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer Section (Optional) */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © 2026 MUS Platform
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          border: variant === 'permanent' ? 'none' : undefined,
          borderRight: variant === 'permanent' ? '1px solid' : undefined,
          borderColor: variant === 'permanent' ? 'divider' : undefined,
        },
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
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
  variant: PropTypes.oneOf(['permanent', 'temporary']),
};
