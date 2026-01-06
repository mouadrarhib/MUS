import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import NotFound from '@/pages/NotFound/NotFound';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout/AdminLayout';

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

const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/Admin/Users/Users'));
const AdminCourses = lazy(() => import('@/pages/Admin/Courses/AdminCourses'));
const AdminSettings = lazy(() => import('@/pages/Admin/Settings/AdminSettings'));

export const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          {/* Public routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
