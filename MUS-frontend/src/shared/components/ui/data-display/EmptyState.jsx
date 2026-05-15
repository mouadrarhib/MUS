import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: (t) => `${t.shape.xl}px`,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        textAlign: 'center',
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => theme.palette.action.hover,
            color: 'text.secondary',
            mb: 2,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Box>
      )}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {actionLabel && (
            <Button
              variant="contained"
              onClick={onAction}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outlined"
              onClick={onSecondaryAction}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,
};

export { EmptyState };
