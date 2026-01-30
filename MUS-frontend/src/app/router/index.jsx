import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ProtectedRoute } from '@/features/auth/components';
import { DashboardLayout } from '@/layouts';

// Lazy loading des pages
const Login = lazy(() => import('@/pages/auth/LoginPage'));
const Register = lazy(() => import('@/pages/auth/RegisterPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Dashboard pages
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/admin/UserPage'));
// const ResourcesManagementPage = lazy(() => import('@/pages/admin/ResourcesManagementPage'));
// const ModerationsPage = lazy(() => import('@/pages/admin/ModerationsPage'));
// const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
// const StatisticsPage = lazy(() => import('@/pages/admin/StatisticsPage'));
// const TrendsPage = lazy(() => import('@/pages/admin/TrendsPage'));
// const AnnouncementsPage = lazy(() => import('@/pages/admin/AnnouncementsPage'));
// const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));
// const ProfilePage = lazy(() => import('@/pages/admin/ProfilePage'));

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
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Routes d'authentification */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées avec DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          {/* <Route path="resources" element={<ResourcesManagementPage />} />
          <Route path="moderations" element={<ModerationsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="trends" element={<TrendsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} /> */}
        </Route>

        {/* Route 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
