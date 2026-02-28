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

export const markNotificationReadHandler = asyncHandler(async (req, res) => {
  const notificationId = parseInt(req.params.notificationId, 10);
  const row = await markNotificationRead({
    notificationId,
    userId: req.user.id,
  });

  return successResponse(res, "Notification marquee comme lue", row);
});

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

export const unregisterPushDeviceHandler = asyncHandler(async (req, res) => {
  const { deviceToken } = req.params;
  const row = await unregisterPushDevice({
    userId: req.user.id,
    deviceToken,
  });

  return successResponse(res, "Appareil push desactive avec succes", row);
});

export const listPushDevicesHandler = asyncHandler(async (req, res) => {
  const activeOnly = String(req.query.active_only || "true").toLowerCase() === "true";
  const rows = await listPushDevices({
    userId: req.user.id,
    activeOnly,
  });

  return successResponse(res, "Appareils push recuperes avec succes", rows);
});
