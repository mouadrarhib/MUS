import { verifyToken } from "../utils/jwt.js";
import AppError from "../helpers/appError.js";
import { storage } from "../helpers/storage.js";

const authMiddleware = (req, res, next) => {
  const bearer = req.headers?.authorization;
  const bearerToken = typeof bearer === "string" && bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : null;
  const token = req.cookies?.auth_token || bearerToken;

  if (!token) {
    return next(new AppError("Authorization token missing", 401));
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded.sub) {
      return next(new AppError("Invalid token payload", 401));
    }

    const normalizedUser = {
      id: decoded.sub,
      roles: decoded.roles || [],
      iat: decoded.iat,
      exp: decoded.exp,
    };

    storage.run({ user: normalizedUser }, () => {
      req.user = normalizedUser;
      return next();
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired", 401));
    }
    
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }
    
    return next(new AppError("Authentication failed", 401));
  }
};

export const optionalAuthMiddleware = (req, _res, next) => {
  const bearer = req.headers?.authorization;
  const bearerToken = typeof bearer === "string" && bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : null;
  const token = req.cookies?.auth_token || bearerToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.sub) {
      return next();
    }

    const normalizedUser = {
      id: decoded.sub,
      roles: decoded.roles || [],
      iat: decoded.iat,
      exp: decoded.exp,
    };

    storage.run({ user: normalizedUser }, () => {
      req.user = normalizedUser;
      return next();
    });
  } catch (_error) {
    return next();
  }
};

export const getCurrentUser = () => {
  const store = storage.getStore();
  return store?.user;
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || user?.sub;
};

export const getCurrentUserRoles = () => {
  const user = getCurrentUser();
  return user?.roles || [];
};

export const hasRole = (role) => {
  const roles = getCurrentUserRoles();
  return roles.includes(role);
};

export const isAdmin = () => {
  return hasRole("admin");
};

export const isStudent = () => {
  return hasRole("student");
};

export default authMiddleware;
