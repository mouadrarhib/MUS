import "dotenv/config";
import app from "./src/app.js";
import { sequelize } from "./src/models/index.js";
import { startNotificationRetryWorker, stopNotificationRetryWorker } from "./src/services/notificationRetryWorkerService.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to Postgres with Sequelize");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;
  const rawRailwayUrl = String(process.env.RAILWAY_STATIC_URL || "").trim();
  const publicBaseUrl = rawRailwayUrl
    ? rawRailwayUrl.startsWith("http://") || rawRailwayUrl.startsWith("https://")
      ? rawRailwayUrl
      : `https://${rawRailwayUrl}`
    : null;

  app.listen(PORT, "0.0.0.0", () => {
    startNotificationRetryWorker();
    console.log(`API running on port ${PORT}`);
    if (publicBaseUrl) {
      console.log(`Public URL: ${publicBaseUrl}`);
      console.log(`Swagger docs: ${publicBaseUrl}/api/docs`);
      console.log(`Swagger JSON (for Postman import): ${publicBaseUrl}/api/docs.json`);
    } else {
      console.log(`Swagger docs: /api/docs`);
      console.log(`Swagger JSON (for Postman import): /api/docs.json`);
    }
  });
};

process.on("SIGINT", () => {
  stopNotificationRetryWorker();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopNotificationRetryWorker();
  process.exit(0);
});

startServer();
