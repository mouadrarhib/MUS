import rateLimit from "express-rate-limit";

const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const publicRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PUBLIC_PER_MIN || 100),
  message: "Too many requests. Please try again later.",
  skip: (req) => req.path.startsWith("/api/admin"),
});

export const authRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_PER_15MIN || 5),
  message: "Too many authentication attempts. Please try again later.",
});

export const registerRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REGISTER_PER_HOUR || 3),
  message: "Too many registration attempts. Please try again later.",
});

export const forgotPasswordRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_FORGOT_PER_HOUR || 3),
  message: "Too many password reset requests. Please try again later.",
});
