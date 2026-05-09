import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';

// ─── sx constants ─────────────────────────────────────────────────────────────
const dialogPaperSx = {
  borderRadius: 3,
  overflow: 'hidden',
  boxShadow: '0 24px 48px rgba(0,0,0,0.14)',
};

const headerSx = (theme) => ({
  px: 3,
  pt: 3,
  pb: 2.5,
  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.10)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
});

const iconBadgeSx = (theme) => ({
  width: 52,
  height: 52,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: alpha(theme.palette.warning.main, 0.14),
  border: `2px solid ${alpha(theme.palette.warning.main, 0.25)}`,
  boxShadow: `0 0 0 6px ${alpha(theme.palette.warning.main, 0.07)}`,
  color: 'warning.dark',
  flexShrink: 0,
});

const statusChipSx = (theme) => ({
  height: 24,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: 0.3,
  bgcolor: alpha(theme.palette.warning.main, 0.14),
  color: 'warning.dark',
  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  '& .MuiChip-label': { px: 1.2 },
});

const resourceBoxSx = (theme) => ({
  px: 2,
  py: 1.4,
  borderRadius: 2,
  bgcolor: alpha(theme.palette.warning.main, 0.06),
  border: `1px solid ${alpha(theme.palette.warning.main, 0.18)}`,
  borderLeft: `3px solid ${theme.palette.warning.main}`,
});

const noteBoxSx = (theme) => ({
  p: 1.8,
  borderRadius: 2,
  bgcolor: alpha(theme.palette.info.main, 0.07),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.2,
});

// ─── styled button — guarantees white text regardless of theme ────────────────
const ConfirmButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.95rem',
  borderRadius: 8,
  paddingTop: theme.spacing(1.2),
  paddingBottom: theme.spacing(1.2),
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
    transform: 'translateY(-1px)',
    color: '#ffffff',
  },
  '&:active': {
    backgroundColor: theme.palette.primary.dark,
    color: '#ffffff',
  },
  transition: 'all 0.2s ease',
  width: '100%',
  minHeight: 46,
}));

// ─────────────────────────────────────────────────────────────────────────────
const ResourceReviewNoticeDialog = ({
  open,
  onClose,
  title,
  message,
  statusLabel,
  resourceTitle,
  note,
  actionLabel,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: dialogPaperSx }}
  >
    {/* ── Header ─────────────────────────────────────────────────────────── */}
    <Box sx={headerSx}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={iconBadgeSx}>
          <AutoAwesome sx={{ fontSize: 22 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={800} lineHeight={1.2} mb={0.6}>
            {title}
          </Typography>
          <Chip
            icon={<AccessTimeOutlined sx={{ fontSize: '13px !important' }} />}
            label={statusLabel}
            size="small"
            sx={statusChipSx}
          />
        </Box>
      </Stack>
    </Box>

    {/* ── Content ────────────────────────────────────────────────────────── */}
    <DialogContent sx={{ px: 3, py: 2.5 }}>
      <Stack spacing={2}>

        {/* Main message */}
        <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
          {message}
        </Typography>

        {/* Resource title highlight */}
        {resourceTitle ? (
          <Box sx={resourceBoxSx}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', mb: 0.3 }}
            >
              Resource
            </Typography>
            <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
              {resourceTitle}
            </Typography>
          </Box>
        ) : null}

        {/* Note block */}
        <Box sx={noteBoxSx}>
          <InfoOutlined sx={{ fontSize: 18, color: 'info.main', mt: 0.1, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary" lineHeight={1.65}>
            {note}
          </Typography>
        </Box>

      </Stack>
    </DialogContent>

    {/* ── Actions ────────────────────────────────────────────────────────── */}
    <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <ConfirmButton
        onClick={onClose}
        variant="contained"
        sx={{
          backgroundColor: '#1976d2',
          color: '#fff !important',
          WebkitTextFillColor: '#fff',
          '&:hover': { backgroundColor: '#1565c0', color: '#fff !important', WebkitTextFillColor: '#fff' },
        }}
      >
        <span style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>{actionLabel || 'Got it'}</span>
      </ConfirmButton>
    </DialogActions>
  </Dialog>
);

ResourceReviewNoticeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  statusLabel: PropTypes.string,
  resourceTitle: PropTypes.string,
  note: PropTypes.string,
  actionLabel: PropTypes.string,
};

ResourceReviewNoticeDialog.defaultProps = {
  title: 'Update Sent for Review',
  message: 'Your changes were submitted for admin verification.',
  statusLabel: 'Status: Pending',
  resourceTitle: '',
  note: 'You will receive a notification after admin review is complete.',
  actionLabel: 'Got it',
};

export default ResourceReviewNoticeDialog;
