import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import client from '@/api/client';

const AuthContext = createContext();

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
      setRoles(JSON.parse(storedRoles));
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      client.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    const { token: newToken, user: newUser, data } = userData;
    const userRoles = newUser?.roles || data?.user?.roles || [];
    
    setToken(newToken);
    setRoles(userRoles);
    setUser(newUser || data?.user);
    setIsAuthenticated(true);

    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userRoles', JSON.stringify(userRoles));
    localStorage.setItem('userData', JSON.stringify(newUser || data?.user));
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

  const hasRole = useCallback((requiredRole) => {
    return roles.includes(requiredRole);
  }, [roles]);

  const value = {
    isAuthenticated,
    user,
    roles,
    token,
    loading,
    login,
    logout,
    hasRole,
    isStudent: roles.includes('user') || roles.includes('student') || roles.includes('STUDENT'),
    isAdmin: roles.includes('admin') || roles.includes('ADMIN'),
    isModerator: roles.includes('moderator') || roles.includes('MODERATOR'),
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
