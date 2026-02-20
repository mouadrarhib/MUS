import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../../../services/api.js';

const AuthContext = createContext();

const normalizeRoles = (rawRoles) => {
  if (!Array.isArray(rawRoles)) return [];

  const mapRole = (role) => {
    const normalized = String(role || '').trim().toUpperCase().replace(/^ROLE_/, '');

    if (normalized.includes('ADMIN')) return 'ADMIN';
    if (normalized.includes('TEACHER')) return 'TEACHER';
    if (normalized.includes('STUDENT') || normalized === 'USER') return 'STUDENT';

    return normalized;
  };

  return rawRoles
    .filter((r) => r != null)
    .map((r) => String(r).trim())
    .filter(Boolean)
    .map(mapRole);
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

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const login = useCallback((userData) => {
    const newToken = extractTokenFromPayload(userData);
    const newUser = extractUserFromPayload(userData);

    const userRoles = normalizeRoles(newUser?.roles || userData?.roles || userData?.data?.roles || []);
    
    setToken(newToken);
    setRoles(userRoles);
    setUser(newUser);
    setIsAuthenticated(true);

    if (newToken) {
      localStorage.setItem('authToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    localStorage.setItem('userRoles', JSON.stringify(userRoles));
    localStorage.setItem('userData', JSON.stringify(newUser));
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
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me', { skipAuthRedirect: true });
      const profileUser = extractUserFromPayload(response?.data);
      if (!profileUser) return null;

      const normalized = { ...profileUser };

      const userRoles = normalizeRoles(normalized?.roles || []);
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

      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedRoles = normalizeRoles(storedRoles ? JSON.parse(storedRoles) : parsedUser?.roles || []);

        if (!mounted) return;

        setToken(storedToken);
        setRoles(parsedRoles);
        setUser(parsedUser);
        setIsAuthenticated(true);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        await refreshProfile();
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
    isStudent: roles.includes('USER') || roles.includes('STUDENT'),
    isAdmin: roles.includes('ADMIN'),
    isModerator: roles.includes('MODERATOR'),
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
