import PropTypes from 'prop-types';
import { Box, Button, Stack, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logo from '@/assets/images/logo.png';

const ResourcePreviewNavLinks = ({ navItems }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box component={RouterLink} to="/discover" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        <Box component="img" src={logo} alt="MUS logo" sx={{ height: 28 }} />
      </Box>

      <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', sm: 'flex' } }}>
        {navItems.map((item) => (
          <Button
            key={item.to}
            component={RouterLink}
            to={item.to}
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: item.active ? 700 : 500,
              fontSize: '0.875rem',
              color: item.active ? 'primary.main' : 'text.secondary',
              bgcolor: (theme) =>
                item.active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              borderRadius: 2,
              px: 1.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};

ResourcePreviewNavLinks.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      active: PropTypes.bool.isRequired,
    })
  ).isRequired,
};

export default ResourcePreviewNavLinks;
