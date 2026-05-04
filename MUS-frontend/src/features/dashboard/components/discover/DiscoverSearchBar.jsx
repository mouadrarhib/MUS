import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { panelSx } from './panelSx';

const CONTAINER_SX = (theme) => ({
  ...panelSx(theme),
  mb: 3, p: 1, display: 'flex', alignItems: 'center', gap: 0.5,
});

const DiscoverSearchBar = ({ searchQuery, onSearchChange, onClear }) => {
  return (
    <Box sx={CONTAINER_SX}>
      <Search sx={{ ml: 0.75, color: 'text.secondary', fontSize: 20 }} />
      <InputBase
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search resources, authors, universities, or modules"
        sx={{ flex: 1, fontSize: '0.95rem', px: 0.8, color: 'text.primary' }}
      />
      {searchQuery ? (
        <IconButton size="small" onClick={onClear} sx={{ mr: 0.5 }}>
          <Close fontSize="small" />
        </IconButton>
      ) : null}
    </Box>
  );
};

DiscoverSearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default DiscoverSearchBar;
