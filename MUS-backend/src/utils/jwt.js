import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProduction) {
      throw new Error("JWT_SECRET is required in production");
    }
    return "change_me";
  }

  if (isProduction && secret === "change_me") {
    throw new Error("JWT_SECRET must not use default value in production");
  }

  return secret;
};

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "1h";

export const generateToken = (payload, options = {}) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn(), ...options });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());
