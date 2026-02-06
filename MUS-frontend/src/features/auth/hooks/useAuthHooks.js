import { useState, useCallback } from 'react';
import authService from '@/services/authService';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (err) {
      // Extract error message from backend response
      // Backend format: { success: false, message: "..." }
      const message = err.response?.data?.message || 
                     err.response?.data?.error || 
                     err.message || 
                     'Login failed';
      setError(message);
      // Log to console for debugging
      console.error('Login hook error:', {
        message,
        status: err.response?.status,
        data: err.response?.data,
        error: err
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
};

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (email, password, fullName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(email, password, fullName);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
};

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logout, loading, error };
};
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getProfile();
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch profile';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getProfile, loading, error };
};

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (fullName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(fullName);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, loading, error };
};

export const useUpdateEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateEmail = useCallback(async (newEmail) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateEmail(newEmail);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update email';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateEmail, loading, error };
};

export const useUpdatePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updatePassword(oldPassword, newPassword);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update password';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updatePassword, loading, error };
};

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetPassword = useCallback(async (newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(newPassword);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPassword, loading, error };
};
