import { verifyToken } from "../utils/jwt.js";
import AppError from "../helpers/appError.js";
import { storage } from "../helpers/storage.js";

const authMiddleware = (req, _res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return next(new AppError("Authorization token missing", 401));
  }

  try {
    const decoded = verifyToken(token);
    storage.run({ user: decoded }, () => {
      req.user = decoded;
      return next();
    });
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const getCurrentUser = () => {
  const store = storage.getStore();
  return store?.user;
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.sub;
};

export default authMiddleware;
