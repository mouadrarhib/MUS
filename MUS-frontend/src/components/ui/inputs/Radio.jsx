import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio as MuiRadio,
  FormHelperText,
} from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Radio - A radio button group component
 */
export const Radio = ({
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  disabled = false,
  required = false,
  row = false,
  color = 'primary',
  sx,
  ...props
}) => {
  return (
    <FormControl
      error={error}
      required={required}
      disabled={disabled}
      sx={{
        ...sx,
      }}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup value={value} onChange={onChange} row={row} {...props}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<MuiRadio color={color} />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

Radio.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  row: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success', 'default']),
  sx: PropTypes.object,
};

