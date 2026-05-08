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
const ResourcePreviewPage = lazy(() => import('@/features/discover/pages/ResourcePreview'));
const RecommendationsPage = lazy(() => import('@/features/dashboard/pages/Recommendations'));
const CreatorGuidePage = lazy(() => import('@/features/discover/pages/CreatorGuide'));
const DiscoverTutorsPage = lazy(() => import('@/features/discover/pages/DiscoverTutors'));
const TutorProfileBookingPage = lazy(() => import('@/features/discover/pages/TutorProfileBooking'));
const UsersPage = lazy(() => import('@/features/users/pages/Users'));
const PointsManagementPage = lazy(() => import('@/features/points/pages/PointsManagement'));
const ResourcesPage = lazy(() => import('@/features/resources/pages/Resources'));
const LibraryPage = lazy(() => import('@/features/library/pages/Library'));
const MyUploadsPage = lazy(() => import('@/features/uploads/pages/MyUploads'));
const ProfilePage = lazy(() => import('@/features/profile/pages/Profile'));
const SettingsPage = lazy(() => import('@/features/settings/pages/Settings'));
const VerifyResourcesPage = lazy(() => import('@/features/verify/pages/VerifyResources'));
const CatalogManagementPage = lazy(() => import('@/features/catalog/pages/CatalogManagement'));
const WalletPage = lazy(() => import('@/features/wallet/pages/Wallet'));
const TagsPage = lazy(() => import('@/features/tags/pages/Tags'));
const ConfusionCasesPage = lazy(() => import('@/features/confusion/pages/ConfusionCases'));
const SessionsPage = lazy(() => import('@/features/sessions/pages/Sessions'));

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

        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <DiscoverResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover/how-to-become-creator"
          element={
            <ProtectedRoute>
              <CreatorGuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover/tutors"
          element={
            <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER']} blockedRoles={['ADMIN']}>
              <DiscoverTutorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover/tutors/:tutorId"
          element={
            <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER']} blockedRoles={['ADMIN']}>
              <TutorProfileBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover/resources/:id/preview"
          element={
            <ProtectedRoute>
              <ResourcePreviewPage />
            </ProtectedRoute>
          }
        />
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

          <Route
            path="points"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <PointsManagementPage />
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
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER']} blockedRoles={['ADMIN']}>
                <LibraryPage />
              </ProtectedRoute>
            }
          />

          {/* My Uploads Page */}
          <Route
            path="uploads"
            element={
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER', 'ADMIN']} requireContributor>
                <MyUploadsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="wallet"
            element={
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER']} blockedRoles={['ADMIN']}>
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

          <Route
            path="tags"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <TagsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="confusion"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'TEACHER']}>
                <ConfusionCasesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="sessions"
            element={
              <ProtectedRoute requiredRoles={['STUDENT', 'TEACHER']} blockedRoles={['ADMIN']}>
                <SessionsPage />
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
