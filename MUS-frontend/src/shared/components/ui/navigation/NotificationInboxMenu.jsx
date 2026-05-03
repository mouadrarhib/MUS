import { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { MarkEmailRead, NotificationsNone, Refresh } from '@mui/icons-material';

const NotificationInboxMenu = memo(({
  notifications = [],
  loading = false,
  error = '',
  streamConnected = true,
  onRefresh,
  onNotificationClick,
  onMarkAllRead,
  onClear,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const unreadCount = useMemo(
    () => notifications.reduce((total, item) => total + (item?.is_read ? 0 : 1), 0),
    [notifications]
  );

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label="Open notifications"
          size="small"
          sx={{
            color: 'text.primary',
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.09),
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            borderRadius: 2,
            p: 0.8,
            transition: 'all 0.22s ease',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.18),
              borderColor: (theme) => alpha(theme.palette.secondary.main, 0.35),
            },
          }}
        >
          <Badge badgeContent={unreadCount > 99 ? '99+' : unreadCount} color="error">
            <NotificationsNone sx={{ fontSize: 19 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          sx: {
            width: 'min(100vw - 24px, 420px)',
            maxHeight: 520,
            borderRadius: 2.5,
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={800}>Notifications</Typography>
            <Typography variant="caption" color="text.secondary">
              {streamConnected ? 'Live updates connected' : 'Live updates reconnecting'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.4}>
            <Button
              size="small"
              startIcon={loading ? <CircularProgress size={13} /> : <Refresh sx={{ fontSize: 14 }} />}
              onClick={onRefresh}
              sx={{ textTransform: 'none' }}
            >
              Refresh
            </Button>
            <Button
              size="small"
              startIcon={<MarkEmailRead sx={{ fontSize: 14 }} />}
              disabled={!unreadCount}
              onClick={onMarkAllRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all
            </Button>
            <Button
              size="small"
              disabled={!notifications.length}
              onClick={onClear}
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
        <Divider />
        <Box sx={{ maxHeight: 430, overflowY: 'auto', py: 0.5 }}>
          {loading && !notifications.length ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress size={22} /></Box>
          ) : error ? (
            <Box sx={{ p: 1.5 }}><Typography variant="body2" color="error.main">{error}</Typography></Box>
          ) : notifications.length ? (
            notifications.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => {
                  setAnchorEl(null);
                  onNotificationClick?.(item);
                }}
                sx={{
                  alignItems: 'flex-start',
                  py: 1.1,
                  borderLeft: '3px solid',
                  borderLeftColor: item.is_read ? 'transparent' : 'primary.main',
                  bgcolor: item.is_read ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.06),
                  whiteSpace: 'normal',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700}>{item.title || item.type || 'Notification'}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.body || 'Open to view details.'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">No notifications yet.</Typography></Box>
          )}
        </Box>
      </Menu>
    </>
  );
});

NotificationInboxMenu.displayName = 'NotificationInboxMenu';

NotificationInboxMenu.propTypes = {
  notifications: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  streamConnected: PropTypes.bool,
  onRefresh: PropTypes.func,
  onNotificationClick: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  onClear: PropTypes.func,
};

export default NotificationInboxMenu;
