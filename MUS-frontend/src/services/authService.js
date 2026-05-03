import { del, get, patch, post } from "@/services/http";

const AUTH = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  UPDATE_EMAIL: "/auth/email",
  UPDATE_PASSWORD: "/auth/password",
  RESET_PASSWORD: "/auth/password/reset",
  FORGOT_PASSWORD: "/auth/password/forgot",
  CHECK_EMAIL: "/auth/email/check",
  RESET_PASSWORD_WITH_TOKEN: "/auth/reset-password",
  UPDATE_PROFILE: "/auth/profile",
  TOGGLE_ACTIVE: "/auth/active",
  DELETE_USER: "/auth/me",
  USER_BY_ID: "/auth/user",
  AVATAR_UPLOAD: "/auth/avatar/upload-file",
  AVATAR: "/auth/avatar",
};

export const authService = {
  register: (payloadOrEmail, password, fullName) => {
    if (typeof payloadOrEmail === "object" && payloadOrEmail !== null) {
      return post(AUTH.REGISTER, payloadOrEmail);
    }

    return post(AUTH.REGISTER, {
      email: payloadOrEmail,
      password,
      full_name: fullName,
    });
  },

  login: (email, password, skipAuthRedirect = false) =>
    post(
      AUTH.LOGIN,
      { email, password },
      skipAuthRedirect ? { skipAuthRedirect: true } : undefined
    ),

  getProfile: () => get(AUTH.ME),
  logout: () => post(AUTH.LOGOUT),

  updateEmail: (newEmail) =>
    patch(AUTH.UPDATE_EMAIL, {
      new_email: newEmail,
    }),

  updatePassword: (oldPassword, newPassword) =>
    patch(AUTH.UPDATE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    }),

  resetPassword: (newPassword) =>
    post(AUTH.RESET_PASSWORD, {
      new_password: newPassword,
    }),

  checkEmailExists: (email) => post(AUTH.CHECK_EMAIL, { email }),

  forgotPassword: (email) =>
    post(AUTH.FORGOT_PASSWORD, {
      email,
    }),

  resetPasswordWithToken: (token, newPassword) =>
    post(AUTH.RESET_PASSWORD_WITH_TOKEN, {
      token,
      new_password: newPassword,
    }),

  updateProfile: (fullName) =>
    patch(AUTH.UPDATE_PROFILE, {
      full_name: fullName,
    }),

  toggleActive: (isActive) =>
    patch(AUTH.TOGGLE_ACTIVE, {
      is_active: isActive,
    }),

  deleteUser: () => del(AUTH.DELETE_USER),
  getUserById: (userId) => get(`${AUTH.USER_BY_ID}/${userId}`),
  updateUserById: (userId, data) => patch(`${AUTH.USER_BY_ID}/${userId}`, data),
  removeUserById: (userId) => del(`${AUTH.USER_BY_ID}/${userId}`),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return post(AUTH.AVATAR_UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAvatar: () => del(AUTH.AVATAR),

  uploadAvatarByUserId: (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return post(`${AUTH.USER_BY_ID}/${userId}/avatar/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default authService;
