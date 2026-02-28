import rateLimit from "express-rate-limit";

const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const publicRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_PUBLIC_PER_MIN || 100),
  message: "Trop de requetes. Veuillez reessayer plus tard.",
  skip: (req) => req.path.startsWith("/api/admin"),
});

export const authRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_PER_15MIN || 5),
  message: "Trop de tentatives d'authentification. Veuillez reessayer plus tard.",
});

export const registerRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REGISTER_PER_HOUR || 3),
  message: "Trop de tentatives d'inscription. Veuillez reessayer plus tard.",
});

export const forgotPasswordRateLimit = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_FORGOT_PER_HOUR || 3),
  message: "Trop de demandes de reinitialisation de mot de passe. Veuillez reessayer plus tard.",
});
