import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
      pointsManagement: 'Rewards Analytics',
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
      users: { title: 'Users', subtitle: 'Manage user accounts, status, and single-role assignments', add: 'Add User' },
      points: {
        title: 'Rewards Analytics',
        subtitle: 'Monitor automated contributor rewards, engagement trends, and top-performing resources',
        common: {
          students: 'students',
          teachers: 'teachers',
          generatedAt: 'Report generated',
          pointsShort: 'pts',
          last30Days: 'last 30 days',
          lastPeriod: 'last {days} days',
          active: 'Active',
          inactive: 'Inactive',
          unknownResource: 'Unknown resource',
        },
        cards: {
          contributors: 'Contributors',
          contributorsHint: '{active} active contributors across teachers and students',
          points: 'Automated Reward Points',
          pointsHint: '{periodPoints} points in {periodLabel}',
          downloads: 'Contributor Downloads',
          downloadsHint: '{periodDownloads} downloads in {periodLabel}',
          favorites: 'Contributor Favorites',
          favoritesHint: '{periodFavorites} favorites in {periodLabel}',
        },
        sections: {
          contributors: {
            title: 'Contributor Rewards',
            subtitle: 'Analytics based on automated download and favorite reward events for student and teacher contributors.',
          },
          topResources: {
            title: 'Top Reward-Earning Resources',
            subtitle: 'Ranked by automated reward events, then by downloads and favorites received.',
          },
          activity: {
            title: 'Recent Reward Activity',
            subtitle: 'Latest reward ledger events for contributor-owned resources.',
          },
        },
        filters: {
          search: 'Search contributors...',
          roleLabel: 'Role',
          allContributors: 'All contributors',
          students: 'Students',
          teachers: 'Teachers',
          periodLabel: 'Period',
          periodOption: 'Last {days} days',
        },
        table: {
          contributor: 'Contributor',
          role: 'Role',
          lifetimePoints: 'Lifetime Points',
          resources: 'Published / Total Resources',
          downloads: 'Downloads Received',
          favorites: 'Favorites Received',
          netChange: '30-Day Net Change',
          status: 'Status',
          pointsSplit: '{downloads} from downloads / {favorites} from favorites',
          publishedCount: '{count} published',
          totalCount: '{count} total resources',
        },
        topResources: {
          resource: 'Resource',
          owner: 'Owner',
          downloads: 'Downloads',
          favorites: 'Favorites',
          breakdown: 'Reward Breakdown',
          breakdownValue: '{downloads} download points / {favorites} favorite points',
        },
        activity: {
          resourcePrefix: 'Resource:',
          actorPrefix: 'Actor:',
          system: 'System',
          recordedAt: 'Recorded',
        },
        events: {
          downloadReward: 'Download reward',
          favoriteAddedReward: 'Favorite added',
          favoriteRemovedPenalty: 'Favorite removed',
        },
        feedback: {
          loadError: 'Failed to load rewards analytics',
          loadingContributors: 'Loading contributor analytics...',
          noContributors: 'No contributors match the current filters.',
          loadingTopResources: 'Loading top resources...',
          noTopResources: 'No reward-generating resources yet.',
          loadingActivity: 'Loading recent reward activity...',
          noActivityTitle: 'No reward activity yet',
          noActivityDescription: 'Reward events will appear here once contributors start receiving downloads and favorites.',
        },
      },
      resources: { title: 'Resources', subtitle: 'Manage educational resources, exams, courses and notes', add: 'Add Resource' },
      tags: { title: 'Tags', subtitle: 'Manage discovery tags used across resources and personalization' },
      library: { title: 'My Library', subtitle: 'View and manage your favorite resources', label: 'Saved' },
      uploads: { title: 'My Uploads', subtitle: 'View and manage the resources you uploaded', add: 'Upload Resource' },
      verify: { title: 'Content Verification', subtitle: 'Review and approve resources submitted by students and teachers', pending: 'Pending' },
      profile: { title: 'Profile', subtitle: 'View your account details and academic information' },
      catalog: {
        title: 'Academic Catalog',
        subtitle: 'Manage the academic hierarchy, institutions, and program mappings from one admin workspace',
        addInstitutionType: 'Add Institution Type',
        addDomain: 'Add Domain',
        addProgram: 'Add Program',
        addLevel: 'Add Level',
        addSemester: 'Add Semester',
        addModule: 'Add Module',
        addInstitution: 'Add Institution',
        tabs: {
          hierarchyExplorer: 'Hierarchy Explorer',
          institutionTypes: 'Institution Types',
          domains: 'Domains',
          programs: 'Programs',
          levels: 'Levels',
          semesters: 'Semesters',
          modules: 'Modules',
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
      pointsManagement: 'Analytique des recompenses',
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
      users: { title: 'Utilisateurs', subtitle: 'Gerez les comptes utilisateurs, le statut et le role unique', add: 'Ajouter un utilisateur' },
      points: {
        title: 'Analytique des recompenses',
        subtitle: 'Surveillez les recompenses automatiques des contributeurs, les tendances d engagement et les ressources les plus performantes',
        common: {
          students: 'etudiants',
          teachers: 'enseignants',
          generatedAt: 'Rapport genere',
          pointsShort: 'pts',
          last30Days: '30 derniers jours',
          lastPeriod: '{days} derniers jours',
          active: 'Actif',
          inactive: 'Inactif',
          unknownResource: 'Ressource inconnue',
        },
        cards: {
          contributors: 'Contributeurs',
          contributorsHint: '{active} contributeurs actifs entre etudiants et enseignants',
          points: 'Points de recompense automatiques',
          pointsHint: '{periodPoints} points sur {periodLabel}',
          downloads: 'Telechargements des contributeurs',
          downloadsHint: '{periodDownloads} telechargements sur {periodLabel}',
          favorites: 'Favoris des contributeurs',
          favoritesHint: '{periodFavorites} favoris sur {periodLabel}',
        },
        sections: {
          contributors: {
            title: 'Recompenses des contributeurs',
            subtitle: 'Analytique basee sur les evenements automatiques de telechargement et de favoris pour les contributeurs etudiants et enseignants.',
          },
          topResources: {
            title: 'Ressources les plus remunerees',
            subtitle: 'Classees par evenements de recompense automatiques puis par telechargements et favoris.',
          },
          activity: {
            title: 'Activite recente des recompenses',
            subtitle: 'Derniers evenements du registre des recompenses pour les ressources des contributeurs.',
          },
        },
        filters: {
          search: 'Rechercher des contributeurs...',
          roleLabel: 'Role',
          allContributors: 'Tous les contributeurs',
          students: 'Etudiants',
          teachers: 'Enseignants',
          periodLabel: 'Periode',
          periodOption: '{days} derniers jours',
        },
        table: {
          contributor: 'Contributeur',
          role: 'Role',
          lifetimePoints: 'Points cumulés',
          resources: 'Publiees / Total ressources',
          downloads: 'Telechargements recus',
          favorites: 'Favoris recus',
          netChange: 'Variation nette 30 jours',
          status: 'Statut',
          pointsSplit: '{downloads} depuis les telechargements / {favorites} depuis les favoris',
          publishedCount: '{count} publiees',
          totalCount: '{count} ressources au total',
        },
        topResources: {
          resource: 'Ressource',
          owner: 'Proprietaire',
          downloads: 'Telechargements',
          favorites: 'Favoris',
          breakdown: 'Detail des recompenses',
          breakdownValue: '{downloads} points telechargement / {favorites} points favoris',
        },
        activity: {
          resourcePrefix: 'Ressource :',
          actorPrefix: 'Acteur :',
          system: 'Systeme',
          recordedAt: 'Enregistre',
        },
        events: {
          downloadReward: 'Recompense de telechargement',
          favoriteAddedReward: 'Favori ajoute',
          favoriteRemovedPenalty: 'Favori retire',
        },
        feedback: {
          loadError: 'Echec du chargement de l analytique des recompenses',
          loadingContributors: 'Chargement des analytiques des contributeurs...',
          noContributors: 'Aucun contributeur ne correspond aux filtres actuels.',
          loadingTopResources: 'Chargement des meilleures ressources...',
          noTopResources: 'Aucune ressource generatrice de recompense pour le moment.',
          loadingActivity: 'Chargement de l activite recente des recompenses...',
          noActivityTitle: 'Aucune activite de recompense pour le moment',
          noActivityDescription: 'Les evenements de recompense apparaitront ici des que les contributeurs recevront des telechargements et des favoris.',
        },
      },
      resources: { title: 'Ressources', subtitle: 'Gerez les ressources educatives, examens, cours et notes', add: 'Ajouter une ressource' },
      tags: { title: 'Etiquettes', subtitle: 'Gerez les etiquettes de decouverte utilisees pour les ressources et la personnalisation' },
      library: { title: 'Ma bibliotheque', subtitle: 'Consultez et gerez vos ressources favorites', label: 'Sauvegardees' },
      uploads: { title: 'Mes depots', subtitle: 'Consultez et gerez les ressources que vous avez publiees', add: 'Televerser une ressource' },
      verify: { title: 'Verification du contenu', subtitle: 'Examinez et approuvez les ressources soumises', pending: 'En attente' },
      profile: { title: 'Profil', subtitle: 'Consultez vos informations de compte et academiques' },
      catalog: {
        title: 'Catalogue academique',
        subtitle: 'Gerez la hierarchie academique, les institutions et les liaisons de programmes depuis un seul espace admin',
        addInstitutionType: 'Ajouter un type d institution',
        addDomain: 'Ajouter un domaine',
        addProgram: 'Ajouter un programme',
        addLevel: 'Ajouter un niveau',
        addSemester: 'Ajouter un semestre',
        addModule: 'Ajouter un module',
        addInstitution: 'Ajouter une institution',
        tabs: {
          hierarchyExplorer: 'Explorateur hierarchique',
          institutionTypes: 'Types d institution',
          domains: 'Domaines',
          programs: 'Programmes',
          levels: 'Niveaux',
          semesters: 'Semestres',
          modules: 'Modules',
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
      pointsManagement: 'تحليلات المكافآت',
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
      users: { title: 'المستخدمون', subtitle: 'ادارة حسابات المستخدمين والحالة وتعيين دور واحد فقط', add: 'اضافة مستخدم' },
      points: {
        title: 'تحليلات المكافآت',
        subtitle: 'مراقبة مكافآت المساهمين التلقائية واتجاهات التفاعل والموارد الأعلى أداءً',
        common: {
          students: 'طلاب',
          teachers: 'مدرسون',
          generatedAt: 'تم إنشاء التقرير',
          pointsShort: 'نقطة',
          last30Days: 'آخر 30 يومًا',
          lastPeriod: 'آخر {days} يومًا',
          active: 'نشط',
          inactive: 'غير نشط',
          unknownResource: 'مورد غير معروف',
        },
        cards: {
          contributors: 'المساهمون',
          contributorsHint: '{active} مساهمًا نشطًا من الطلاب والمدرسين',
          points: 'نقاط المكافآت التلقائية',
          pointsHint: '{periodPoints} نقطة خلال {periodLabel}',
          downloads: 'تنزيلات المساهمين',
          downloadsHint: '{periodDownloads} تنزيل خلال {periodLabel}',
          favorites: 'مفضلات المساهمين',
          favoritesHint: '{periodFavorites} مفضلة خلال {periodLabel}',
        },
        sections: {
          contributors: {
            title: 'مكافآت المساهمين',
            subtitle: 'تحليلات مبنية على أحداث المكافآت التلقائية للتنزيلات والمفضلة لمساهمي الطلاب والمدرسين.',
          },
          topResources: {
            title: 'أعلى الموارد تحقيقًا للمكافآت',
            subtitle: 'مرتبة حسب أحداث المكافآت التلقائية ثم التنزيلات والمفضلات.',
          },
          activity: {
            title: 'آخر نشاطات المكافآت',
            subtitle: 'أحدث أحداث سجل المكافآت لموارد المساهمين.',
          },
        },
        filters: {
          search: 'ابحث عن مساهمين...',
          roleLabel: 'الدور',
          allContributors: 'كل المساهمين',
          students: 'الطلاب',
          teachers: 'المدرسون',
          periodLabel: 'الفترة',
          periodOption: 'آخر {days} يومًا',
        },
        table: {
          contributor: 'المساهم',
          role: 'الدور',
          lifetimePoints: 'إجمالي النقاط',
          resources: 'منشور / إجمالي الموارد',
          downloads: 'التنزيلات المستلمة',
          favorites: 'المفضلات المستلمة',
          netChange: 'صافي التغير خلال 30 يومًا',
          status: 'الحالة',
          pointsSplit: '{downloads} من التنزيلات / {favorites} من المفضلات',
          publishedCount: '{count} منشور',
          totalCount: '{count} مورد إجمالاً',
        },
        topResources: {
          resource: 'المورد',
          owner: 'المالك',
          downloads: 'التنزيلات',
          favorites: 'المفضلات',
          breakdown: 'تفاصيل المكافأة',
          breakdownValue: '{downloads} نقاط تنزيل / {favorites} نقاط مفضلة',
        },
        activity: {
          resourcePrefix: 'المورد:',
          actorPrefix: 'المنفذ:',
          system: 'النظام',
          recordedAt: 'سُجل في',
        },
        events: {
          downloadReward: 'مكافأة تنزيل',
          favoriteAddedReward: 'إضافة إلى المفضلة',
          favoriteRemovedPenalty: 'إزالة من المفضلة',
        },
        feedback: {
          loadError: 'فشل تحميل تحليلات المكافآت',
          loadingContributors: 'جارٍ تحميل تحليلات المساهمين...',
          noContributors: 'لا يوجد مساهمون يطابقون عوامل التصفية الحالية.',
          loadingTopResources: 'جارٍ تحميل أعلى الموارد...',
          noTopResources: 'لا توجد موارد مولدة للمكافآت حتى الآن.',
          loadingActivity: 'جارٍ تحميل نشاط المكافآت الأخير...',
          noActivityTitle: 'لا يوجد نشاط مكافآت حتى الآن',
          noActivityDescription: 'ستظهر أحداث المكافآت هنا عندما يبدأ المساهمون في تلقي التنزيلات والمفضلات.',
        },
      },
      resources: { title: 'الموارد', subtitle: 'ادارة الموارد التعليمية والاختبارات والدروس والملاحظات', add: 'اضافة مورد' },
      tags: { title: 'الوسوم', subtitle: 'ادارة وسوم الاكتشاف المستخدمة عبر الموارد والتخصيص' },
      library: { title: 'مكتبتي', subtitle: 'عرض وادارة الموارد المفضلة لديك', label: 'محفوظة' },
      uploads: { title: 'مرفوعاتي', subtitle: 'عرض وادارة الموارد التي قمت برفعها', add: 'رفع مورد' },
      verify: { title: 'مراجعة المحتوى', subtitle: 'مراجعة واعتماد الموارد المرسلة', pending: 'قيد الانتظار' },
      profile: { title: 'الملف الشخصي', subtitle: 'عرض معلومات الحساب والمعلومات الاكاديمية' },
      catalog: {
        title: 'الدليل الاكاديمي',
        subtitle: 'ادارة الهرم الاكاديمي والمؤسسات وربط البرامج من مساحة ادارية واحدة',
        addInstitutionType: 'اضافة نوع مؤسسة',
        addDomain: 'اضافة مجال',
        addProgram: 'اضافة برنامج',
        addLevel: 'اضافة مستوى',
        addSemester: 'اضافة فصل',
        addModule: 'اضافة وحدة',
        addInstitution: 'اضافة مؤسسة',
        tabs: {
          hierarchyExplorer: 'مستكشف الهيكل',
          institutionTypes: 'انواع المؤسسات',
          domains: 'المجالات',
          programs: 'البرامج',
          levels: 'المستويات',
          semesters: 'الفصول',
          modules: 'الوحدات',
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

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = ['en', 'fr', 'ar'].includes(nextLanguage) ? nextLanguage : 'en';
    setLanguageState(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  }, []);

  useEffect(() => {
    const isArabic = language === 'ar';
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.body.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
  }, [language]);

  const t = useCallback((key, fallback = key) => {
    const localized = getNestedValue(translations[language], key);
    if (localized !== undefined) return localized;
    const english = getNestedValue(translations.en, key);
    return english !== undefined ? english : fallback;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

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
