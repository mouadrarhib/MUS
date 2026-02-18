import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'language';

const translations = {
  en: {
    common: {
      dashboard: 'Dashboard',
      settings: 'Settings',
      cancel: 'Cancel',
      close: 'Close',
      loading: 'Loading...',
    },
    nav: {
      overview: 'Overview',
      myLibrary: 'My Library',
      teaching: 'Teaching',
      myUploads: 'My Uploads',
      admin: 'Admin',
      verifyContent: 'Verify Content',
      users: 'Users',
      resources: 'Resources',
      academicCatalog: 'Academic Catalog',
      wallet: 'Wallet',
      preferences: 'Preferences',
      settings: 'Settings',
    },
    navbar: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    pages: {
      users: { title: 'Users', subtitle: 'Manage all platform users, roles and permissions', add: 'Add User' },
      resources: { title: 'Resources', subtitle: 'Manage educational resources, exams, courses and notes', add: 'Add Resource' },
      library: { title: 'My Library', subtitle: 'View and manage your favorite resources', label: 'Saved' },
      uploads: { title: 'My Uploads', subtitle: 'View and manage the resources you uploaded', add: 'Upload Resource' },
      verify: { title: 'Content Verification', subtitle: 'Review and approve resources submitted by students and teachers', pending: 'Pending' },
      profile: { title: 'Profile', subtitle: 'View your account details and academic information' },
      catalog: {
        title: 'Academic Catalog',
        subtitle: 'Manage institution types, domains, programs, institutions, and their mappings',
        addInstitutionType: 'Add Institution Type',
        addDomain: 'Add Domain',
        addProgram: 'Add Program',
        addInstitution: 'Add Institution',
        tabs: {
          institutionTypes: 'Institution Types',
          domains: 'Domains',
          programs: 'Programs',
          institutions: 'Institutions',
          mapping: 'Institution ↔ Program',
        },
      },
      settings: { title: 'Settings', subtitle: 'Manage your preferences and account settings' },
    },
    settings: {
      languageRegion: {
        title: 'Language & Region',
        subtitle: 'Set your language and regional preferences',
        language: 'Language',
        languageDesc: 'Select your preferred language',
        timezone: 'Timezone',
        timezoneDesc: 'Set your local timezone',
        dateFormat: 'Date Format',
        dateFormatDesc: 'Choose how dates are displayed',
      },
    },
  },
  fr: {
    common: {
      dashboard: 'Tableau de bord',
      settings: 'Parametres',
      cancel: 'Annuler',
      close: 'Fermer',
      loading: 'Chargement...',
    },
    nav: {
      overview: 'Apercu',
      myLibrary: 'Ma bibliotheque',
      teaching: 'Enseignement',
      myUploads: 'Mes depots',
      admin: 'Admin',
      verifyContent: 'Verifier le contenu',
      users: 'Utilisateurs',
      resources: 'Ressources',
      academicCatalog: 'Catalogue academique',
      wallet: 'Portefeuille',
      preferences: 'Preferences',
      settings: 'Parametres',
    },
    navbar: {
      profile: 'Profil',
      settings: 'Parametres',
      logout: 'Deconnexion',
    },
    pages: {
      users: { title: 'Utilisateurs', subtitle: 'Gerez les utilisateurs, roles et permissions', add: 'Ajouter un utilisateur' },
      resources: { title: 'Ressources', subtitle: 'Gerez les ressources educatives, examens, cours et notes', add: 'Ajouter une ressource' },
      library: { title: 'Ma bibliotheque', subtitle: 'Consultez et gerez vos ressources favorites', label: 'Sauvegardees' },
      uploads: { title: 'Mes depots', subtitle: 'Consultez et gerez les ressources que vous avez publiees', add: 'Televerser une ressource' },
      verify: { title: 'Verification du contenu', subtitle: 'Examinez et approuvez les ressources soumises', pending: 'En attente' },
      profile: { title: 'Profil', subtitle: 'Consultez vos informations de compte et academiques' },
      catalog: {
        title: 'Catalogue academique',
        subtitle: 'Gerez les types d institution, domaines, programmes, institutions et leurs liaisons',
        addInstitutionType: 'Ajouter un type d institution',
        addDomain: 'Ajouter un domaine',
        addProgram: 'Ajouter un programme',
        addInstitution: 'Ajouter une institution',
        tabs: {
          institutionTypes: 'Types d institution',
          domains: 'Domaines',
          programs: 'Programmes',
          institutions: 'Institutions',
          mapping: 'Institution ↔ Programme',
        },
      },
      settings: { title: 'Parametres', subtitle: 'Gerez vos preferences et les parametres de votre compte' },
    },
    settings: {
      languageRegion: {
        title: 'Langue et region',
        subtitle: 'Definissez votre langue et vos preferences regionales',
        language: 'Langue',
        languageDesc: 'Selectionnez votre langue preferee',
        timezone: 'Fuseau horaire',
        timezoneDesc: 'Definissez votre fuseau horaire local',
        dateFormat: 'Format de date',
        dateFormatDesc: 'Choisissez le format d affichage des dates',
      },
    },
  },
  ar: {
    common: {
      dashboard: 'لوحة التحكم',
      settings: 'الاعدادات',
      cancel: 'الغاء',
      close: 'اغلاق',
      loading: 'جار التحميل...',
    },
    nav: {
      overview: 'نظرة عامة',
      myLibrary: 'مكتبتي',
      teaching: 'التدريس',
      myUploads: 'مرفوعاتي',
      admin: 'الادارة',
      verifyContent: 'مراجعة المحتوى',
      users: 'المستخدمون',
      resources: 'الموارد',
      academicCatalog: 'الدليل الاكاديمي',
      wallet: 'المحفظة',
      preferences: 'التفضيلات',
      settings: 'الاعدادات',
    },
    navbar: {
      profile: 'الملف الشخصي',
      settings: 'الاعدادات',
      logout: 'تسجيل الخروج',
    },
    pages: {
      users: { title: 'المستخدمون', subtitle: 'ادارة المستخدمين والادوار والصلاحيات', add: 'اضافة مستخدم' },
      resources: { title: 'الموارد', subtitle: 'ادارة الموارد التعليمية والاختبارات والدروس والملاحظات', add: 'اضافة مورد' },
      library: { title: 'مكتبتي', subtitle: 'عرض وادارة الموارد المفضلة لديك', label: 'محفوظة' },
      uploads: { title: 'مرفوعاتي', subtitle: 'عرض وادارة الموارد التي قمت برفعها', add: 'رفع مورد' },
      verify: { title: 'مراجعة المحتوى', subtitle: 'مراجعة واعتماد الموارد المرسلة', pending: 'قيد الانتظار' },
      profile: { title: 'الملف الشخصي', subtitle: 'عرض معلومات الحساب والمعلومات الاكاديمية' },
      catalog: {
        title: 'الدليل الاكاديمي',
        subtitle: 'ادارة انواع المؤسسات والمجالات والبرامج والمؤسسات والربط بينها',
        addInstitutionType: 'اضافة نوع مؤسسة',
        addDomain: 'اضافة مجال',
        addProgram: 'اضافة برنامج',
        addInstitution: 'اضافة مؤسسة',
        tabs: {
          institutionTypes: 'انواع المؤسسات',
          domains: 'المجالات',
          programs: 'البرامج',
          institutions: 'المؤسسات',
          mapping: 'ربط المؤسسة بالبرنامج',
        },
      },
      settings: { title: 'الاعدادات', subtitle: 'ادارة التفضيلات واعدادات الحساب' },
    },
    settings: {
      languageRegion: {
        title: 'اللغة والمنطقة',
        subtitle: 'حدد اللغة والتفضيلات الاقليمية',
        language: 'اللغة',
        languageDesc: 'اختر لغتك المفضلة',
        timezone: 'المنطقة الزمنية',
        timezoneDesc: 'حدد منطقتك الزمنية المحلية',
        dateFormat: 'تنسيق التاريخ',
        dateFormatDesc: 'اختر طريقة عرض التاريخ',
      },
    },
  },
};

const getNestedValue = (obj, key) =>
  key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem(STORAGE_KEY) || 'en');

  const setLanguage = (nextLanguage) => {
    const normalized = ['en', 'fr', 'ar'].includes(nextLanguage) ? nextLanguage : 'en';
    setLanguageState(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  useEffect(() => {
    const isArabic = language === 'ar';
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.body.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
  }, [language]);

  const t = (key, fallback = key) => {
    const localized = getNestedValue(translations[language], key);
    if (localized !== undefined) return localized;
    const english = getNestedValue(translations.en, key);
    return english !== undefined ? english : fallback;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};
