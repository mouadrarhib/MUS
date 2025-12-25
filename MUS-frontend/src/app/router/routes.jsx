import { lazy } from 'react';
import AdminLayout from '@/layouts/AdminLayout/AdminLayout';
import NotFound from '@/pages/NotFound/NotFound';
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/Users/Users'));
const AdminCourses = lazy(() => import('@/pages/admin/Courses/AdminCourses'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings/AdminSettings'));

export const authRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
];

export const adminRoutes = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'courses',
        element: <AdminCourses />,
      },
      {
        path: 'settings',
        element: <AdminSettings />,
      },
    ],
  },
];

export const publicRoutes = [
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export const allRoutes = [...authRoutes, ...adminRoutes, ...publicRoutes];
