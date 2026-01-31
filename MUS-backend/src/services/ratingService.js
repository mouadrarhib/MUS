import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import { getCurrentUserId } from "../middleware/auth.js";

// ============================================================================
// HELPERS
// ============================================================================
const requireUserId = (userId) => {
  if (!userId) {
    throw new Error("Missing authenticated user id");
  }
  return userId;
};

// ============================================================================
// CREATE RATING
// ============================================================================
export const createRating = async (userId, resourceId, score, comment) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.CREATE, {
    replacements: {
      user_id: effectiveUserId,
      resource_id: resourceId,
      score,
      comment: comment || null,
    },
  });
  return results;
};

// ============================================================================
// GET RATING BY USER AND RESOURCE
// ============================================================================
export const getRatingByUserResource = async (userId, resourceId) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.GET_BY_USER_RESOURCE, {
    replacements: {
      user_id: effectiveUserId,
      resource_id: resourceId,
    },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET ALL RATINGS BY RESOURCE
// ============================================================================
export const getRatingsByResource = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RATING.GET_BY_RESOURCE, {
    replacements: { resource_id: resourceId },
  });
  return results;
};

// ============================================================================
// GET ALL RATINGS BY USER
// ============================================================================
export const getRatingsByUser = async (userId) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.GET_BY_USER, {
    replacements: { user_id: effectiveUserId },
  });
  return results;
};

// ============================================================================
// UPDATE RATING
// ============================================================================
export const updateRating = async (userId, resourceId, score, comment) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.UPDATE, {
    replacements: {
      user_id: effectiveUserId,
      resource_id: resourceId,
      score,
      comment: comment || null,
    },
  });
  return results;
};

// ============================================================================
// DELETE RATING
// ============================================================================
export const deleteRating = async (userId, resourceId) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  await sequelize.query(SQL.RATING.DELETE, {
    replacements: {
      user_id: effectiveUserId,
      resource_id: resourceId,
    },
  });
};

// ============================================================================
// CHECK IF RATING EXISTS
// ============================================================================
export const ratingExists = async (userId, resourceId) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.EXISTS, {
    replacements: {
      user_id: effectiveUserId,
      resource_id: resourceId,
    },
  });
  return results.length > 0 ? results[0].sp_rating_exists : false;
};

// ============================================================================
// GET AVERAGE RATING FOR RESOURCE
// ============================================================================
export const getAverageRating = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RATING.GET_AVERAGE, {
    replacements: { resource_id: resourceId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET RATING STATISTICS FOR RESOURCE
// ============================================================================
export const getRatingStatistics = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RATING.GET_STATISTICS, {
    replacements: { resource_id: resourceId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET RESOURCES WITH RATINGS (for listing)
// ============================================================================
export const getResourcesWithRatings = async () => {
  const [results] = await sequelize.query(SQL.RATING.GET_RESOURCES_WITH_RATINGS);
  return results;
};

// ============================================================================
// GET TOP RATED RESOURCES
// ============================================================================
export const getTopRatedResources = async (limit = 10, minRatings = 5) => {
  const [results] = await sequelize.query(SQL.RATING.GET_TOP_RATED, {
    replacements: { limit, min_ratings: minRatings },
  });
  return results;
};

// ============================================================================
// GET RECENT RATINGS
// ============================================================================
export const getRecentRatings = async (limit = 10) => {
  const [results] = await sequelize.query(SQL.RATING.GET_RECENT, {
    replacements: { limit },
  });
  return results;
};

// ============================================================================
// GET RATINGS BY SCORE
// ============================================================================
export const getRatingsByScore = async (resourceId, score) => {
  const [results] = await sequelize.query(SQL.RATING.GET_BY_SCORE, {
    replacements: { resource_id: resourceId, score },
  });
  return results;
};

// ============================================================================
// COUNT RATINGS BY RESOURCE
// ============================================================================
export const countRatingsByResource = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RATING.COUNT_BY_RESOURCE, {
    replacements: { resource_id: resourceId },
  });
  return results.length > 0 ? results[0].sp_rating_count_by_resource : 0;
};

// ============================================================================
// COUNT RATINGS BY USER
// ============================================================================
export const countRatingsByUser = async (userId) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.COUNT_BY_USER, {
    replacements: { user_id: effectiveUserId },
  });
  return results.length > 0 ? results[0].sp_rating_count_by_user : 0;
};

// ============================================================================
// GET USER RATING SUMMARY
// ============================================================================
export const getUserRatingSummary = async (userId) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.GET_USER_SUMMARY, {
    replacements: { user_id: effectiveUserId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET RATINGS WITH COMMENTS ONLY
// ============================================================================
export const getRatingsWithComments = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RATING.GET_WITH_COMMENTS, {
    replacements: { resource_id: resourceId },
  });
  return results;
};

// ============================================================================
// UPSERT RATING (Create or Update)
// ============================================================================
export const upsertRating = async (userId, resourceId, score, comment) => {
  const effectiveUserId = requireUserId(userId || getCurrentUserId());
  const [results] = await sequelize.query(SQL.RATING.UPSERT, {
    replacements: {
      user_id: effectiveUserId,
      resource_id: resourceId,
      score,
      comment: comment || null,
    },
  });
  return results;
};

// ============================================================================
// GET RATINGS BY DATE RANGE
// ============================================================================
export const getRatingsByDateRange = async (resourceId, startDate, endDate) => {
  const [results] = await sequelize.query(SQL.RATING.GET_BY_DATE_RANGE, {
    replacements: {
      resource_id: resourceId,
      start_date: startDate,
      end_date: endDate,
    },
  });
  return results;
};

// ============================================================================
// DELETE ALL RATINGS FOR RESOURCE
// ============================================================================
export const deleteRatingsByResource = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RATING.DELETE_BY_RESOURCE, {
    replacements: { resource_id: resourceId },
  });
  return results.length > 0 ? results[0].sp_rating_delete_by_resource : 0;
};

// ============================================================================
// BUSINESS
// ============================================================================
export const validateRatingScore = (score) => {
  const numScore = parseInt(score, 10);
  if (Number.isNaN(numScore) || numScore < 1 || numScore > 5) {
    throw new Error("Score must be between 1 and 5");
  }
  return numScore;
};
