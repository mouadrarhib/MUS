import { Alert as MuiAlert, AlertTitle } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Alert - An alert component for displaying messages
 */
export const Alert = ({
  severity = 'info',
  title,
  children,
  onClose,
  variant = 'standard',
  icon,
  action,
  sx,
  ...props
}) => {
  return (
    <MuiAlert
      severity={severity}
      onClose={onClose}
      variant={variant}
      icon={icon}
      action={action}
      sx={{
        borderRadius: 2,
        ...sx,
      }}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
};

Alert.propTypes = {
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['standard', 'filled', 'outlined']),
  icon: PropTypes.node,
  action: PropTypes.node,
  sx: PropTypes.object,
};

