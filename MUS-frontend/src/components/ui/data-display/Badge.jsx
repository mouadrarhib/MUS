import { Badge as MuiBadge } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Badge - A badge component for notifications and counts
 */
export const Badge = ({
  children,
  badgeContent,
  showZero = false,
  max = 99,
  color = 'error',
  variant = 'standard',
  overlap = 'rectangular',
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  sx,
  ...props
}) => {
  return (
    <MuiBadge
      badgeContent={badgeContent}
      showZero={showZero}
      max={max}
      color={color}
      variant={variant}
      overlap={overlap}
      anchorOrigin={anchorOrigin}
      sx={{
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiBadge>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  badgeContent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showZero: PropTypes.bool,
  max: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  variant: PropTypes.oneOf(['standard', 'dot']),
  overlap: PropTypes.oneOf(['rectangular', 'circular']),
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(['top', 'bottom']),
    horizontal: PropTypes.oneOf(['left', 'right']),
  }),
  sx: PropTypes.object,
};

