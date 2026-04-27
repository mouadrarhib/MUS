import { memo } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, TextField, Typography, alpha,
} from '@mui/material';
import { Close, DeleteForever, WarningAmber } from '@mui/icons-material';
import PropTypes from 'prop-types';

// The confirmation keyword the user must type exactly
const CONFIRM_KEYWORD = 'DELETE';

const DeleteAccountDialog = memo(({ open, confirmText, onConfirmTextChange, onClose, onDelete }) => {
  const isConfirmed = confirmText.trim() === CONFIRM_KEYWORD;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // Prevent accidental close by clicking the backdrop — destructive action needs intent
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, #1c1010 0%, #150c0c 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #fff8f8 100%)',
          // Subtle red border to reinforce danger context
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.error.main, 0.20),
          boxShadow: (theme) =>
            `0 24px 64px ${alpha(theme.palette.error.main, 0.14)}, 0 4px 16px rgba(0,0,0,0.18)`,
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          p: 0,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.10)} 0%, ${alpha(theme.palette.error.main, 0.03)} 100%)`,
          borderBottom: '1px solid',
          borderColor: (theme) => alpha(theme.palette.error.main, 0.14),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: { xs: 2.5, sm: 3 } }}>
          {/* Danger icon badge */}
          <Box
            aria-hidden="true"
            sx={{
              width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.error.main, 0.35)}`,
            }}
          >
            <DeleteForever sx={{ color: '#fff', fontSize: 22 }} />
          </Box>

          {/* Title + subtitle */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3,
                color: (theme) => theme.palette.mode === 'dark' ? '#ffdcdc' : theme.palette.error.dark,
              }}
            >
              Delete Account
            </Typography>
            <Typography variant="caption" sx={{
              color: 'text.secondary', fontWeight: 500, letterSpacing: '0.01em',
            }}>
              This action is permanent and cannot be undone
            </Typography>
          </Box>

          {/* Close button */}
          <IconButton
            aria-label="Close delete account dialog"
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary', flexShrink: 0,
              '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.08) },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: 3, pb: 1 }}>

        {/* Warning banner */}
        <Box sx={{
          display: 'flex', gap: 1.5, alignItems: 'flex-start',
          p: 2, mb: 3, borderRadius: 2,
          background: (theme) => alpha(theme.palette.error.main, 0.07),
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.error.main, 0.18),
        }}>
          <WarningAmber
            aria-hidden="true"
            sx={{ color: 'error.main', fontSize: 20, flexShrink: 0, mt: '1px' }}
          />
          <Typography variant="body2" sx={{
            color: (theme) => theme.palette.mode === 'dark' ? '#ffb3b3' : theme.palette.error.dark,
            lineHeight: 1.65, fontSize: '0.875rem',
          }}>
            Deleting your account will permanently remove your <strong>profile</strong>,{' '}
            <strong>resources</strong>, <strong>favorites</strong>, and all{' '}
            <strong>activity history</strong>. There is no recovery option.
          </Typography>
        </Box>

        {/* Confirmation input */}
        <Typography variant="body2" sx={{ mb: 1.25, fontWeight: 600, color: 'text.primary' }}>
          Type{' '}
          <Box
            component="code"
            sx={{
              px: 0.75, py: 0.25, borderRadius: 1,
              fontFamily: 'monospace', fontWeight: 700, fontSize: '0.88rem',
              color: 'error.main',
              background: (theme) => alpha(theme.palette.error.main, 0.09),
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.20),
            }}
          >
            {CONFIRM_KEYWORD}
          </Box>{' '}
          to confirm:
        </Typography>

        <TextField
          fullWidth
          autoComplete="off"
          placeholder={CONFIRM_KEYWORD}
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          inputProps={{ 'aria-label': `Type ${CONFIRM_KEYWORD} to confirm account deletion` }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontWeight: 600,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              // Turn border red when the user is typing but hasn't matched yet
              '& fieldset': {
                borderColor: (theme) =>
                  confirmText.length > 0 && !isConfirmed
                    ? alpha(theme.palette.error.main, 0.45)
                    : undefined,
              },
              // Turn border green once matched
              '&.Mui-focused fieldset, & fieldset': {
                borderColor: (theme) =>
                  isConfirmed ? theme.palette.success.main : undefined,
              },
            },
          }}
        />

        {/* Live feedback under the input */}
        {confirmText.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              display: 'block', mt: 0.75,
              color: isConfirmed ? 'success.main' : 'error.main',
              fontWeight: 600,
            }}
          >
            {isConfirmed ? '✓ Confirmation matched' : `✗ Type exactly: ${CONFIRM_KEYWORD}`}
          </Typography>
        )}
      </DialogContent>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <DialogActions sx={{
        px: { xs: 2.5, sm: 3 }, py: 2.5, gap: 1.5,
        borderTop: '1px solid', borderColor: 'divider',
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 600,
            px: 3, flex: { xs: 1, sm: 'none' },
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={!isConfirmed}
          onClick={onDelete}
          startIcon={<DeleteForever />}
          sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 700,
            px: 3, flex: { xs: 1, sm: 'none' },
            boxShadow: 'none',
            background: (theme) =>
              isConfirmed
                ? `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`
                : undefined,
            '&:hover': {
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.error.main, 0.40)}`,
            },
            '&.Mui-disabled': { opacity: 0.45 },
            transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          Delete My Account
        </Button>
      </DialogActions>
    </Dialog>
  );
});

DeleteAccountDialog.displayName = 'DeleteAccountDialog';

DeleteAccountDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  confirmText: PropTypes.string.isRequired,
  onConfirmTextChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,   // ← was missing entirely in original
};

export default DeleteAccountDialog;