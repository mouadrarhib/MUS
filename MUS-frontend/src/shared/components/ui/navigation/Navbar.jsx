import {
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';

/**
 * Navbar - A reusable navigation bar component
 */
export const Navbar = () => {
  return (
    <AppBar
      position="fixed"
      elevation={1}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
          }}
        >
          MUS Platform
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

