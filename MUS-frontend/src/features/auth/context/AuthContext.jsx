import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '@/services/api.js';

const AuthContext = createContext();

const normalizeRoles = (rawRoles) => {
  const asArray = Array.isArray(rawRoles)
    ? rawRoles
    : rawRoles == null
      ? []
      : [rawRoles];

  const mapRole = (role) => {
    const rawValue = typeof role === 'object' ? role?.name || role?.role || '' : role;
    const normalized = String(rawValue || '').trim().toUpperCase().replace(/^ROLE_/, '');

    if (normalized.includes('ADMIN')) return 'ADMIN';
    if (normalized.includes('TEACHER')) return 'TEACHER';
    if (normalized.includes('STUDENT') || normalized === 'USER') return 'STUDENT';

    return normalized;
  };

  return asArray
    .filter((r) => r != null)
    .map((r) => (typeof r === 'object' ? (r?.name || r?.role || '') : String(r)).trim())
    .filter(Boolean)
    .map(mapRole)
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
};

const extractUserFromPayload = (payload) => {
  return (
    payload?.user ||
    payload?.data?.user ||
    payload?.data?.data?.user ||
    null
  );
};

const extractTokenFromPayload = (payload) => {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.data?.data?.token ||
    null
  );
};

const normalizeContributionMode = (userLike) => {
  const raw = userLike?.contribution_mode ?? userLike?.contributionMode;
  const normalized = String(raw || '').trim().toLowerCase();
  if (normalized === 'learner') return 'learner';
  return 'contributor';
};

const normalizeUserAvatar = (userLike) => {
  if (!userLike) return userLike;
  return {
    ...userLike,
    avatar_url: userLike.avatar_url || userLike.avatarUrl || userLike.avatar || userLike.profile_image || null,
  };
};

const isJwtExpired = (rawToken) => {
  const token = String(rawToken || '').trim();
  if (!token) return true;

  const parts = token.split('.');
  if (parts.length < 2) return false;

  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const payload = JSON.parse(window.atob(normalized));
    const exp = Number(payload?.exp || 0);
    if (!Number.isFinite(exp) || exp <= 0) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const login = useCallback((userData) => {
    const newToken = extractTokenFromPayload(userData);
    const newUser = extractUserFromPayload(userData);

    const userRoles = normalizeRoles(
      newUser?.roles ||
      newUser?.role ||
      userData?.roles ||
      userData?.role ||
      userData?.data?.roles ||
      userData?.data?.role ||
      []
    );
    
    const normalizedUser = newUser
      ? {
          ...normalizeUserAvatar(newUser),
          contribution_mode: normalizeContributionMode(newUser),
        }
      : newUser;

    setToken(newToken);
    setRoles(userRoles);
    setUser(normalizedUser);
    setIsAuthenticated(true);

    if (newToken) {
      localStorage.setItem('authToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    localStorage.setItem('userRoles', JSON.stringify(userRoles));
    localStorage.setItem('userData', JSON.stringify(normalizedUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRoles([]);
    setUser(null);
    setIsAuthenticated(false);

    localStorage.removeItem('authToken');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberEmail');
    localStorage.setItem('themeMode', 'light');
    localStorage.setItem('fontSize', 'medium');

    document.documentElement.style.fontSize = '16px';
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me', { skipAuthRedirect: true });
      const profileUser = extractUserFromPayload(response?.data);
      if (!profileUser) return null;

      const normalized = {
        ...normalizeUserAvatar(profileUser),
        contribution_mode: normalizeContributionMode(profileUser),
      };

      const userRoles = normalizeRoles(normalized?.roles || normalized?.role || []);
      setUser(normalized);
      setRoles(userRoles);
      localStorage.setItem('userData', JSON.stringify(normalized));
      localStorage.setItem('userRoles', JSON.stringify(userRoles));
      return normalized;
    } catch (_error) {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedRoles = localStorage.getItem('userRoles');
      const storedUser = localStorage.getItem('userData');

      if (!storedToken || !storedUser) {
        if (mounted) setLoading(false);
        return;
      }

      if (isJwtExpired(storedToken)) {
        if (mounted) {
          logout();
          setLoading(false);
        }
        return;
      }

      try {
         const parsedUser = JSON.parse(storedUser);
         const normalizedStoredUser = {
           ...normalizeUserAvatar(parsedUser),
            contribution_mode: normalizeContributionMode(parsedUser),
          };
         const parsedRoles = normalizeRoles(
           storedRoles
             ? JSON.parse(storedRoles)
             : normalizedStoredUser?.roles || normalizedStoredUser?.role || []
         );

        if (!mounted) return;

        setToken(storedToken);
        setRoles(parsedRoles);
        setUser(normalizedStoredUser);
        setIsAuthenticated(true);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        const refreshedProfile = await refreshProfile();
        if (!refreshedProfile) {
          logout();
        }
      } catch (_error) {
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, [logout, refreshProfile]);

  const hasRole = useCallback(
    (requiredRole) => {
      if (!requiredRole) return true;
      const normalized = String(requiredRole).trim().toUpperCase();
      return roles.includes(normalized);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (requiredRoles = []) => {
      if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return true;
      return requiredRoles.some((role) => hasRole(role));
    },
    [hasRole]
  );

  const value = {
    isAuthenticated,
    user,
    roles,
    token,
    loading,
    login,
    logout,
    refreshProfile,
    hasRole,
    hasAnyRole,
    isStudent: roles.includes('STUDENT'),
    isTeacher: roles.includes('TEACHER'),
    isAdmin: roles.includes('ADMIN'),
    isModerator: roles.includes('MODERATOR'),
    membership: user?.membership || null,
    isPremium: Boolean(user?.membership?.is_premium),
    contributionMode: normalizeContributionMode(user),
    canContribute: !roles.includes('STUDENT') || normalizeContributionMode(user) === 'contributor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
