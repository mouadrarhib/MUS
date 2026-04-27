// src/features/discover/components/NotificationMenu.jsx
import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { NotificationsNone, Refresh } from '@mui/icons-material';

/**
 * Self-contained notification bell + dropdown.
 * Owns its own open/close state — the parent only passes data and callbacks.
 *
 * Props (5 instead of the previous 9):
 *   unreadCount       – number of unread items (badge + header chip)
 *   loading           – show spinner on the refresh button / inside menu
 *   notifications     – array of notification objects
 *   onRefresh         – called when the user clicks the refresh button
 *   onNotificationClick – called with the full notification object on click
 */
const NotificationMenu = memo(({
  unreadCount,
  loading,
  notifications,
  onRefresh,
  onNotificationClick,
}) => {
  // Open/close state lives here — no need to leak it to the parent
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen  = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchorEl(null), []);

  // Close the menu before navigating so the overlay disappears instantly
  const handleItemClick = useCallback((notification) => {
    handleClose();
    onNotificationClick(notification);
  }, [handleClose, onNotificationClick]);

  return (
    <>
      {/* ── Bell button ──────────────────────────────────────────────── */}
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          size="small"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          aria-haspopup="true"
          aria-expanded={open}
          sx={(theme) => ({
            color: 'text.primary',
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.08)',
            borderRadius: 2,
            p: 0.8,
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
          })}
        >
          <Badge
            badgeContent={unreadCount > 99 ? '99+' : unreadCount || 0}
            color="error"
            invisible={unreadCount === 0}
          >
            <NotificationsNone sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* ── Dropdown menu ────────────────────────────────────────────── */}
      <MuiMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              width: 340,
              maxHeight: 480,
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.25, flexShrink: 0 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Stack>

          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh notifications"
              >
                {loading
                  ? <CircularProgress size={14} />
                  : <Refresh sx={{ fontSize: 16 }} />
                }
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        <Divider />

        {/* Body — scrollable */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleItemClick(item)}
                sx={(theme) => ({
                  whiteSpace: 'normal',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  px: 2,
                  py: 1.25,
                  opacity: item.is_read ? 0.72 : 1,
                  // Subtle highlight for unread items instead of the
                  // "colored side border" anti-pattern
                  bgcolor: !item.is_read
                    ? alpha(theme.palette.primary.main, 0.05)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.09),
                  },
                })}
              >
                {/* Unread dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    mt: 0.6,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: !item.is_read ? 'primary.main' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={item.is_read ? 400 : 600}
                    noWrap={false}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {item.title || 'Notification'}
                  </Typography>
                  {item.body && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}
                    >
                      {item.body}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet.
              </Typography>
            </Box>
          )}
        </Box>
      </MuiMenu>
    </>
  );
});

NotificationMenu.displayName = 'NotificationMenu';

NotificationMenu.propTypes = {
  unreadCount:         PropTypes.number.isRequired,
  loading:             PropTypes.bool.isRequired,
  notifications:       PropTypes.arrayOf(PropTypes.object).isRequired,
  onRefresh:           PropTypes.func.isRequired,
  onNotificationClick: PropTypes.func.isRequired,
};

export default NotificationMenu;