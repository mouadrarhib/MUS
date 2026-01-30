import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  LibraryBooks as LibraryBooksIcon,
  Category as CategoryIcon,
  Announcement as AnnouncementIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Configuration des liens de navigation du sidebar
const navigationConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Gestion',
    items: [
      {
        title: 'Ressources',
        path: '/dashboard/resources',
        icon: <LibraryBooksIcon />,
      },
      {
        title: 'Utilisateurs',
        path: '/dashboard/users',
        icon: <PeopleIcon />,
      },
      {
        title: 'Modérations',
        path: '/dashboard/moderations',
        icon: <VerifiedUserIcon />,
        badge: 5, // Nombre de modérations en attente
      },
      {
        title: 'Catégories',
        path: '/dashboard/categories',
        icon: <CategoryIcon />,
      },
    ],
  },
  {
    title: 'Analyse',
    items: [
      {
        title: 'Statistiques',
        path: '/dashboard/statistics',
        icon: <AssessmentIcon />,
      },
      {
        title: 'Tendances',
        path: '/dashboard/trends',
        icon: <TrendingUpIcon />,
      },
    ],
  },
  {
    title: 'Système',
    items: [
      {
        title: 'Annonces',
        path: '/dashboard/announcements',
        icon: <AnnouncementIcon />,
      },
      {
        title: 'Paramètres',
        path: '/dashboard/settings',
        icon: <SettingsIcon />,
      },
    ],
  },
];

export default navigationConfig;
