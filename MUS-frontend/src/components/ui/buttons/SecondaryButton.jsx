import { Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * SecondaryButton - A secondary action button component
 */
export const SecondaryButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  type = 'button',
  sx,
  ...props
}) => {
  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={onClick}
      disabled={disabled || loading}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      type={type}
      sx={{
        ...sx,
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </Button>
  );
};

SecondaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  sx: PropTypes.object,
};

