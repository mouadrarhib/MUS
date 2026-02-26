import React from 'react';
import { Button, CircularProgress, IconButton as MuiIconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

export const AsyncButton = ({
  children,
  loading = false,
  loadingText = 'Processing...',
  disabled = false,
  startIcon,
  loadingIndicatorSize = 16,
  ...props
}) => (
  <Button
    disabled={disabled || loading}
    startIcon={loading ? <CircularProgress size={loadingIndicatorSize} color="inherit" /> : startIcon}
    {...props}
  >
    {loading ? loadingText : children}
  </Button>
);

AsyncButton.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  disabled: PropTypes.bool,
  startIcon: PropTypes.node,
  loadingIndicatorSize: PropTypes.number,
};

export const PrimaryButton = ({ children, loading, disabled, startIcon, ...props }) => (
  <Button
    variant="contained"
    color="primary"
    disabled={disabled || loading}
    startIcon={!loading ? startIcon : null}
    {...props}
  >
    {loading ? <CircularProgress size={24} color="inherit" /> : children}
  </Button>
);

PrimaryButton.propTypes = {
  children: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  startIcon: PropTypes.node,
};



export const OutlinedButton = ({ children, ...props }) => (
  <Button variant="outlined" {...props}>
    {children}
  </Button>
);



export const IconButton = ({ children, tooltip, ...props }) => {
  const button = (
    <MuiIconButton {...props}>
      {children}
    </MuiIconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {button}
      </Tooltip>
    );
  }

  return button;
};

IconButton.propTypes = {
  children: PropTypes.node,
  tooltip: PropTypes.string,
};
