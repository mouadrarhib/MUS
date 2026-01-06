import { Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * TextButton - A text button component
 */
export const TextButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  type = 'button',
  color = 'primary',
  sx,
  ...props
}) => {
  return (
    <Button
      variant="text"
      color={color}
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

TextButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'inherit']),
  sx: PropTypes.object,
};

