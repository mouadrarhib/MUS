import PropTypes from 'prop-types';
import { alpha, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { AsyncButton } from '@/shared/components/ui';

const TagDeleteDialog = ({ open, deleteTarget, deleting, onClose, onConfirm, t }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth keepMounted transitionDuration={{ enter: 120, exit: 80 }}>
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
            }}
          >
            <WarningIcon sx={{ color: 'error.main', fontSize: 22 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Delete Tag
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          This action cannot be undone. Any existing resource links will lose this tag.
        </Typography>
        {deleteTarget ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {deleteTarget.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {deleteTarget.slug}
            </Typography>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={deleting} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {t('common.cancel')}
        </Button>
        <AsyncButton onClick={onConfirm} loading={deleting} variant="contained" color="error" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Delete Tag
        </AsyncButton>
      </DialogActions>
    </Dialog>
  );
};

TagDeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  deleteTarget: PropTypes.object,
  deleting: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default TagDeleteDialog;
