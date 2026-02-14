import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import AppError from "../helpers/appError.js";

const pickScalar = (row, preferredKey = null) => {
  if (!row || typeof row !== "object") return null;
  if (preferredKey && Object.prototype.hasOwnProperty.call(row, preferredKey)) {
    return row[preferredKey];
  }

  const values = Object.values(row);
  return values.length ? values[0] : null;
};

const canAccessResourceForFavorite = async (resourceId, actor = null) => {
  const [resources] = await sequelize.query(
    `SELECT id, status::text AS status, created_by FROM public.resources WHERE id = :resource_id LIMIT 1`,
    { replacements: { resource_id: resourceId } }
  );

  if (!resources.length) {
    throw new AppError("Resource not found", 404);
  }

  const resource = resources[0];
  const roles = actor?.roles || [];
  const isAdmin = roles.includes("admin");
  const isOwner = actor?.id && resource.created_by === actor.id;
  const isPublished = String(resource.status || "").toLowerCase() === "published";

  if (!isAdmin && !isOwner && !isPublished) {
    throw new AppError("Resource not found", 404);
  }
};

/**
 * Add a resource to user's favorites
 */
export const addFavorite = async (userId, resourceId, actor = null) => {
  await canAccessResourceForFavorite(resourceId, actor);

  const [results] = await sequelize.query(SQL.FAVORITE.ADD, {
    replacements: {
      user_id: userId,
      resource_id: resourceId,
    },
  });
  return results[0];
};

/**
 * Remove a resource from user's favorites
 */
export const removeFavorite = async (userId, resourceId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.REMOVE, {
    replacements: {
      user_id: userId,
      resource_id: resourceId,
    },
  });
  return Boolean(pickScalar(results[0], "sp_favorite_remove"));
};

/**
 * Check if a resource is in user's favorites
 */
export const checkFavoriteExists = async (userId, resourceId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.EXISTS, {
    replacements: {
      user_id: userId,
      resource_id: resourceId,
    },
  });
  return Boolean(pickScalar(results[0], "sp_favorite_exists"));
};

/**
 * Get all favorites for a user
 */
export const getUserFavorites = async (userId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_BY_USER, {
    replacements: {
      user_id: userId,
    },
  });
  return results;
};

/**
 * Get user favorites filtered by status
 */
export const getUserFavoritesByStatus = async (userId, status) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_BY_USER_STATUS, {
    replacements: {
      user_id: userId,
      status: status,
    },
  });
  return results;
};

/**
 * Get user favorites filtered by educational type
 */
export const getUserFavoritesByEducationalType = async (userId, educationalType) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_BY_USER_EDUCATIONAL_TYPE, {
    replacements: {
      user_id: userId,
      educational_type: educationalType,
    },
  });
  return results;
};

/**
 * Get user favorites filtered by format
 */
export const getUserFavoritesByFormat = async (userId, format) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_BY_USER_FORMAT, {
    replacements: {
      user_id: userId,
      format: format,
    },
  });
  return results;
};

/**
 * Count total favorites for a user
 */
export const countUserFavorites = async (userId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.COUNT_BY_USER, {
    replacements: {
      user_id: userId,
    },
  });
  return Number(pickScalar(results[0], "sp_favorite_count_by_user") || 0);
};

/**
 * Count how many users favorited a resource
 */
export const countResourceFavorites = async (resourceId, actor = null) => {
  await canAccessResourceForFavorite(resourceId, actor);

  const [results] = await sequelize.query(SQL.FAVORITE.COUNT_BY_RESOURCE, {
    replacements: {
      resource_id: resourceId,
    },
  });
  return Number(pickScalar(results[0], "sp_favorite_count_by_resource") || 0);
};

/**
 * Get most favorited resources
 */
export const getMostPopularFavorites = async (limit = 10) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_MOST_POPULAR, {
    replacements: {
      limit: limit,
    },
  });
  return results;
};

/**
 * Get user's recent favorites
 */
export const getRecentUserFavorites = async (userId, limit = 10) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_RECENT_BY_USER, {
    replacements: {
      user_id: userId,
      limit: limit,
    },
  });
  return results;
};

/**
 * Remove all favorites for a user
 */
export const removeAllUserFavorites = async (userId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.REMOVE_ALL_BY_USER, {
    replacements: {
      user_id: userId,
    },
  });
  return Number(pickScalar(results[0], "sp_favorite_remove_all_by_user") || 0);
};

/**
 * Get user favorite statistics
 */
export const getUserFavoriteStatistics = async (userId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_USER_STATISTICS, {
    replacements: {
      user_id: userId,
    },
  });
  return results[0];
};

/**
 * Search in user's favorites
 */
export const searchUserFavorites = async (userId, searchTerm) => {
  const [results] = await sequelize.query(SQL.FAVORITE.SEARCH_BY_USER, {
    replacements: {
      user_id: userId,
      search_term: searchTerm,
    },
  });
  return results;
};

/**
 * Toggle favorite (add or remove)
 */
export const toggleFavorite = async (userId, resourceId, actor = null) => {
  await canAccessResourceForFavorite(resourceId, actor);

  const [results] = await sequelize.query(SQL.FAVORITE.TOGGLE, {
    replacements: {
      user_id: userId,
      resource_id: resourceId,
    },
  });
  return results[0];
};

/**
 * Get users who favorited a resource
 */
export const getUsersByResourceFavorite = async (resourceId) => {
  const [results] = await sequelize.query(SQL.FAVORITE.GET_USERS_BY_RESOURCE, {
    replacements: {
      resource_id: resourceId,
    },
  });
  return results;
};
