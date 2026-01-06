import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, Notifications, AccountCircle } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Navbar - A reusable navigation bar component
 */
export const Navbar = ({
  title,
  onMenuClick,
  showMenuButton = false,
  rightActions,
  logo,
  elevation = 1,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      position="fixed"
      elevation={elevation}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ...sx,
      }}
      {...props}
    >
      <Toolbar>
        {showMenuButton && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {logo && (
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              height: 40,
              mr: 2,
              display: { xs: 'none', sm: 'block' },
            }}
          />
        )}

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: { xs: 1, md: 0 },
            fontWeight: 700,
            mr: { md: 4 },
          }}
        >
          {title}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {rightActions && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {rightActions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  onMenuClick: PropTypes.func,
  showMenuButton: PropTypes.bool,
  rightActions: PropTypes.node,
  logo: PropTypes.string,
  elevation: PropTypes.number,
  sx: PropTypes.object,
};

