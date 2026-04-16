import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/features/auth/context/AuthContext';

export const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredRoles = [],
  blockedRoles = [],
  requireContributor = false,
}) => {
  const { isAuthenticated, loading, hasRole, hasAnyRole, isStudent, canContribute } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (Array.isArray(requiredRoles) && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (Array.isArray(blockedRoles) && blockedRoles.length > 0 && hasAnyRole(blockedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireContributor && isStudent && !canContribute) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
