import { memo, useCallback, useState } from 'react';
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
import { ForumOutlined, Refresh } from '@mui/icons-material';
import sessionService from '@/services/sessionService';

const formatShortDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const SessionInboxMenu = memo(({ badgeCount = 0, onOpenBooking, onClear }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);

  const open = Boolean(anchorEl);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await sessionService.listMyBookings({ limit: 25 });
      const normalized = Array.isArray(rows) ? rows : [];
      normalized.sort((a, b) => {
        const aTime = new Date(a.updated_at || a.start_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.start_at || 0).getTime();
        return bTime - aTime;
      });
      setBookings(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load chats');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(
    async (event) => {
      setAnchorEl(event.currentTarget);
      await load();
    },
    [load]
  );

  const handleClose = useCallback(() => setAnchorEl(null), []);

  return (
    <>
      <Tooltip title="Sessions Inbox">
        <IconButton
          onClick={handleOpen}
          aria-label="Open sessions inbox"
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
          <Badge badgeContent={badgeCount > 99 ? '99+' : badgeCount} color="secondary">
            <ForumOutlined sx={{ fontSize: 19 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          sx: {
            width: 'min(100vw - 24px, 410px)',
            maxHeight: 520,
            borderRadius: 2.5,
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.2 }}>
          <Typography variant="subtitle2" fontWeight={800}>Sessions Inbox</Typography>
          <Stack direction="row" spacing={0.4}>
            <Button size="small" startIcon={loading ? <CircularProgress size={13} /> : <Refresh sx={{ fontSize: 14 }} />} onClick={load} sx={{ textTransform: 'none' }}>
              Refresh
            </Button>
            <Button
              size="small"
              onClick={async () => {
                try {
                  await onClear?.();
                } finally {
                  setBookings([]);
                  setError('');
                }
              }}
              disabled={!bookings.length}
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
        <Divider />
        <Box sx={{ maxHeight: 430, overflowY: 'auto', py: 0.5 }}>
          {loading && !bookings.length ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={22} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 1.5 }}>
              <Typography variant="body2" color="error.main">{error}</Typography>
            </Box>
          ) : bookings.length ? (
            bookings.map((booking) => {
              const bookingId = Number(booking.booking_id || booking.id || 0);
              const status = String(booking?.status || '').toLowerCase();
              const canChat = status === 'confirmed' || status === 'completed';
              return (
                <MenuItem
                  key={bookingId}
                  onClick={() => {
                    if (!canChat) return;
                    handleClose();
                    onOpenBooking(bookingId);
                  }}
                  sx={{
                    whiteSpace: 'normal',
                    alignItems: 'flex-start',
                    py: 1.1,
                    borderLeft: '3px solid',
                    borderLeftColor: canChat ? 'secondary.main' : 'warning.main',
                    opacity: canChat ? 1 : 0.92,
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {(booking.teacher_name || booking.student_name || 'Session')} • {String(booking.status || 'pending')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {formatShortDate(booking.start_at)}
                    </Typography>
                    {!canChat ? (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.2 }}>
                        Awaiting tutor confirmation
                      </Typography>
                    ) : null}
                  </Box>
                </MenuItem>
              );
            })
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No chats yet.</Typography>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
});

SessionInboxMenu.displayName = 'SessionInboxMenu';

SessionInboxMenu.propTypes = {
  badgeCount: PropTypes.number,
  onOpenBooking: PropTypes.func.isRequired,
  onClear: PropTypes.func,
};

export default SessionInboxMenu;
