import {
  AccountTree,
  Apartment,
  CalendarMonth,
  Category,
  Hub,
  Layers,
  School,
  Link,
  MenuBook,
} from '@mui/icons-material';

export const TAB_KEYS = {
  HIERARCHY_EXPLORER: 'hierarchyExplorer',
  INSTITUTION_TYPES: 'institutionTypes',
  DOMAINS: 'domains',
  PROGRAMS: 'programs',
  LEVELS: 'levels',
  SEMESTERS: 'semesters',
  MODULES: 'modules',
  INSTITUTIONS: 'institutions',
  MAPPING: 'mapping',
};

export const TAB_META = {
  [TAB_KEYS.HIERARCHY_EXPLORER]: { icon: Hub, color: '#60a5fa', label: 'Hierarchy Explorer' },
  [TAB_KEYS.INSTITUTION_TYPES]: { icon: Category, color: '#7c5cfc', label: 'Institution Types' },
  [TAB_KEYS.DOMAINS]: { icon: AccountTree, color: '#3b82f6', label: 'Domains' },
  [TAB_KEYS.PROGRAMS]: { icon: School, color: '#10b981', label: 'Programs' },
  [TAB_KEYS.LEVELS]: { icon: Layers, color: '#14b8a6', label: 'Levels' },
  [TAB_KEYS.SEMESTERS]: { icon: CalendarMonth, color: '#f97316', label: 'Semesters' },
  [TAB_KEYS.MODULES]: { icon: MenuBook, color: '#eab308', label: 'Modules' },
  [TAB_KEYS.INSTITUTIONS]: { icon: Apartment, color: '#f59e0b', label: 'Institutions' },
  [TAB_KEYS.MAPPING]: { icon: Link, color: '#ec4899', label: 'Mapping' },
};
