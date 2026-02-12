import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import AppRouter from "./app/router";

function App() {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = 'MUS | Moroccan University Students Platform';
    const path = location.pathname;

    const titleMap = [
      { match: '/login', title: `Login - ${baseTitle}` },
      { match: '/register', title: `Create Account - ${baseTitle}` },
      { match: '/dashboard/users', title: `Users - ${baseTitle}` },
      { match: '/dashboard/resources', title: `Resources - ${baseTitle}` },
      { match: '/dashboard/library', title: `Library - ${baseTitle}` },
      { match: '/dashboard/uploads', title: `My Uploads - ${baseTitle}` },
      { match: '/dashboard/profile', title: `Profile - ${baseTitle}` },
      { match: '/dashboard/settings', title: `Settings - ${baseTitle}` },
      { match: '/dashboard/verify', title: `Verify Resources - ${baseTitle}` },
      { match: '/dashboard', title: `Overview - ${baseTitle}` },
      { match: '/404', title: `Page Not Found - ${baseTitle}` },
    ];

    const matched = titleMap.find((entry) => path === entry.match || path.startsWith(`${entry.match}/`));
    document.title = matched ? matched.title : baseTitle;
  }, [location.pathname]);

  return (
      <AppRouter />
  );
}

export default App;
