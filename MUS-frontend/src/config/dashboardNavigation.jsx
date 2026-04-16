import { 
  Dashboard, 
  School, 
  UploadFile, 
  AccountBalanceWallet, 
  Paid,
  AdminPanelSettings,
  Description,
  LocalOffer,
  People,
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
    roles: ['STUDENT', 'TEACHER'],
    excludeRoles: ['ADMIN']
  },

  // UPLOADS
  { type: 'section', labelKey: 'nav.teaching', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
  {
    labelKey: 'nav.myUploads',
    path: '/dashboard/uploads',
    icon: <UploadFile />,
    roles: ['STUDENT', 'TEACHER', 'ADMIN'],
    requiresContributor: true,
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
    icon: <People />,
    roles: ['ADMIN']
  },
  {
    labelKey: 'nav.pointsManagement',
    path: '/dashboard/points',
    icon: <Paid />,
    roles: ['ADMIN']
  },
  {
    labelKey: 'nav.resources',
    path: '/dashboard/resources',
    icon: <Description />,
    roles: ['ADMIN']
  },
  {
    labelKey: 'nav.tags',
    path: '/dashboard/tags',
    icon: <LocalOffer />,
    roles: ['ADMIN']
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
  { type: 'section', labelKey: 'nav.preferences', roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  {
    labelKey: 'nav.settings',
    path: '/dashboard/settings',
    icon: <Settings />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT']
  },
];
