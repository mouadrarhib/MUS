import apiClient from '@/services/api';

const AUTH_ENDPOINTS = {
  REGISTER: 'api/auth/register',
  LOGIN: 'api/auth/login',
  ME: 'api/auth/me',
  LOGOUT: 'api/auth/logout',
  UPDATE_EMAIL: 'api/auth/email',
  UPDATE_PASSWORD: 'api/auth/password',
  RESET_PASSWORD: 'api/auth/password/reset',
  FORGOT_PASSWORD: 'api/auth/password/forgot',
  CHECK_EMAIL: 'api/auth/email/check',
  UPDATE_PROFILE: 'api/auth/profile',
  TOGGLE_ACTIVE: 'api/auth/active',
  DELETE_USER: 'api/auth/me',
  GET_USER_BY_ID: 'api/auth/user',
  UPDATE_USER_BY_ID: 'api/auth/user',
};

export const authService = {
  register: async (email, password, fullName) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  login: async (email, password, skipAuthRedirect = false) => {
    const config = skipAuthRedirect ? { skipAuthRedirect: true } : {};
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    }, config);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },

  updateEmail: async (newEmail) => {
    const response = await apiClient.patch(AUTH_ENDPOINTS.UPDATE_EMAIL, {
      new_email: newEmail,
    });
    return response.data;
  },

  updatePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.patch(AUTH_ENDPOINTS.UPDATE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  resetPassword: async (newPassword) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      new_password: newPassword,
    });
    return response.data;
  },

  checkEmailExists: async (email) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.CHECK_EMAIL, {
      email,
    });
    return response.data;
  },

  forgotPassword: async (email, newPassword) => {
    const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      email,
      new_password: newPassword,
    });
    return response.data;
  },

  updateProfile: async (fullName) => {
    const response = await apiClient.patch(AUTH_ENDPOINTS.UPDATE_PROFILE, {
      full_name: fullName,
    });
    return response.data;
  },

  toggleActive: async (isActive) => {
    const response = await apiClient.patch(AUTH_ENDPOINTS.TOGGLE_ACTIVE, {
      is_active: isActive,
    });
    return response.data;
  },

  deleteUser: async () => {
    const response = await apiClient.delete(AUTH_ENDPOINTS.DELETE_USER);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await apiClient.get(`${AUTH_ENDPOINTS.GET_USER_BY_ID}/${userId}`);
    return response.data;
  },

  updateUserById: async (userId, data) => {
    const response = await apiClient.patch(
      `${AUTH_ENDPOINTS.UPDATE_USER_BY_ID}/${userId}`,
      data
    );
    return response.data;
  },
};

export default authService;
