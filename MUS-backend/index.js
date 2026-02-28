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
  app.listen(PORT, () => {
    startNotificationRetryWorker();
    console.log(`API running on http://localhost:${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
    console.log(`Swagger JSON (for Postman import): http://localhost:${PORT}/api/docs.json`);
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
