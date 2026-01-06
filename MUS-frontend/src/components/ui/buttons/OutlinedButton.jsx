import { Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * OutlinedButton - An outlined button component
 */
export const OutlinedButton = ({
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
      variant="outlined"
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

OutlinedButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  sx: PropTypes.object,
};

