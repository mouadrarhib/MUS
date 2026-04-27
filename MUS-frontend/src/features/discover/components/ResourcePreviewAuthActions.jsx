import PropTypes from 'prop-types';
import { Button, Stack, alpha } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const ResourcePreviewAuthActions = ({ isAuthenticated, onLogout }) => {
  if (isAuthenticated) {
    return (
      <Stack direction="row" spacing={1}>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2 }}
        >
          Dashboard
        </Button>
        <Button
          onClick={onLogout}
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2,
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            color: 'text.primary',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
            },
          }}
        >
          Logout
        </Button>
      </Stack>
    );
  }

  return (
    <Button
      component={RouterLink}
      to="/login"
      variant="contained"
      size="small"
      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2 }}
    >
      Sign in
    </Button>
  );
};

ResourcePreviewAuthActions.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default ResourcePreviewAuthActions;
