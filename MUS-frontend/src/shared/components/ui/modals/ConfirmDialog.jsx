import PropTypes from 'prop-types';
import {
  alpha,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  DeleteOutline,
  ErrorOutline,
  InfoOutlined,
  WarningAmber,
} from '@mui/icons-material';

const ICON_BY_SEVERITY = {
  error: DeleteOutline,
  warning: WarningAmber,
  info: InfoOutlined,
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  details = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  severity = 'warning',
  loading = false,
}) => {
  const theme = useTheme();
  const COLOR_BY_SEVERITY = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.primary.main,
  };
  const AccentIcon = ICON_BY_SEVERITY[severity] || WarningAmber;
  const accentColor = COLOR_BY_SEVERITY[severity] || COLOR_BY_SEVERITY.warning;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: (t) => `${t.shape.xl}px`,
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          overflow: 'hidden',
        },
      }}
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ position: 'relative', px: 3, pt: 3, pb: 2.5 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
            }}
          />

          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(accentColor, 0.12),
                  border: '1px solid',
                  borderColor: alpha(accentColor, 0.22),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccentIcon sx={{ fontSize: 20, color: accentColor }} />
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  {title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.76rem' }}>
                  Review this action carefully before continuing.
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={loading ? undefined : onClose}
              sx={{
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: 1.5,
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            borderRadius: 2.5,
            p: 2.5,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(248,249,255,0.8)',
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
            {message}
          </Typography>

          {details.length > 0 ? (
            <Alert severity={severity} sx={{ mt: 2, borderRadius: 2 }}>
              <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
                {details.map((detail) => (
                  <Box component="li" key={detail} sx={{ py: 0.2 }}>
                    {detail}
                  </Box>
                ))}
              </Box>
            </Alert>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1,
          borderTop: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={severity === 'info' ? 'primary' : severity}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <ErrorOutline sx={{ fontSize: 16 }} /> : null}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  details: PropTypes.arrayOf(PropTypes.string),
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  severity: PropTypes.oneOf(['error', 'warning', 'info']),
  loading: PropTypes.bool,
};

export default ConfirmDialog;
