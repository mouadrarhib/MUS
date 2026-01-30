import { FormControlLabel, Checkbox as MuiCheckbox, FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Checkbox - A checkbox input component
 */
export const Checkbox = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  size = 'medium',
  color = 'primary',
  sx,
  ...props
}) => {
  return (
    <>
      <FormControlLabel
        control={
          <MuiCheckbox
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            size={size}
            color={color}
            sx={{
              ...sx,
            }}
            {...props}
          />
        }
        label={label}
      />
      {helperText && (
        <FormHelperText error={error} sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  sx: PropTypes.object,
};

