import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import AppError from "./helpers/appError.js";
import { errorResponse } from "./helpers/response.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { publicRateLimit } from "./middleware/rateLimit.js";

const app = express();

const rawOrigins = process.env.CLIENT_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // allow cookies/authorization headers
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(publicRateLimit);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

app.use((req, _res, next) => next(new AppError(`Not Found: ${req.path}`, 404)));

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Unexpected error";
  return errorResponse(res, message, status);
});

export default app;
