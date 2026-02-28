import nodemailer from "nodemailer";
import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

let mailTransporter = null;

const hasEmailConfig = () => {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_FROM);
};

const getMailTransporter = () => {
  if (!hasEmailConfig()) return null;
  if (mailTransporter) return mailTransporter;

  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  return mailTransporter;
};

const normalizePayload = (payload) => {
  if (!payload) return null;
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch (_error) {
      return null;
    }
  }
  return payload;
};

const createDelivery = async ({ notificationId, channel, destination = null, status = "pending", providerMessageId = null, errorMessage = null, attempts = 1, sentAt = null }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.DELIVERY_CREATE, {
    replacements: {
      notification_id: notificationId,
      channel,
      destination,
      status,
      provider_message_id: providerMessageId,
      error_message: errorMessage,
      attempts,
      sent_at: sentAt,
    },
  });

  return rows[0] || null;
};

const updateDelivery = async ({ deliveryId, status, providerMessageId = null, errorMessage = null, sentAt = null }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.DELIVERY_UPDATE_STATUS, {
    replacements: {
      delivery_id: deliveryId,
      status,
      provider_message_id: providerMessageId,
      error_message: errorMessage,
      sent_at: sentAt,
    },
  });

  return rows[0] || null;
};

const getPreferences = async (userId) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.GET_USER_PREFERENCES, {
    replacements: { user_id: userId },
  });
  return rows[0] || null;
};

const getPushDevices = async (userId) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.LIST_PUSH_DEVICES, {
    replacements: { user_id: userId, active_only: true },
  });
  return rows;
};

const sendEmailDelivery = async ({ notification, preferences, deliveryId, destination }) => {
  if (!preferences?.email_notifications) {
    await updateDelivery({
      deliveryId,
      status: "skipped",
      errorMessage: "email_notifications desactive",
    });
    return "skipped";
  }

  const transporter = getMailTransporter();
  if (!transporter) {
    await updateDelivery({
      deliveryId,
      status: "skipped",
      errorMessage: "SMTP non configure",
    });
    return "skipped";
  }

  if (!destination) {
    await updateDelivery({
      deliveryId,
      status: "skipped",
      errorMessage: "Email destinataire introuvable",
    });
    return "skipped";
  }

  try {
    const sent = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: destination,
      subject: notification.title,
      text: notification.body,
      html: `<p>${notification.body}</p>`,
    });

    await updateDelivery({
      deliveryId,
      status: "sent",
      providerMessageId: sent.messageId || null,
      sentAt: new Date(),
    });
    return "sent";
  } catch (error) {
    await updateDelivery({
      deliveryId,
      status: "failed",
      errorMessage: String(error.message || "Erreur email"),
    });
    return "failed";
  }
};

const sendPushDelivery = async ({ notification, preferences, deliveryId }) => {
  if (!preferences?.push_notifications) {
    await updateDelivery({
      deliveryId,
      status: "skipped",
      errorMessage: "push_notifications desactive",
    });
    return "skipped";
  }

  const devices = await getPushDevices(notification.recipient_user_id);
  if (!devices.length) {
    await updateDelivery({
      deliveryId,
      status: "skipped",
      errorMessage: "Aucun device push actif",
    });
    return "skipped";
  }

  const pushGatewayUrl = process.env.PUSH_GATEWAY_URL;
  if (!pushGatewayUrl) {
    await updateDelivery({
      deliveryId,
      status: "skipped",
      errorMessage: "PUSH_GATEWAY_URL non configure",
    });
    return "skipped";
  }

  try {
    const res = await fetch(pushGatewayUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.PUSH_GATEWAY_TOKEN
          ? { authorization: `Bearer ${process.env.PUSH_GATEWAY_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        user_id: notification.recipient_user_id,
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          payload: notification.payload,
        },
        devices: devices.map((d) => ({ token: d.device_token, platform: d.platform })),
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      await updateDelivery({
        deliveryId,
        status: "failed",
        errorMessage: `Push gateway error ${res.status}: ${txt}`,
      });
      return "failed";
    }

    await updateDelivery({
      deliveryId,
      status: "sent",
      sentAt: new Date(),
    });
    return "sent";
  } catch (error) {
    await updateDelivery({
      deliveryId,
      status: "failed",
      errorMessage: String(error.message || "Erreur push"),
    });
    return "failed";
  }
};

const sendEmailChannel = async ({ notification, preferences }) => {
  const destination = preferences?.email || null;
  const delivery = await createDelivery({
    notificationId: notification.id,
    channel: "email",
    destination,
    status: "pending",
  });
  if (!delivery?.id) return;

  await sendEmailDelivery({
    notification,
    preferences,
    deliveryId: delivery.id,
    destination,
  });
};

const sendPushChannel = async ({ notification, preferences }) => {
  const delivery = await createDelivery({
    notificationId: notification.id,
    channel: "push",
    destination: notification.recipient_user_id,
    status: "pending",
  });
  if (!delivery?.id) return;

  await sendPushDelivery({
    notification,
    preferences,
    deliveryId: delivery.id,
  });
};

const deliverPreparedRetry = async ({ row, preferences }) => {
  const notification = {
    id: row.notification_id,
    recipient_user_id: row.recipient_user_id,
    type: row.notification_type,
    title: row.title,
    body: row.body,
    payload: normalizePayload(row.payload),
  };

  if (row.channel === "email") {
    return sendEmailDelivery({
      notification,
      preferences,
      deliveryId: row.delivery_id,
      destination: row.destination || preferences?.email || null,
    });
  }

  if (row.channel === "push") {
    return sendPushDelivery({
      notification,
      preferences,
      deliveryId: row.delivery_id,
    });
  }

  await updateDelivery({
    deliveryId: row.delivery_id,
    status: "failed",
    errorMessage: `Canal inconnu: ${row.channel}`,
  });
  return "failed";
};

export const dispatchExternalNotification = async (notification) => {
  if (!notification?.id || !notification?.recipient_user_id) return;

  const preferences = await getPreferences(notification.recipient_user_id);
  if (!preferences) return;

  await sendEmailChannel({ notification, preferences });
  await sendPushChannel({ notification, preferences });
};

const prepareRetryDelivery = async ({ deliveryId, maxAttempts }) => {
  const [rows] = await sequelize.query(SQL.NOTIFICATION.DELIVERY_PREPARE_RETRY, {
    replacements: {
      delivery_id: deliveryId,
      max_attempts: maxAttempts,
    },
  });
  return rows[0] || null;
};

export const runNotificationDeliveryRetryCycle = async ({
  limit = Number(process.env.NOTIFICATION_RETRY_BATCH_SIZE || 25),
  maxAttempts = Number(process.env.NOTIFICATION_RETRY_MAX_ATTEMPTS || 5),
  baseDelaySeconds = Number(process.env.NOTIFICATION_RETRY_BASE_DELAY_SECONDS || 60),
} = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
  const safeMaxAttempts = Math.max(Number(maxAttempts) || 5, 1);
  const safeBaseDelaySeconds = Math.max(Number(baseDelaySeconds) || 60, 1);

  const [candidates] = await sequelize.query(SQL.NOTIFICATION.DELIVERY_GET_RETRY_CANDIDATES, {
    replacements: {
      limit_value: safeLimit,
      max_attempts: safeMaxAttempts,
      base_delay_seconds: safeBaseDelaySeconds,
    },
  });

  const stats = {
    scanned: candidates.length,
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  for (const row of candidates) {
    const prepared = await prepareRetryDelivery({
      deliveryId: row.delivery_id,
      maxAttempts: safeMaxAttempts,
    });

    if (!prepared) continue;

    stats.processed += 1;

    try {
      const preferences = await getPreferences(row.recipient_user_id);
      if (!preferences) {
        await updateDelivery({
          deliveryId: row.delivery_id,
          status: "skipped",
          errorMessage: "Preferences utilisateur introuvables",
        });
        stats.skipped += 1;
        continue;
      }

      const status = await deliverPreparedRetry({ row, preferences });
      if (status === "sent") stats.sent += 1;
      else if (status === "skipped") stats.skipped += 1;
      else stats.failed += 1;
    } catch (error) {
      await updateDelivery({
        deliveryId: row.delivery_id,
        status: "failed",
        errorMessage: String(error.message || "Erreur retry notification"),
      });
      stats.failed += 1;
    }
  }

  return stats;
};
