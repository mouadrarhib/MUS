import { runNotificationDeliveryRetryCycle } from "./notificationDeliveryService.js";

let retryInterval = null;
let isRunning = false;

const parseBoolean = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  return String(value).toLowerCase() === "true";
};

const runRetryCycleSafely = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const stats = await runNotificationDeliveryRetryCycle();
    if (stats.processed > 0) {
      console.log(
        `[notification-retry] scanned=${stats.scanned} processed=${stats.processed} sent=${stats.sent} failed=${stats.failed} skipped=${stats.skipped}`
      );
    }
  } catch (error) {
    console.error("[notification-retry] cycle failed:", error.message || error);
  } finally {
    isRunning = false;
  }
};

export const startNotificationRetryWorker = () => {
  const enabled = parseBoolean(process.env.NOTIFICATION_RETRY_ENABLED, true);
  if (!enabled) return;

  if (retryInterval) return;

  const intervalMs = Math.max(Number(process.env.NOTIFICATION_RETRY_INTERVAL_MS || 30000) || 30000, 5000);
  const runOnStart = parseBoolean(process.env.NOTIFICATION_RETRY_RUN_ON_START, true);

  if (runOnStart) {
    void runRetryCycleSafely();
  }

  retryInterval = setInterval(() => {
    void runRetryCycleSafely();
  }, intervalMs);
};

export const stopNotificationRetryWorker = () => {
  if (!retryInterval) return;
  clearInterval(retryInterval);
  retryInterval = null;
};
