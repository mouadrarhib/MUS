import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { Close, Delete, Warning } from '@mui/icons-material';
import PropTypes from 'prop-types';

const DeleteAccountDialog = ({ open, confirmText, onConfirmTextChange, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: 'hidden' },
      }}
    
      keepMounted
      transitionDuration={{ enter: 120, exit: 80 }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
              }}
            >
              <Warning sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Delete Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'text.secondary',
            bgcolor: (theme) => alpha(theme.palette.action.active, 0.04),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.08),
            },
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
          }}
        >
          <Typography variant="body2" color="error.main" fontWeight={500}>
            Warning: Deleting your account will permanently remove all your data, including your profile, resources, and activity history. This action cannot be reversed.
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To confirm deletion, please type <strong>DELETE</strong> below:
        </Typography>

        <TextField
          fullWidth
          placeholder="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.action.active, 0.02),
          gap: 1.5,
        }}
      >
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={confirmText !== 'DELETE'}
          startIcon={<Delete sx={{ fontSize: 18 }} />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            px: 3,
            '&:hover': { boxShadow: 'none' },
          }}
        >
          Delete My Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteAccountDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  confirmText: PropTypes.string.isRequired,
  onConfirmTextChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DeleteAccountDialog;
