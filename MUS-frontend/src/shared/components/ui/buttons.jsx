import React from 'react';
import { Button, CircularProgress, IconButton as MuiIconButton, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

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

export const SecondaryButton = ({ children, ...props }) => (
  <Button variant="contained" color="secondary" {...props}>
    {children}
  </Button>
);

export const OutlinedButton = ({ children, ...props }) => (
  <Button variant="outlined" {...props}>
    {children}
  </Button>
);

export const TextButton = ({ children, ...props }) => (
  <Button variant="text" {...props}>
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