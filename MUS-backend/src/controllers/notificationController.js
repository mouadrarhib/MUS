import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  listNotificationsForUser,
  listPushDevices,
  markNotificationRead,
  registerPushDevice,
  unregisterPushDevice,
} from "../services/notificationService.js";
import { subscribeUserStream, unsubscribeUserStream } from "../services/notificationStreamService.js";

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notifications, realtime stream, and push device management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterPushDeviceRequest:
 *       type: object
 *       required: [device_token, platform]
 *       properties:
 *         device_token:
 *           type: string
 *           minLength: 10
 *           maxLength: 2048
 *           example: expo-token-abc1234567890
 *         platform:
 *           type: string
 *           enum: [web, android, ios]
 *         device_name:
 *           type: string
 *           example: Chrome Desktop
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: unread_only
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */

export const listNotificationsHandler = asyncHandler(async (req, res) => {
  const unreadOnly = String(req.query.unread_only || "false").toLowerCase() === "true";
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const offset = (page - 1) * limit;

  const rows = await listNotificationsForUser({
    userId: req.user.id,
    unreadOnly,
    limit,
    offset,
  });

  return successResponse(res, "Notifications recuperees avec succes", {
    page,
    limit,
    rows,
  });
});

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */

export const markNotificationReadHandler = asyncHandler(async (req, res) => {
  const notificationId = parseInt(req.params.notificationId, 10);
  const row = await markNotificationRead({
    notificationId,
    userId: req.user.id,
  });

  return successResponse(res, "Notification marquee comme lue", row);
});

/**
 * @swagger
 * /notifications/stream:
 *   get:
 *     summary: Subscribe to realtime notification stream (SSE)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: SSE stream opened
 */

export const notificationsStreamHandler = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  subscribeUserStream(req.user.id, res);

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
    } catch (_error) {
      // Ignore write failures in heartbeat loop
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribeUserStream(req.user.id, res);
  });
});

/**
 * @swagger
 * /notifications/push-devices:
 *   post:
 *     summary: Register or reactivate a push device
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterPushDeviceRequest'
 *     responses:
 *       201:
 *         description: Push device registered
 */

export const registerPushDeviceHandler = asyncHandler(async (req, res) => {
  const { device_token, platform, device_name = null } = req.body;
  const row = await registerPushDevice({
    userId: req.user.id,
    deviceToken: device_token,
    platform,
    deviceName: device_name,
  });

  return successResponse(res, "Appareil push enregistre avec succes", row, 201);
});

/**
 * @swagger
 * /notifications/push-devices/{deviceToken}:
 *   delete:
 *     summary: Deactivate a push device
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceToken
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 10
 *           maxLength: 2048
 *     responses:
 *       200:
 *         description: Push device deactivated
 *       404:
 *         description: Push device not found
 */

export const unregisterPushDeviceHandler = asyncHandler(async (req, res) => {
  const { deviceToken } = req.params;
  const row = await unregisterPushDevice({
    userId: req.user.id,
    deviceToken,
  });

  return successResponse(res, "Appareil push desactive avec succes", row);
});

/**
 * @swagger
 * /notifications/push-devices:
 *   get:
 *     summary: List push devices for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Push devices retrieved
 */

export const listPushDevicesHandler = asyncHandler(async (req, res) => {
  const activeOnly = String(req.query.active_only || "true").toLowerCase() === "true";
  const rows = await listPushDevices({
    userId: req.user.id,
    activeOnly,
  });

  return successResponse(res, "Appareils push recuperes avec succes", rows);
});
