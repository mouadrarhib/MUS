import { Divider as MuiDivider } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Divider - A divider component
 */
export const Divider = ({
  orientation = 'horizontal',
  variant = 'fullWidth',
  textAlign = 'center',
  children,
  sx,
  ...props
}) => {
  return (
    <MuiDivider
      orientation={orientation}
      variant={variant}
      textAlign={textAlign}
      sx={{
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiDivider>
  );
};

Divider.propTypes = {
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['fullWidth', 'inset', 'middle']),
  textAlign: PropTypes.oneOf(['left', 'center', 'right']),
  children: PropTypes.node,
  sx: PropTypes.object,
};

