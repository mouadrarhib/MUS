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

const normalizeOrigin = (origin = "") => {
  try {
    const parsed = new URL(origin);
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch (_error) {
    return null;
  }
};

const parseCorsOrigins = () => {
  const envOrigins = process.env.CLIENT_ORIGIN;
  if (!envOrigins) {
    return new Set();
  }

  const configured = envOrigins
    .split(",")
    .map((origin) => origin.trim())
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  return new Set(configured);
};

const allowedOrigins = parseCorsOrigins();

const corsOptionsDelegate = (req, callback) => {
  const requestOrigin = normalizeOrigin(req.headers.origin || "");

  if (!requestOrigin) {
    return callback(null, { credentials: true, origin: true });
  }

  const serverOrigin = normalizeOrigin(`${req.protocol}://${req.get("host")}`);
  const isSameOrigin = serverOrigin && requestOrigin === serverOrigin;
  const isAllowed = allowedOrigins.has(requestOrigin);

  if (isSameOrigin || isAllowed) {
    return callback(null, { credentials: true, origin: true });
  }

  return callback(new AppError("CORS origin not allowed", 403));
};

app.use(helmet());
app.use(cors(corsOptionsDelegate));
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
