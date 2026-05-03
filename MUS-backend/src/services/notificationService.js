import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import AppError from "../helpers/appError.js";
import { publishUserEvent } from "./notificationStreamService.js";
import { dispatchExternalNotification } from "./notificationDeliveryService.js";

export const createNotification = async ({ recipientUserId, type, title, body, payload = null }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.CREATE, {
    replacements: {
      recipient_user_id: recipientUserId,
      type,
      title,
      body,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });

  const created = rows[0] || null;
  if (created) {
    publishUserEvent(recipientUserId, created, "notification");
    Promise.resolve(dispatchExternalNotification(created)).catch(() => {
      // Best effort external delivery
    });
  }

  return created;
};

export const createNotificationsBulk = async (items = []) => {
  const results = [];
  for (const item of items) {
    if (!item?.recipientUserId) continue;
    // sequential on purpose to keep deterministic order
    // and to avoid overwhelming DB for small batches
    const created = await createNotification(item);
    if (created) results.push(created);
  }
  return results;
};

export const listNotificationsForUser = async ({ userId, unreadOnly = false, limit = 20, offset = 0 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const [rows] = await sequelize.query(
    `
    SELECT *
    FROM public.user_notifications
    WHERE recipient_user_id = :recipient_user_id
      AND is_cleared = false
      AND (:unread_only::boolean = false OR is_read = false)
    ORDER BY created_at DESC
    LIMIT :limit_value OFFSET :offset_value
    `,
    {
      replacements: {
        recipient_user_id: userId,
        unread_only: Boolean(unreadOnly),
        limit_value: safeLimit,
        offset_value: safeOffset,
      },
    }
  );

  return rows;
};

export const markNotificationRead = async ({ notificationId, userId }) => {
  const [rows] = await sequelize.query(
    `
    UPDATE public.user_notifications
    SET is_read = true,
        read_at = COALESCE(read_at, NOW())
    WHERE id = :notification_id
      AND recipient_user_id = :recipient_user_id
      AND is_cleared = false
    RETURNING *
    `,
    {
      replacements: {
        notification_id: notificationId,
        recipient_user_id: userId,
      },
    }
  );

  if (!rows.length) {
    throw new AppError("Notification introuvable", 404);
  }

  return rows[0];
};

export const clearNotificationsForUser = async ({ userId }) => {
  const [rows] = await sequelize.query(
    `
    UPDATE public.user_notifications
    SET is_cleared = true
    WHERE recipient_user_id = :recipient_user_id
      AND is_cleared = false
    RETURNING id
    `,
    {
      replacements: {
        recipient_user_id: userId,
      },
    }
  );

  return {
    cleared_count: Array.isArray(rows) ? rows.length : 0,
  };
};

export const registerPushDevice = async ({ userId, deviceToken, platform, deviceName = null }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.REGISTER_PUSH_DEVICE, {
    replacements: {
      user_id: userId,
      device_token: deviceToken,
      platform,
      device_name: deviceName,
    },
  });

  return rows[0] || null;
};

export const unregisterPushDevice = async ({ userId, deviceToken }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.UNREGISTER_PUSH_DEVICE, {
    replacements: {
      user_id: userId,
      device_token: deviceToken,
    },
  });

  if (!rows.length) {
    throw new AppError("Appareil push introuvable", 404);
  }

  return rows[0];
};

export const listPushDevices = async ({ userId, activeOnly = true }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.LIST_PUSH_DEVICES, {
    replacements: {
      user_id: userId,
      active_only: Boolean(activeOnly),
    },
  });

  return rows;
};
