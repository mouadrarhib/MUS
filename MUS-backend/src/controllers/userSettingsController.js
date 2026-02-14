import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createUserSettings,
  getUserSettingsByUserId,
  updateUserSettings,
  updateUserSettingsAppearance,
  updateUserSettingsNotifications,
  updateUserSettingsPrivacy,
  updateUserSettingsLocale,
  deleteUserSettings,
  userSettingsExists,
} from "../services/userSettingsService.js";

/**
 * @swagger
 * tags:
 *   name: User Settings
 *   description: User settings management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         theme_mode:
 *           type: string
 *         font_size:
 *           type: string
 *         language:
 *           type: string
 *         timezone:
 *           type: string
 *         date_format:
 *           type: string
 *         email_notifications:
 *           type: boolean
 *         push_notifications:
 *           type: boolean
 *         resource_alerts:
 *           type: boolean
 *         weekly_digest:
 *           type: boolean
 *         show_activity_status:
 *           type: boolean
 *         show_profile:
 *           type: boolean
 *         two_factor_enabled:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     UserSettingsRequest:
 *       type: object
 *       required: [user_id]
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         theme_mode:
 *           type: string
 *         font_size:
 *           type: string
 *         language:
 *           type: string
 *         timezone:
 *           type: string
 *         date_format:
 *           type: string
 *         email_notifications:
 *           type: boolean
 *         push_notifications:
 *           type: boolean
 *         resource_alerts:
 *           type: boolean
 *         weekly_digest:
 *           type: boolean
 *         show_activity_status:
 *           type: boolean
 *         show_profile:
 *           type: boolean
 *         two_factor_enabled:
 *           type: boolean
 */

/**
 * @swagger
 * /user-settings:
 *   post:
 *     summary: Create user settings
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSettingsRequest'
 *     responses:
 *       201:
 *         description: User settings created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 */
export const addUserSettings = asyncHandler(async (req, res) => {
  const {
    user_id,
    theme_mode,
    font_size,
    language,
    timezone,
    date_format,
    email_notifications,
    push_notifications,
    resource_alerts,
    weekly_digest,
    show_activity_status,
    show_profile,
    two_factor_enabled,
  } = req.body;

  const result = await createUserSettings(
    user_id,
    theme_mode,
    font_size,
    language,
    timezone,
    date_format,
    email_notifications,
    push_notifications,
    resource_alerts,
    weekly_digest,
    show_activity_status,
    show_profile,
    two_factor_enabled
  );

  return successResponse(res, "User settings created successfully", result, 201);
});

/**
 * @swagger
 * /user-settings/{userId}:
 *   get:
 *     summary: Get user settings by user ID
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User settings data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 */
export const getUserSettings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getUserSettingsByUserId(userId);
  return successResponse(res, "User settings retrieved successfully", result);
});

/**
 * @swagger
 * /user-settings/{userId}:
 *   patch:
 *     summary: Update user settings by user ID
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme_mode:
 *                 type: string
 *               font_size:
 *                 type: string
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               date_format:
 *                 type: string
 *               email_notifications:
 *                 type: boolean
 *               push_notifications:
 *                 type: boolean
 *               resource_alerts:
 *                 type: boolean
 *               weekly_digest:
 *                 type: boolean
 *               show_activity_status:
 *                 type: boolean
 *               show_profile:
 *                 type: boolean
 *               two_factor_enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User settings updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 */
export const updateExistingUserSettings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    theme_mode,
    font_size,
    language,
    timezone,
    date_format,
    email_notifications,
    push_notifications,
    resource_alerts,
    weekly_digest,
    show_activity_status,
    show_profile,
    two_factor_enabled,
  } = req.body;

  const result = await updateUserSettings(
    userId,
    theme_mode,
    font_size,
    language,
    timezone,
    date_format,
    email_notifications,
    push_notifications,
    resource_alerts,
    weekly_digest,
    show_activity_status,
    show_profile,
    two_factor_enabled
  );

  return successResponse(res, "User settings updated successfully", result);
});

/**
 * @swagger
 * /user-settings/{userId}/appearance:
 *   patch:
 *     summary: Update user appearance settings
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme_mode:
 *                 type: string
 *               font_size:
 *                 type: string
 *     responses:
 *       200:
 *         description: User appearance settings updated
 */
export const updateUserSettingsAppearanceHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { theme_mode, font_size } = req.body;
  const result = await updateUserSettingsAppearance(userId, theme_mode, font_size);
  return successResponse(res, "User settings appearance updated successfully", result);
});

/**
 * @swagger
 * /user-settings/{userId}/notifications:
 *   patch:
 *     summary: Update user notification settings
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_notifications:
 *                 type: boolean
 *               push_notifications:
 *                 type: boolean
 *               resource_alerts:
 *                 type: boolean
 *               weekly_digest:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User notification settings updated
 */
export const updateUserSettingsNotificationsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { email_notifications, push_notifications, resource_alerts, weekly_digest } = req.body;
  const result = await updateUserSettingsNotifications(
    userId,
    email_notifications,
    push_notifications,
    resource_alerts,
    weekly_digest
  );
  return successResponse(res, "User settings notifications updated successfully", result);
});

/**
 * @swagger
 * /user-settings/{userId}/privacy:
 *   patch:
 *     summary: Update user privacy settings
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               show_activity_status:
 *                 type: boolean
 *               show_profile:
 *                 type: boolean
 *               two_factor_enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User privacy settings updated
 */
export const updateUserSettingsPrivacyHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { show_activity_status, show_profile, two_factor_enabled } = req.body;
  const result = await updateUserSettingsPrivacy(
    userId,
    show_activity_status,
    show_profile,
    two_factor_enabled
  );
  return successResponse(res, "User settings privacy updated successfully", result);
});

/**
 * @swagger
 * /user-settings/{userId}/locale:
 *   patch:
 *     summary: Update user locale settings
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               date_format:
 *                 type: string
 *     responses:
 *       200:
 *         description: User locale settings updated
 */
export const updateUserSettingsLocaleHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { language, timezone, date_format } = req.body;
  const result = await updateUserSettingsLocale(userId, language, timezone, date_format);
  return successResponse(res, "User settings locale updated successfully", result);
});

/**
 * @swagger
 * /user-settings/{userId}:
 *   delete:
 *     summary: Delete user settings by user ID
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User settings deleted
 */
export const deleteExistingUserSettings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await deleteUserSettings(userId);
  return successResponse(res, "User settings deleted successfully");
});

/**
 * @swagger
 * /user-settings/{userId}/exists:
 *   get:
 *     summary: Check if user settings exist for user
 *     tags: [User Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Existence check result
 */
export const userSettingsExistsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await userSettingsExists(userId);
  return successResponse(res, "User settings existence checked successfully", result);
});
