import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import AppRouter from "./app/router";
import { useLanguage } from "./app/providers/LanguageContext";

function App() {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const baseTitle = 'MUS | Moroccan University Students Platform';
    const path = location.pathname;

    const titleMap = [
      { match: '/', title: `MUS - Academic Personalization Platform` },
      { match: '/login', title: `Login - ${baseTitle}` },
      { match: '/register', title: `Create Account - ${baseTitle}` },
      { match: '/discover', title: `Discover Resources - ${baseTitle}` },
      { match: '/dashboard/users', title: `${t('nav.pointsManagement')} - ${baseTitle}` },
      { match: '/dashboard/resources', title: `${t('pages.resources.title')} - ${baseTitle}` },
      { match: '/dashboard/library', title: `${t('pages.library.title')} - ${baseTitle}` },
      { match: '/dashboard/uploads', title: `${t('pages.uploads.title')} - ${baseTitle}` },
      { match: '/dashboard/wallet', title: `${t('nav.wallet')} - ${baseTitle}` },
      { match: '/dashboard/profile', title: `${t('pages.profile.title')} - ${baseTitle}` },
      { match: '/dashboard/settings', title: `${t('pages.settings.title')} - ${baseTitle}` },
      { match: '/dashboard/verify', title: `${t('pages.verify.title')} - ${baseTitle}` },
      { match: '/dashboard/catalog', title: `${t('pages.catalog.title')} - ${baseTitle}` },
      { match: '/dashboard', title: `${t('nav.overview')} - ${baseTitle}` },
      { match: '/404', title: `Page Not Found - ${baseTitle}` },
    ];

    const matched = titleMap.find((entry) => path === entry.match || path.startsWith(`${entry.match}/`));
    document.title = matched ? matched.title : baseTitle;
  }, [location.pathname, t]);

  return (
      <AppRouter />
  );
}

export default App;
