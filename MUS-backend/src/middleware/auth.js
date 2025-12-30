import { verifyToken } from "../utils/jwt.js";
import AppError from "../helpers/appError.js";

const authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken = req.cookies?.auth_token || null;
  const token = bearerToken || cookieToken;

  if (!token) {
    return next(new AppError("Authorization token missing", 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export default authMiddleware;
