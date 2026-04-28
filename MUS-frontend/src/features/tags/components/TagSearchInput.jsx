// src/features/tags/components/TagSearchInput.jsx
import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { InputAdornment, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

/**
 * Debounced search field. Local state updates immediately; the `onChange`
 * callback fires 300 ms after the user stops typing.
 */
const TagSearchInput = memo(({ value, onChange, label = 'Search tags…', placeholder = 'Type a name or slug…' }) => {
  const [local, setLocal] = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <TextField
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      label={label}
      placeholder={placeholder}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search sx={{ fontSize: 17, color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        minWidth: 220,
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          fontSize: '0.875rem',
          transition: 'box-shadow 0.15s ease',
          '&.Mui-focused': {
            boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}1f`,
          },
        },
      }}
    />
  );
});

TagSearchInput.displayName = 'TagSearchInput';

TagSearchInput.propTypes = {
  value:       PropTypes.string.isRequired,
  onChange:    PropTypes.func.isRequired,
  label:       PropTypes.string,
  placeholder: PropTypes.string,
};

export default TagSearchInput;