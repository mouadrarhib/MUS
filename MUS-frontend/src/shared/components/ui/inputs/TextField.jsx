import { TextField as MuiTextField, InputAdornment } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * TextField - An enhanced text input component
 */
export const TextField = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  type = 'text',
  placeholder,
  startAdornment,
  endAdornment,
  size = 'medium',
  variant = 'outlined',
  sx,
  ...props
}) => {
  return (
    <MuiTextField
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      type={type}
      placeholder={placeholder}
      size={size}
      variant={variant}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : null,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : null,
      }}
      sx={{
        ...sx,
      }}
      {...props}
    />
  );
};

TextField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  sx: PropTypes.object,
};

