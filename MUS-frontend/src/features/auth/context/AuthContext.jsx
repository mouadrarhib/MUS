import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../../../config/apiClient';

const AuthContext = createContext();

const normalizeRoles = (rawRoles) => {
  if (!Array.isArray(rawRoles)) return [];
  return rawRoles
    .filter((r) => r != null)
    .map((r) => String(r).trim())
    .filter(Boolean)
    .map((r) => r.toUpperCase());
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedRoles = localStorage.getItem('userRoles');
    const storedUser = localStorage.getItem('userData');

    if (storedToken && storedRoles && storedUser) {
      setToken(storedToken);
      setRoles(normalizeRoles(JSON.parse(storedRoles)));
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    const newToken =
      userData?.token ||
      userData?.accessToken ||
      userData?.data?.token ||
      userData?.data?.accessToken ||
      userData?.data?.data?.token ||
      null;

    const newUser =
      userData?.user ||
      userData?.data?.user ||
      userData?.data?.data?.user ||
      null;

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
