import { 
  Dashboard, 
  School, 
  UploadFile, 
  AccountBalanceWallet, 
  AdminPanelSettings,
  Group,
  Description,
  Settings,
  AccountTree
} from '@mui/icons-material';

export const DASHBOARD_NAVIGATION = [
  // COMMON
  {
    labelKey: 'nav.overview',
    path: '/dashboard',
    icon: <Dashboard />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'] 
  },

  // STUDENT
  {
    labelKey: 'nav.myLibrary',
    path: '/dashboard/library',
    icon: <School />,
    roles: ['STUDENT']
  },

  // TEACHER
  { type: 'section', labelKey: 'nav.teaching', roles: ['TEACHER'] },
  {
    labelKey: 'nav.myUploads',
    path: '/dashboard/uploads',
    icon: <UploadFile />,
    roles: ['TEACHER']
  },

  // ADMIN
  { type: 'section', labelKey: 'nav.admin', roles: ['ADMIN'] },
  {
    labelKey: 'nav.verifyContent',
    path: '/dashboard/verify',
    icon: <AdminPanelSettings />,
    roles: ['ADMIN']
  },
  {
    labelKey: 'nav.users',
    path: '/dashboard/users',
    icon: <Group />
  },
  {
    labelKey: 'nav.resources',
    path: '/dashboard/resources',
    icon: <Description />
  },
  {
    labelKey: 'nav.academicCatalog',
    path: '/dashboard/catalog',
    icon: <AccountTree />,
    roles: ['ADMIN']
  },

  // SHARED
  {
    labelKey: 'nav.wallet',
    path: '/dashboard/wallet',
    icon: <AccountBalanceWallet />,
    roles: ['STUDENT', 'TEACHER']
  },

  // SETTINGS - Available to all
  { type: 'section', labelKey: 'nav.preferences' },
  {
    labelKey: 'nav.settings',
    path: '/dashboard/settings',
    icon: <Settings />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT']
  },
];
