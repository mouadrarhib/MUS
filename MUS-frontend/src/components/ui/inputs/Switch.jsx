import { FormControlLabel, Switch as MuiSwitch, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Switch - A switch/toggle component
 */
export const Switch = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  color = 'primary',
  labelPlacement = 'end',
  sx,
  ...props
}) => {
  return (
    <>
      <FormControlLabel
        control={
          <MuiSwitch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            color={color}
            sx={{
              ...sx,
            }}
            {...props}
          />
        }
        label={label}
        labelPlacement={labelPlacement}
      />
      {helperText && (
        <FormHelperText error={error} sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </>
  );
};

Switch.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  labelPlacement: PropTypes.oneOf(['end', 'start', 'top', 'bottom']),
  sx: PropTypes.object,
};

