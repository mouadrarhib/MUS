import { del, get, patch, post } from "@/services/http";

const SETTINGS = {
  BASE: "/user-settings",
};

const normalizeSettings = (data) => {
  if (Array.isArray(data)) {
    return data[0] || null;
  }
  return data || null;
};

export const userSettingsService = {
  create: (payload) =>
    post(SETTINGS.BASE, payload).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  getByUserId: (userId) =>
    get(`${SETTINGS.BASE}/${userId}`).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  update: (userId, payload) =>
    patch(`${SETTINGS.BASE}/${userId}`, payload).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  updateAppearance: (userId, payload) =>
    patch(`${SETTINGS.BASE}/${userId}/appearance`, payload).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  updateNotifications: (userId, payload) =>
    patch(`${SETTINGS.BASE}/${userId}/notifications`, payload).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  updatePrivacy: (userId, payload) =>
    patch(`${SETTINGS.BASE}/${userId}/privacy`, payload).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  updateLocale: (userId, payload) =>
    patch(`${SETTINGS.BASE}/${userId}/locale`, payload).then((response) => ({
      ...response,
      data: normalizeSettings(response?.data),
    })),

  exists: (userId) =>
    get(`${SETTINGS.BASE}/${userId}/exists`).then((response) => ({
      ...response,
      data: Boolean(response?.data?.sp_user_settings_exists),
    })),

  remove: (userId) => del(`${SETTINGS.BASE}/${userId}`),
};

export default userSettingsService;
