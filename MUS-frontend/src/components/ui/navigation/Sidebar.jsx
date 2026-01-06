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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Sidebar - A reusable sidebar navigation component
 */
export const Sidebar = ({
  items = [],
  title,
  logo,
  width = 260,
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

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  const drawerContent = (
    <Box>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 2,
        }}
      >
        {logo && (
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              height: 40,
              mr: 2,
            }}
          />
        )}
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {title}
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {items.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
          }

          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <ListItemButton
              key={item.path || item.label || index}
              onClick={() => handleItemClick(item.path)}
              selected={isActive}
              disabled={item.disabled}
              sx={{
                my: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.contrastText' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  if (variant === 'temporary' || (isMobile && variant === 'responsive')) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            ...sx,
          },
        }}
        {...props}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...sx,
        },
      }}
      {...props}
    >
      {drawerContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
      divider: PropTypes.bool,
    })
  ),
  title: PropTypes.string,
  logo: PropTypes.string,
  width: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['permanent', 'temporary', 'persistent', 'responsive']),
  sx: PropTypes.object,
};

