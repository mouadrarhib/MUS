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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

/**
 * Sidebar - A reusable sidebar navigation component
 */
export const Sidebar = ({
  items = [],
  title,
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

  const activePath = location.pathname;

  const isPathActive = (path) => {
    if (!path) return false;
    return activePath === path || activePath.startsWith(path + '/');
  };

  const initialOpenGroups = useMemo(() => {
    const result = {};
    items.forEach((item, index) => {
      if (item?.type === 'group' && Array.isArray(item.children) && item.children.length > 0) {
        const key = item.key || item.label || `group-${index}`;
        result[key] = item.children.some((child) => isPathActive(child.path));
      }
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, activePath]);

  const activeSections = useMemo(() => {
    const set = new Set();
    let currentSectionKey = null;

    items.forEach((item, index) => {
      if (item?.type === 'section') {
        currentSectionKey = item.key || item.label || `section-${index}`;
        return;
      }

      if (!currentSectionKey || item?.divider) return;

      let isActive = false;
      if (item?.type === 'group' && Array.isArray(item.children)) {
        isActive = item.children.some((child) => isPathActive(child.path));
      } else {
        isActive = isPathActive(item.path);
      }

      if (isActive) {
        set.add(currentSectionKey);
      }
    });

    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, activePath]);

  const [openGroups, setOpenGroups] = useState(initialOpenGroups);

  const handleItemClick = (path) => {
    if (path) {
      navigate(path);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => {
      const willOpen = !prev[groupKey];
      const next = {};
      Object.keys(prev).forEach((key) => {
        next[key] = false;
      });
      next[groupKey] = willOpen;
      return next;
    });
  };

  const drawerContent = (
    <Box>
      {title && (
        <>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              px: 2,
              py: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: 0.4,
              }}
            >
              {title}
            </Typography>
          </Toolbar>
          <Divider />
        </>
      )}
      <List sx={{ px: 1.5, py: 2 }}>
        {items.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
          }

          if (item.type === 'section') {
            const sectionKey = item.key || item.label || `section-${index}`;
            const sectionIsActive = activeSections.has(sectionKey);
            return (
              <Box key={item.key || item.label || index} sx={{ px: 1.5, py: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    fontWeight: sectionIsActive ? 700 : 600,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: sectionIsActive ? 'primary.main' : 'text.secondary',
                    px: 1,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }

          if (item.type === 'group') {
            const groupKey = item.key || item.label || `group-${index}`;
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const groupIsActive = hasChildren ? item.children.some((child) => isPathActive(child.path)) : false;
            const groupOpen = Boolean(openGroups[groupKey]);

            return (
              <Box key={groupKey} sx={{ my: 0.5 }}>
                <ListItemButton
                  onClick={() => (hasChildren ? toggleGroup(groupKey) : handleItemClick(item.path))}
                  selected={groupIsActive}
                  disabled={item.disabled}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: (theme) => theme.palette.primary.main + '12',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.main + '18',
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
                        minWidth: 36,
                        color: groupIsActive ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: groupIsActive ? 700 : 600,
                    }}
                  />
                  {hasChildren ? (groupOpen ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>

                {hasChildren && (
                  <Collapse in={groupOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 1 }}>
                      {item.children.map((child, childIndex) => {
                        const childActive = isPathActive(child.path);
                        return (
                          <ListItemButton
                            key={child.key || child.path || child.label || childIndex}
                            onClick={() => handleItemClick(child.path)}
                            selected={childActive}
                            disabled={child.disabled}
                            sx={{
                              my: 0.25,
                              ml: 0.75,
                              borderRadius: 2,
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.16)',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.22)',
                                },
                              },
                            }}
                          >
                            {child.icon && (
                              <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                                {child.icon}
                              </ListItemIcon>
                            )}
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontWeight: childActive ? 700 : 500,
                                fontSize: '0.95rem',
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          }

          const isActive = isPathActive(item.path);

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
                      backgroundColor: (theme) => theme.palette.primary.main + '12',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.primary.main + '18',
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
                    minWidth: 36,
                    color: isActive ? 'primary.main' : 'text.secondary',
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
      type: PropTypes.oneOf(['item', 'group', 'section']),
      key: PropTypes.string,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          path: PropTypes.string,
          icon: PropTypes.node,
          disabled: PropTypes.bool,
          key: PropTypes.string,
        })
      ),
    })
  ),
  title: PropTypes.string,
  width: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['permanent', 'temporary', 'persistent', 'responsive']),
  sx: PropTypes.object,
};

