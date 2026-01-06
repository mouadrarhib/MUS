import { lazy } from 'react';
import AdminLayout from '@/layouts/AdminLayout/AdminLayout';
import NotFound from '@/pages/NotFound/NotFound';
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/Admin/Users/Users'));
const AdminCourses = lazy(() => import('@/pages/Admin/Courses/AdminCourses'));
const AdminSettings = lazy(() => import('@/pages/Admin/Settings/AdminSettings'));

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
    path: '*',
    element: <Navigate to="/login" replace />,
  },
];

export const allRoutes = [...authRoutes, ...adminRoutes, ...publicRoutes];
