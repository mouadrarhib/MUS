import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ProtectedRoute } from '@/features/auth/components';

// Lazy load Auth Pages
const Login = lazy(() => import('@/pages/auth/LoginPage'));
const Register = lazy(() => import('@/pages/auth/RegisterPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy load Dashboard Layout (You must create this file!)
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));

// Lazy load Dashboard Pages
// (Make sure to create src/features/dashboard/pages/Overview.jsx)
const DashboardOverview = lazy(() => import('@/features/dashboard/pages/Overview'));

const LoadingFallback = () => (
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

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 1. Redirect root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 3. Protected Dashboard Routes (The New Structure) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default Page: Overview */}
          <Route index element={<DashboardOverview />} />
          
          {/* Add future pages here, e.g.: */}
          {/* <Route path="library" element={<LibraryPage />} /> */}
        </Route>

        {/* 4. Catch-all 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;