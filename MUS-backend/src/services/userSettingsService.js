import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

export const createUserSettings = async (
  userId,
  themeMode,
  fontSize,
  language,
  timezone,
  dateFormat,
  emailNotifications,
  pushNotifications,
  resourceAlerts,
  weeklyDigest,
  showActivityStatus,
  showProfile,
  twoFactorEnabled
) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.CREATE, {
    replacements: {
      user_id: userId,
      theme_mode: themeMode ?? null,
      font_size: fontSize ?? null,
      language: language ?? null,
      timezone: timezone ?? null,
      date_format: dateFormat ?? null,
      email_notifications: emailNotifications ?? null,
      push_notifications: pushNotifications ?? null,
      resource_alerts: resourceAlerts ?? null,
      weekly_digest: weeklyDigest ?? null,
      show_activity_status: showActivityStatus ?? null,
      show_profile: showProfile ?? null,
      two_factor_enabled: twoFactorEnabled ?? null,
    },
  });
  return results;
};

export const getUserSettingsByUserId = async (userId) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.GET_BY_USER_ID, {
    replacements: { user_id: userId },
  });
  return results.length > 0 ? results[0] : null;
};

export const updateUserSettings = async (
  userId,
  themeMode,
  fontSize,
  language,
  timezone,
  dateFormat,
  emailNotifications,
  pushNotifications,
  resourceAlerts,
  weeklyDigest,
  showActivityStatus,
  showProfile,
  twoFactorEnabled
) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.UPDATE, {
    replacements: {
      user_id: userId,
      theme_mode: themeMode ?? null,
      font_size: fontSize ?? null,
      language: language ?? null,
      timezone: timezone ?? null,
      date_format: dateFormat ?? null,
      email_notifications: emailNotifications ?? null,
      push_notifications: pushNotifications ?? null,
      resource_alerts: resourceAlerts ?? null,
      weekly_digest: weeklyDigest ?? null,
      show_activity_status: showActivityStatus ?? null,
      show_profile: showProfile ?? null,
      two_factor_enabled: twoFactorEnabled ?? null,
    },
  });
  return results;
};

export const updateUserSettingsAppearance = async (userId, themeMode, fontSize) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.UPDATE_APPEARANCE, {
    replacements: {
      user_id: userId,
      theme_mode: themeMode ?? null,
      font_size: fontSize ?? null,
    },
  });
  return results;
};

export const updateUserSettingsNotifications = async (
  userId,
  emailNotifications,
  pushNotifications,
  resourceAlerts,
  weeklyDigest
) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.UPDATE_NOTIFICATIONS, {
    replacements: {
      user_id: userId,
      email_notifications: emailNotifications ?? null,
      push_notifications: pushNotifications ?? null,
      resource_alerts: resourceAlerts ?? null,
      weekly_digest: weeklyDigest ?? null,
    },
  });
  return results;
};

export const updateUserSettingsPrivacy = async (
  userId,
  showActivityStatus,
  showProfile,
  twoFactorEnabled
) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.UPDATE_PRIVACY, {
    replacements: {
      user_id: userId,
      show_activity_status: showActivityStatus ?? null,
      show_profile: showProfile ?? null,
      two_factor_enabled: twoFactorEnabled ?? null,
    },
  });
  return results;
};

export const updateUserSettingsLocale = async (userId, language, timezone, dateFormat) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.UPDATE_LOCALE, {
    replacements: {
      user_id: userId,
      language: language ?? null,
      timezone: timezone ?? null,
      date_format: dateFormat ?? null,
    },
  });
  return results;
};

export const deleteUserSettings = async (userId) => {
  await sequelize.query(SQL.USER_SETTINGS.DELETE, {
    replacements: { user_id: userId },
  });
};

export const userSettingsExists = async (userId) => {
  const [results] = await sequelize.query(SQL.USER_SETTINGS.EXISTS, {
    replacements: { user_id: userId },
  });
  return results.length > 0 ? results[0] : null;
};
