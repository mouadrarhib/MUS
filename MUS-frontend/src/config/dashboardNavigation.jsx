import { 
  Dashboard, 
  School, 
  UploadFile, 
  AccountBalanceWallet, 
  AdminPanelSettings,
  Group,
  Description
} from '@mui/icons-material';

export const DASHBOARD_NAVIGATION = [
  // COMMON
  {
    label: 'Overview',
    path: '/dashboard',
    icon: <Dashboard />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'] 
  },

  // STUDENT
  { type: 'section', label: 'Learning', roles: ['STUDENT'] },
  {
    label: 'My Library',
    path: '/dashboard/library',
    icon: <School />,
    roles: ['STUDENT']
  },

  // TEACHER
  { type: 'section', label: 'Teaching', roles: ['TEACHER'] },
  {
    label: 'My Uploads',
    path: '/dashboard/uploads',
    icon: <UploadFile />,
    roles: ['TEACHER']
  },

  // ADMIN
  { type: 'section', label: 'Admin', roles: ['ADMIN'] },
  {
    label: 'Verify Content',
    path: '/dashboard/verify',
    icon: <AdminPanelSettings />,
    roles: ['ADMIN']
  },
  {
    label: 'Users',
    path: '/dashboard/users',
    icon: <Group />
  },
  {
    label: 'Resources',
    path: '/dashboard/resources',
    icon: <Description />
  },

  // SHARED
  {
    label: 'Wallet',
    path: '/dashboard/wallet',
    icon: <AccountBalanceWallet />,
    roles: ['STUDENT', 'TEACHER']
  },
];