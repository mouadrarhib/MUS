import { Router } from "express";
import { body, param, query } from "express-validator";
import validateRequest from "./validateRequest.js";
import {
  clearNotificationsHandler,
  listNotificationsHandler,
  listPushDevicesHandler,
  markNotificationReadHandler,
  notificationsStreamHandler,
  registerPushDeviceHandler,
  unregisterPushDeviceHandler,
} from "../controllers/notificationController.js";

const router = Router();

router.get(
  "/notifications",
  [
    query("unread_only").optional().isBoolean().withMessage("unread_only doit etre un booleen"),
    query("page").optional().isInt({ min: 1 }).withMessage("page invalide"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit doit etre entre 1 et 100"),
  ],
  validateRequest,
  listNotificationsHandler
);

router.patch(
  "/notifications/clear",
  clearNotificationsHandler
);

router.patch(
  "/notifications/:notificationId/read",
  [param("notificationId").isInt({ min: 1 }).withMessage("ID notification invalide")],
  validateRequest,
  markNotificationReadHandler
);

router.get("/notifications/stream", notificationsStreamHandler);

router.post(
  "/notifications/push-devices",
  [
    body("device_token").isString().trim().isLength({ min: 10, max: 2048 }).withMessage("device_token invalide"),
    body("platform").isIn(["web", "android", "ios"]).withMessage("platform invalide"),
    body("device_name").optional({ nullable: true }).isString().isLength({ min: 1, max: 200 }),
  ],
  validateRequest,
  registerPushDeviceHandler
);

router.delete(
  "/notifications/push-devices/:deviceToken",
  [param("deviceToken").isString().trim().isLength({ min: 10, max: 2048 }).withMessage("deviceToken invalide")],
  validateRequest,
  unregisterPushDeviceHandler
);

router.get(
  "/notifications/push-devices",
  [query("active_only").optional().isBoolean().withMessage("active_only doit etre un booleen")],
  validateRequest,
  listPushDevicesHandler
);

export default router;
