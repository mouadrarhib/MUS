import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import AppError from "./helpers/appError.js";
import { errorResponse } from "./helpers/response.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

//test
// test jgfgfj
//hjgjh
//ererer
//hjgjhgjhgjh
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true, // reflect request origin by default
    credentials: true, // allow cookies/authorization headers
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Serve raw OpenAPI JSON (useful for Postman import)
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
