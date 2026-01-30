import { Button } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * PrimaryButton - A primary action button component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.size - Button size ('small' | 'medium' | 'large')
 * @param {string} props.fullWidth - Full width button
 * @param {string} props.startIcon - Icon at the start
 * @param {string} props.endIcon - Icon at the end
 * @param {string} props.type - Button type ('button' | 'submit' | 'reset')
 */
export const PrimaryButton = ({
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
      variant="contained"
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

PrimaryButton.propTypes = {
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

