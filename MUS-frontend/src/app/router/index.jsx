import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ProtectedRoute } from '@/features/auth/components';

// Lazy load Auth Pages
const Login = lazy(() => import('@/pages/auth/LoginPage'));
const Register = lazy(() => import('@/pages/auth/RegisterPage'));
const PublicHome = lazy(() => import('@/pages/PublicHome'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy load Dashboard Layout (You must create this file!)
const DashboardLayout = lazy(() => import('@/layouts/DashboardLayout'));

// Lazy load Dashboard Pages
// (Make sure to create src/features/dashboard/pages/Overview.jsx)
const DashboardOverview = lazy(() => import('@/features/dashboard/pages/Overview'));
const DiscoverResourcesPage = lazy(() => import('@/features/dashboard/pages/DiscoverResources'));
const ResourcePreviewPage = lazy(() => import('@/features/discover/pages/ResourcePreviewPage'));
const UsersPage = lazy(() => import('@/features/users/pages/Users'));
const ResourcesPage = lazy(() => import('@/features/resources/pages/Resources'));
const LibraryPage = lazy(() => import('@/features/library/pages/Library'));
const MyUploadsPage = lazy(() => import('@/features/uploads/pages/MyUploads'));
const ProfilePage = lazy(() => import('@/features/profile/pages/Profile'));
const SettingsPage = lazy(() => import('@/features/settings/pages/Settings'));
const VerifyResourcesPage = lazy(() => import('@/features/verify/pages/VerifyResources'));
const CatalogManagementPage = lazy(() => import('@/features/catalog/pages/CatalogManagement'));
const WalletPage = lazy(() => import('@/features/wallet/pages/Wallet'));

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
        <Route path="/" element={<PublicHome />} />

        {/* 2. Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/discover" element={<DiscoverResourcesPage />} />
        <Route path="/discover/resources/:id/preview" element={<ResourcePreviewPage />} />

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

          {/* Users Management Page */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Resources Management Page */}
          <Route
            path="resources"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Library / Favorites Page */}
          <Route
            path="library"
            element={
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                <LibraryPage />
              </ProtectedRoute>
            }
          />

          {/* My Uploads Page */}
          <Route
            path="uploads"
            element={
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                <MyUploadsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="wallet"
            element={
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                <WalletPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Page */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Settings Page */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Verify Content Page - Admin Only */}
          <Route
            path="verify"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <VerifyResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Academic Catalog - Admin Only */}
          <Route
            path="catalog"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <CatalogManagementPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 4. Catch-all 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
