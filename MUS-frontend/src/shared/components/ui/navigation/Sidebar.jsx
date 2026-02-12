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
  navbarHeight = 0,
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
      {/* Navigation Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: { xs: 1.5, sm: 2 },
          py: 2,
        }}
      >
        <List sx={{ p: 0 }}>
          {items.map((item, index) => {
            // Render section headers
            if (item.type === 'section') {
              return (
                <Box key={index} sx={{ mt: index > 0 ? 2.5 : 0.5, mb: 1 }}>
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
                aria-current={isActive ? 'page' : undefined}
                sx={{
                  mb: 0.5,
                  borderRadius: 2,
                  py: { xs: 1.2, sm: 1.35 },
                  px: { xs: 1.25, sm: 1.5 },
                  minHeight: 46,
                  transition: 'all 0.2s',
                  color: isActive ? 'primary.main' : 'text.primary',
                  bgcolor: isActive ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    bgcolor: (theme) => isActive 
                      ? alpha(theme.palette.primary.main, 0.15) 
                      : 'action.hover',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { xs: 34, sm: 38 },
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
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
          px: { xs: 1.5, sm: 2 },
          py: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
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
          ...(variant === 'temporary' && {
            top: navbarHeight,
            height: `calc(100% - ${navbarHeight}px)`,
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      BackdropProps={{
        sx: {
          top: variant === 'temporary' ? `${navbarHeight}px` : 0,
          bgcolor: (theme) => alpha(theme.palette.common.black, 0.32),
          backdropFilter: 'blur(1.5px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  items: PropTypes.array,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  open: PropTypes.bool,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['permanent', 'temporary']),
  navbarHeight: PropTypes.number,
};
