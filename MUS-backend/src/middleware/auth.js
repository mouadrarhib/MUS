import { verifyToken } from "../utils/jwt.js";
import AppError from "../helpers/appError.js";
import { storage } from "../helpers/storage.js";

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    return next(new AppError("Authorization token missing", 401));
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded.sub) {
      return next(new AppError("Invalid token payload", 401));
    }

    storage.run({ user: decoded }, () => {
      req.user = {
        id: decoded.sub,
        roles: decoded.roles || [],
        iat: decoded.iat,
        exp: decoded.exp,
      };
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

export const getCurrentUser = () => {
  const store = storage.getStore();
  return store?.user;
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.sub;
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
