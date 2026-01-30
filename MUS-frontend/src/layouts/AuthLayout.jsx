import { Outlet, Navigate } from 'react-router-dom';
import { Box, Container, useTheme, alpha } from '@mui/material';
import { useAuth } from '@/features/auth/context/AuthContext';

const AuthLayout = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  // Si l'utilisateur est déjà authentifié, le rediriger vers le dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 6, md: 8 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;
