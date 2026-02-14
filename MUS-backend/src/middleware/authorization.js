import AppError from "../helpers/appError.js";

const getUserFromReq = (req) => req.user;

export const requireAuth = (req, _res, next) => {
  const user = getUserFromReq(req);
  if (!user?.id) {
    return next(new AppError("Authentication required", 401));
  }
  return next();
};

export const requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    const user = getUserFromReq(req);
    if (!user?.id) {
      return next(new AppError("Authentication required", 401));
    }

    const userRoles = user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return next(new AppError(`Access denied. Required role: ${allowedRoles.join(" or ")}`, 403));
    }

    return next();
  };
};

export const requireAnyRole = (roles = []) => requireRole(...roles);

export const requireSelfOrAdmin = (paramName = "userId") => {
  return (req, _res, next) => {
    const user = getUserFromReq(req);
    if (!user?.id) {
      return next(new AppError("Authentication required", 401));
    }

    const targetUserId = req.params?.[paramName] || req.body?.[paramName];
    const isAdmin = (user.roles || []).includes("admin");
    if (isAdmin || targetUserId === user.id) {
      return next();
    }

    return next(new AppError("Access denied", 403));
  };
};

export const requireOwnerOrAdmin = (getOwnerIdFn) => {
  return async (req, _res, next) => {
    try {
      const user = getUserFromReq(req);
      if (!user?.id) {
        return next(new AppError("Authentication required", 401));
      }

      if ((user.roles || []).includes("admin")) {
        return next();
      }

      const ownerId = await getOwnerIdFn(req);
      if (!ownerId) {
        return next(new AppError("Resource not found", 404));
      }

      if (ownerId !== user.id) {
        return next(new AppError("Access denied", 403));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const requirePublishedOrOwnerOrAdmin = (getResourceFn) => {
  return async (req, _res, next) => {
    try {
      const resource = await getResourceFn(req);
      if (!resource) {
        return next(new AppError("Resource not found", 404));
      }

      if (String(resource.status || "").toLowerCase() === "published") {
        return next();
      }

      const user = getUserFromReq(req);
      const isAdmin = (user?.roles || []).includes("admin");
      const isOwner = user?.id && resource.created_by === user.id;
      if (isAdmin || isOwner) {
        return next();
      }

      return next(new AppError("Resource not found", 404));
    } catch (error) {
      return next(error);
    }
  };
};

export const requireAdmin = requireRole("admin");
export const requireStudent = requireRole("student");
