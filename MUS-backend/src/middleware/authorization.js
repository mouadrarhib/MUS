import AppError from "../helpers/appError.js";
import { getCurrentUser } from "./auth.js";

/**
 * Vérifie si l'utilisateur a au moins un des rôles requis
 */
export const requireRole = (...allowedRoles) => {
return (req, res, next) => {
    const user = getCurrentUser();
    
    if (!user) {
        return next(new AppError("Authentication required", 401));
    }

    const userRoles = user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
        return next(
        new AppError(
            `Access denied. Required roles: ${allowedRoles.join(" or ")}`,
            403
        ));
    }

    req.userRoles = userRoles;
    next();
  };
};

/**
 * Vérifie si l'utilisateur est admin
 */
export const requireAdmin = requireRole("admin");

/**
 * Vérifie si l'utilisateur est student
 */
export const requireStudent = requireRole("student");

/**
 * Vérifie si l'utilisateur est propriétaire OU admin
 */
export const requireOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    const user = getCurrentUser();
    
    if (!user) {
      return next(new AppError("Authentication required", 401));
    }

    const userRoles = user.roles || [];
    const isAdmin = userRoles.includes("admin");

    if (isAdmin) {
      req.isAdmin = true;
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId) {
        return next(new AppError("Resource not found", 404));
      }
      
      if (user.sub === ownerId) {
        req.isOwner = true;
        return next();
      }

      return next(new AppError("Access denied. You don't own this resource", 403));
    } catch (error) {
      return next(error);
    }
  };
};
