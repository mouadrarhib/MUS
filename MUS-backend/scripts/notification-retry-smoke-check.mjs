import "dotenv/config";
import { sequelize } from "../src/models/index.js";
import { SQL } from "../src/snippets/index.js";
import { runNotificationDeliveryRetryCycle } from "../src/services/notificationDeliveryService.js";

const output = [];
const push = (label, ok, detail = "") => {
  output.push({ label, ok, detail });
};

const printAndExit = async (code) => {
  console.log("NOTIFICATION_RETRY_SMOKE_START");
  for (const line of output) {
    console.log(`${line.ok ? "PASS" : "FAIL"} | ${line.label}${line.detail ? ` | ${line.detail}` : ""}`);
  }
  const failed = output.filter((l) => !l.ok).length;
  console.log("NOTIFICATION_RETRY_SMOKE_END");
  console.log(`TOTAL=${output.length} PASS=${output.length - failed} FAIL=${failed}`);
  try {
    await sequelize.close();
  } catch (_ignore) {
    // ignore close errors
  }
  process.exit(code);
};

const run = async () => {
  let notificationId = null;

  await sequelize.authenticate();
  push("db connect", true);

  const [users] = await sequelize.query(`
    SELECT u.id
    FROM public.users u
    ORDER BY u.created_at ASC
    LIMIT 1
  `);

  if (!users.length) {
    push("existing user", false, "Aucun utilisateur disponible pour le smoke test");
    return printAndExit(1);
  }

  const userId = users[0].id;
  push("existing user", true, `user_id=${userId}`);

  const [notificationRows] = await sequelize.query(SQL.NOTIFICATION.CREATE, {
    replacements: {
      recipient_user_id: userId,
      type: "system.retry.smoke",
      title: "Smoke retry",
      body: "Notification de test retry",
      payload: JSON.stringify({ source: "notification-retry-smoke" }),
    },
  });

  const notification = notificationRows[0] || null;
  if (!notification?.id) {
    push("create notification", false, "Creation notification impossible");
    return printAndExit(1);
  }

  notificationId = notification.id;
  push("create notification", true, `notification_id=${notificationId}`);

  const [deliveryRows] = await sequelize.query(SQL.NOTIFICATION.DELIVERY_CREATE, {
    replacements: {
      notification_id: notificationId,
      channel: "email",
      destination: "smoke@example.com",
      status: "failed",
      provider_message_id: null,
      error_message: "Erreur initiale smoke",
      attempts: 1,
      sent_at: null,
    },
  });

  const delivery = deliveryRows[0] || null;
  if (!delivery?.id) {
    push("create failed delivery", false, "Creation delivery impossible");
    return printAndExit(1);
  }
  push("create failed delivery", true, `delivery_id=${delivery.id}`);

  await new Promise((resolve) => setTimeout(resolve, 1200));
  push("wait retry delay", true);

  const stats = await runNotificationDeliveryRetryCycle({
    limit: 100,
    maxAttempts: 3,
    baseDelaySeconds: 1,
  });

  push("retry cycle processed", stats.processed >= 1, JSON.stringify(stats));

  const [afterRows] = await sequelize.query(`
    SELECT id, status, attempts
    FROM public.notification_deliveries
    WHERE id = :delivery_id
    LIMIT 1
  `, {
    replacements: { delivery_id: delivery.id },
  });

  const after = afterRows[0] || null;
  const statusOk = after && ["sent", "failed", "skipped"].includes(after.status);
  push("retry final status", Boolean(statusOk), after ? `status=${after.status}` : "delivery introuvable");
  push("retry attempts incremented", Boolean(after && Number(after.attempts) === 2), after ? `attempts=${after.attempts}` : "delivery introuvable");

  if (notificationId) {
    await sequelize.query(`DELETE FROM public.user_notifications WHERE id = :notification_id`, {
      replacements: { notification_id: notificationId },
    });
    push("cleanup notification", true);
  }

  const failed = output.filter((l) => !l.ok).length;
  return printAndExit(failed ? 1 : 0);
};

run().catch(async (error) => {
  push("fatal", false, String(error.message || error));
  await printAndExit(1);
});
