import { Router } from "express";
import { body, param } from "express-validator";
import {
  addUserSettings,
  getUserSettings,
  updateExistingUserSettings,
  updateUserSettingsAppearanceHandler,
  updateUserSettingsNotificationsHandler,
  updateUserSettingsPrivacyHandler,
  updateUserSettingsLocaleHandler,
  deleteExistingUserSettings,
  userSettingsExistsHandler,
} from "../controllers/userSettingsController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireSelfOrAdmin } from "../middleware/authorization.js";

const router = Router();
router.use(authMiddleware);

router.post(
  "/",
  requireSelfOrAdmin("user_id"),
  [
    body("user_id").isUUID().withMessage("Valid user UUID is required"),
    body("theme_mode").optional().isString(),
    body("font_size").optional().isString(),
    body("language").optional().isString(),
    body("timezone").optional().isString(),
    body("date_format").optional().isString(),
    body("email_notifications").optional().isBoolean(),
    body("push_notifications").optional().isBoolean(),
    body("resource_alerts").optional().isBoolean(),
    body("weekly_digest").optional().isBoolean(),
    body("show_activity_status").optional().isBoolean(),
    body("show_profile").optional().isBoolean(),
    body("two_factor_enabled").optional().isBoolean(),
  ],
  validateRequest,
  addUserSettings
);

router.get(
  "/:userId",
  requireSelfOrAdmin("userId"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  getUserSettings
);

router.patch(
  "/:userId",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("theme_mode").optional().isString(),
    body("font_size").optional().isString(),
    body("language").optional().isString(),
    body("timezone").optional().isString(),
    body("date_format").optional().isString(),
    body("email_notifications").optional().isBoolean(),
    body("push_notifications").optional().isBoolean(),
    body("resource_alerts").optional().isBoolean(),
    body("weekly_digest").optional().isBoolean(),
    body("show_activity_status").optional().isBoolean(),
    body("show_profile").optional().isBoolean(),
    body("two_factor_enabled").optional().isBoolean(),
  ],
  validateRequest,
  updateExistingUserSettings
);

router.patch(
  "/:userId/appearance",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("theme_mode").optional().isString(),
    body("font_size").optional().isString(),
  ],
  validateRequest,
  updateUserSettingsAppearanceHandler
);

router.patch(
  "/:userId/notifications",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("email_notifications").optional().isBoolean(),
    body("push_notifications").optional().isBoolean(),
    body("resource_alerts").optional().isBoolean(),
    body("weekly_digest").optional().isBoolean(),
  ],
  validateRequest,
  updateUserSettingsNotificationsHandler
);

router.patch(
  "/:userId/privacy",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("show_activity_status").optional().isBoolean(),
    body("show_profile").optional().isBoolean(),
    body("two_factor_enabled").optional().isBoolean(),
  ],
  validateRequest,
  updateUserSettingsPrivacyHandler
);

router.patch(
  "/:userId/locale",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("language").optional().isString(),
    body("timezone").optional().isString(),
    body("date_format").optional().isString(),
  ],
  validateRequest,
  updateUserSettingsLocaleHandler
);

router.delete(
  "/:userId",
  requireSelfOrAdmin("userId"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  deleteExistingUserSettings
);

router.get(
  "/:userId/exists",
  requireSelfOrAdmin("userId"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  userSettingsExistsHandler
);

export default router;
