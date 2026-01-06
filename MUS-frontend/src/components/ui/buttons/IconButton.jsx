import { IconButton as MuiIconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * IconButton - An icon button component with optional tooltip
 */
export const IconButton = ({
  children,
  onClick,
  disabled = false,
  size = 'medium',
  color = 'default',
  tooltip,
  tooltipPlacement = 'top',
  sx,
  ...props
}) => {
  const button = (
    <MuiIconButton
      onClick={onClick}
      disabled={disabled}
      size={size}
      color={color}
      sx={{
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiIconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

IconButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success', 'inherit']),
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  sx: PropTypes.object,
};

