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
      pointsManagement: 'Points Management',
      resources: 'Resources',
      tags: 'Tags',
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
      tags: { title: 'Tags', subtitle: 'Manage discovery tags used across resources and personalization' },
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
    publicHome: {
      header: {
        signIn: 'Sign in',
        nav: {
          university: 'University',
          resources: 'Resources',
        },
      },
      hero: {
        title: 'Grow smarter together',
        subtitle: 'Find top-rated study notes from students taking the same courses as you.',
        searchPlaceholder: 'Search for courses, quizzes, or documents',
        register: 'Register',
        signIn: 'Sign in',
        authRequired: {
          title: 'Sign in required',
          description: 'To search and access resources, please sign in first. You can also create a new account.',
        },
      },
      role: {
        eyebrow: 'Platform Mission',
        title: 'A single academic workspace for students, teachers, and university communities',
        description:
          'MUS helps learners find reliable resources, prepare effectively for exams, coordinate university clubs and events, access structured academic notes, and maintain clear communication with teachers.',
        pillars: {
          resources: {
            title: 'Access verified academic resources',
            description:
              'Discover organized notes, summaries, and course documents contributed across faculties and filtered by academic context.',
          },
          exams: {
            title: 'Strengthen exam preparation',
            description:
              'Use structured revision flows, practice quizzes, and exam-focused study plans to prepare with confidence.',
          },
          clubs: {
            title: 'Coordinate clubs and events',
            description:
              'Support university clubs with better planning, event communication, and centralized updates for student participation.',
          },
          educators: {
            title: 'Stay connected with educators',
            description:
              'Facilitate clear information flow between students and teachers through shared resources, announcements, and academic guidance.',
          },
        },
      },
      stats: {
        title: 'Over 1 billion students helped, and counting',
        subtitle: "50K new study notes added every day, from the world's most active student communities",
        items: {
          resources: { title: 'Study resources', chip: '1 new each second' },
          institutions: { title: 'Institutions', chip: 'In 100+ countries' },
          users: { title: 'Users', chip: 'Active every month' },
        },
      },
      footer: {
        description: 'MUS helps university communities discover trusted resources, learn faster, and collaborate with clarity.',
        copyright: '© 2026 MUS. All rights reserved.',
        links: {
          discover: 'Discover',
          signIn: 'Sign in',
          register: 'Register',
        },
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
      pointsManagement: 'Gestion des points',
      resources: 'Ressources',
      tags: 'Etiquettes',
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
      tags: { title: 'Etiquettes', subtitle: 'Gerez les etiquettes de decouverte utilisees pour les ressources et la personnalisation' },
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
    publicHome: {
      header: {
        signIn: 'Se connecter',
        nav: {
          university: 'Universite',
          resources: 'Ressources',
        },
      },
      hero: {
        title: 'Progresser ensemble avec intelligence',
        subtitle: 'Trouvez des notes de cours de haute qualite partagees par des etudiants suivant les memes modules que vous.',
        searchPlaceholder: 'Rechercher des cours, quiz ou documents',
        register: "S'inscrire",
        signIn: 'Se connecter',
        authRequired: {
          title: 'Connexion requise',
          description: 'Pour rechercher et acceder aux ressources, veuillez vous connecter. Vous pouvez aussi creer un compte.',
        },
      },
      role: {
        eyebrow: 'Mission de la plateforme',
        title: 'Un espace academique unique pour les etudiants, les enseignants et les communautes universitaires',
        description:
          'MUS aide les apprenants a trouver des ressources fiables, mieux preparer les examens, organiser les clubs et evenements universitaires, acceder a des notes structurees et garder une communication claire avec les enseignants.',
        pillars: {
          resources: {
            title: 'Acceder a des ressources academiques verifiees',
            description:
              'Decouvrez des notes, resumes et documents de cours structures selon le contexte academique.',
          },
          exams: {
            title: 'Renforcer la preparation aux examens',
            description:
              'Utilisez des parcours de revision structures, des quiz pratiques et des plans de preparation axes sur les examens.',
          },
          clubs: {
            title: 'Coordonner les clubs et evenements',
            description:
              'Aidez les clubs universitaires avec une meilleure planification, communication des evenements et suivi centralise.',
          },
          educators: {
            title: 'Rester connecte aux enseignants',
            description:
              'Facilitez un flux d information clair entre etudiants et enseignants via ressources partagees et annonces academiques.',
          },
        },
      },
      stats: {
        title: 'Plus d un milliard d etudiants accompagnes',
        subtitle: '50K nouvelles notes ajoutees chaque jour par des communautes etudiantes tres actives',
        items: {
          resources: { title: 'Ressources d etude', chip: '1 nouvelle chaque seconde' },
          institutions: { title: 'Institutions', chip: 'Dans plus de 100 pays' },
          users: { title: 'Utilisateurs', chip: 'Actifs chaque mois' },
        },
      },
      footer: {
        description: 'MUS aide les communautes universitaires a trouver des ressources fiables, apprendre plus vite et collaborer clairement.',
        copyright: '© 2026 MUS. Tous droits reserves.',
        links: {
          discover: 'Explorer',
          signIn: 'Se connecter',
          register: "S'inscrire",
        },
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
      pointsManagement: 'ادارة النقاط',
      resources: 'الموارد',
      tags: 'الوسوم',
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
      tags: { title: 'الوسوم', subtitle: 'ادارة وسوم الاكتشاف المستخدمة عبر الموارد والتخصيص' },
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
    publicHome: {
      header: {
        signIn: 'تسجيل الدخول',
        nav: {
          university: 'الجامعة',
          resources: 'الموارد',
        },
      },
      hero: {
        title: 'تطور بذكاء مع الاخرين',
        subtitle: 'اعثر على افضل الملاحظات الدراسية من طلاب يدرسون نفس المقررات التي تدرسها.',
        searchPlaceholder: 'ابحث عن المقررات او الاختبارات او المستندات',
        register: 'انشاء حساب',
        signIn: 'تسجيل الدخول',
        authRequired: {
          title: 'تسجيل الدخول مطلوب',
          description: 'للبحث والوصول الى الموارد، يرجى تسجيل الدخول اولا. يمكنك ايضا انشاء حساب جديد.',
        },
      },
      role: {
        eyebrow: 'رسالة المنصة',
        title: 'مساحة اكاديمية موحدة للطلاب والاساتذة والمجتمعات الجامعية',
        description:
          'تساعد MUS الطلاب على العثور على موارد موثوقة، والاستعداد الفعال للامتحانات، وتنظيم الاندية والفعاليات الجامعية، والوصول الى ملاحظات اكاديمية منظمة، والحفاظ على تواصل واضح مع الاساتذة.',
        pillars: {
          resources: {
            title: 'الوصول الى موارد اكاديمية موثوقة',
            description:
              'اكتشف ملاحظات وملخصات ووثائق دراسية منظمة حسب السياق الاكاديمي.',
          },
          exams: {
            title: 'تعزيز الاستعداد للامتحانات',
            description:
              'استخدم خطط مراجعة منظمة واختبارات تدريبية وخطط دراسية موجهة للامتحان.',
          },
          clubs: {
            title: 'تنسيق الاندية والفعاليات',
            description:
              'ادعم الاندية الجامعية عبر تخطيط افضل للفعاليات وتواصل اوضح وتحديثات مركزية.',
          },
          educators: {
            title: 'البقاء على اتصال مع الاساتذة',
            description:
              'سهل تدفق المعلومات بين الطلاب والاساتذة عبر الموارد المشتركة والاعلانات والتوجيه الاكاديمي.',
          },
        },
      },
      stats: {
        title: 'ساعدنا اكثر من مليار طالب وما زلنا مستمرين',
        subtitle: 'يتم اضافة 50 الف ملاحظة دراسية يوميا من اكثر المجتمعات الطلابية نشاطا',
        items: {
          resources: { title: 'الموارد الدراسية', chip: 'مورد جديد كل ثانية' },
          institutions: { title: 'المؤسسات', chip: 'في اكثر من 100 دولة' },
          users: { title: 'المستخدمون', chip: 'نشطون كل شهر' },
        },
      },
      footer: {
        description: 'تساعد MUS المجتمعات الجامعية على اكتشاف موارد موثوقة والتعلم بشكل اسرع والتعاون بوضوح.',
        copyright: '© 2026 MUS. جميع الحقوق محفوظة.',
        links: {
          discover: 'استكشاف',
          signIn: 'تسجيل الدخول',
          register: 'انشاء حساب',
        },
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
