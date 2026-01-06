import { TextField } from './TextField';
import PropTypes from 'prop-types';

/**
 * TextArea - A multi-line text input component
 */
export const TextArea = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder,
  rows = 4,
  minRows,
  maxRows,
  sx,
  ...props
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder={placeholder}
      multiline
      rows={rows}
      minRows={minRows}
      maxRows={maxRows}
      sx={{
        ...sx,
      }}
      {...props}
    />
  );
};

TextArea.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  minRows: PropTypes.number,
  maxRows: PropTypes.number,
  sx: PropTypes.object,
};

