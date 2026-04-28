// src/features/tags/components/TagActionButton.jsx
import { memo } from 'react';
import PropTypes from 'prop-types';
import { alpha, IconButton, Tooltip } from '@mui/material';

/**
 * A small icon button with a coloured border + background tint.
 * Used in the Tags table for edit / delete actions.
 */
const TagActionButton = memo(({ icon: Icon, label, color = 'primary', size = 'small', onClick }) => (
  <Tooltip title={label} placement="top" arrow>
    <IconButton
      size={size}
      onClick={onClick}
      aria-label={label}
      sx={(t) => ({
        borderRadius: '8px',
        border: '1px solid',
        borderColor: alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.22),
        bgcolor:     alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.05),
        color:       `${color}.main`,
        transition:  'all 0.16s ease',
        '&:hover': {
          borderColor: alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.5),
          bgcolor:     alpha(t.palette[color]?.main ?? t.palette.primary.main, 0.12),
          transform:   'translateY(-1px)',
        },
        '&:active': { transform: 'translateY(0)' },
      })}
    >
      <Icon sx={{ fontSize: size === 'small' ? 16 : 18 }} />
    </IconButton>
  </Tooltip>
));

TagActionButton.displayName = 'TagActionButton';

TagActionButton.propTypes = {
  icon:    PropTypes.elementType.isRequired,
  label:   PropTypes.string.isRequired,
  color:   PropTypes.string,
  size:    PropTypes.oneOf(['small', 'medium']),
  onClick: PropTypes.func.isRequired,
};

export default TagActionButton;