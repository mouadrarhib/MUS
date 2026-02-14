import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import { getCurrentUserId } from "../middleware/auth.js";
import {
  addFavorite,
  removeFavorite,
  checkFavoriteExists,
  getUserFavorites,
  getUserFavoritesByStatus,
  getUserFavoritesByEducationalType,
  getUserFavoritesByFormat,
  countUserFavorites,
  countResourceFavorites,
  getMostPopularFavorites,
  getRecentUserFavorites,
  removeAllUserFavorites,
  getUserFavoriteStatistics,
  searchUserFavorites,
  toggleFavorite,
  getUsersByResourceFavorite,
} from "../services/favoriteService.js";
import { logAudit } from "../services/auditService.js";


/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favorite resources management
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     FavoriteRequest:
 *       type: object
 *       required: [resource_id]
 *       properties:
 *         resource_id:
 *           type: integer
 *           example: 21
 */


/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add a resource to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteRequest'
 *     responses:
 *       201:
 *         description: Resource added to favorites successfully
 */
export const addFavoriteHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { resource_id } = req.body;

  const favorite = await addFavorite(userId, resource_id, req.user || null);
  
  if (!favorite) {
    return successResponse(res, "Resource already in favorites", null, 200);
  }
  
  return successResponse(res, "Resource added to favorites successfully", favorite, 201);
});


/**
 * @swagger
 * /favorites/toggle:
 *   post:
 *     summary: Toggle favorite (add or remove)
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FavoriteRequest'
 *     responses:
 *       200:
 *         description: Favorite toggled successfully
 */
export const toggleFavoriteHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { resource_id } = req.body;

  const result = await toggleFavorite(userId, resource_id, req.user || null);
  const message = `Resource ${result.action} ${result.is_favorited ? "to" : "from"} favorites`;
  
  return successResponse(res, message, result);
});


/**
 * @swagger
 * /favorites/{resourceId}:
 *   delete:
 *     summary: Remove a resource from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource removed successfully
 */
export const removeFavoriteHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { resourceId } = req.params;

  const removed = await removeFavorite(userId, parseInt(resourceId));

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: "Favorite not found",
    });
  }

  return successResponse(res, "Resource removed from favorites successfully");
});


/**
 * @swagger
 * /favorites/check/{resourceId}:
 *   get:
 *     summary: Check if a resource is favorited
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check result
 */
export const checkFavoriteHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { resourceId } = req.params;

  const exists = await checkFavoriteExists(userId, parseInt(resourceId));
  return successResponse(res, "Check completed", { is_favorited: exists });
});


/**
 * @swagger
 * /favorites/my-favorites:
 *   get:
 *     summary: Get all user favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 */
export const listMyFavoritesHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const favorites = await getUserFavorites(userId);
  
  return successResponse(res, "Favorites retrieved successfully", favorites);
});


/**
 * @swagger
 * /favorites/by-status/{status}:
 *   get:
 *     summary: Get favorites by status
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [draft, pending, published, rejected, archived]
 *     responses:
 *       200:
 *         description: Filtered favorites
 */
export const listFavoritesByStatusHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { status } = req.params;

  const favorites = await getUserFavoritesByStatus(userId, status.toLowerCase());
  return successResponse(res, "Favorites retrieved successfully", favorites);
});


/**
 * @swagger
 * /favorites/by-educational-type/{educationalType}:
 *   get:
 *     summary: Get favorites by educational type
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: educationalType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [exam, course, correction, notes, resume]
 *     responses:
 *       200:
 *         description: Filtered favorites
 */
export const listFavoritesByEducationalTypeHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { educationalType } = req.params;

  const favorites = await getUserFavoritesByEducationalType(userId, educationalType.toLowerCase());
  return successResponse(res, "Favorites retrieved successfully", favorites);
});


/**
 * @swagger
 * /favorites/by-format/{format}:
 *   get:
 *     summary: Get favorites by format
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, video, powerpoint, word, excel, image, audio, zip, other]
 *     responses:
 *       200:
 *         description: Filtered favorites
 */
export const listFavoritesByFormatHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { format } = req.params;

  const favorites = await getUserFavoritesByFormat(userId, format.toLowerCase());
  return successResponse(res, "Favorites retrieved successfully", favorites);
});


/**
 * @swagger
 * /favorites/my-favorites/count:
 *   get:
 *     summary: Count user favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Favorite count
 */
export const countMyFavoritesHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const count = await countUserFavorites(userId);
  
  return successResponse(res, "Count retrieved successfully", { count });
});


/**
 * @swagger
 * /favorites/resource/{resourceId}/count:
 *   get:
 *     summary: Count favorites for a resource
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Count result
 */
export const countResourceFavoritesHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const count = await countResourceFavorites(parseInt(resourceId), req.user || null);
  
  return successResponse(res, "Count retrieved successfully", { count });
});


/**
 * @swagger
 * /favorites/most-popular:
 *   get:
 *     summary: Get most popular favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Popular favorites
 */
export const listMostPopularFavoritesHandler = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const favorites = await getMostPopularFavorites(parseInt(limit));
  
  return successResponse(res, "Most popular favorites retrieved successfully", favorites);
});


/**
 * @swagger
 * /favorites/my-favorites/recent:
 *   get:
 *     summary: Get recent favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Recent favorites
 */
export const listRecentFavoritesHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { limit = 10 } = req.query;

  const favorites = await getRecentUserFavorites(userId, parseInt(limit));
  return successResponse(res, "Recent favorites retrieved successfully", favorites);
});


/**
 * @swagger
 * /favorites/my-favorites/all:
 *   delete:
 *     summary: Remove all favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All favorites removed
 */
export const removeAllFavoritesHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const deletedCount = await removeAllUserFavorites(userId);
  
  return successResponse(res, "All favorites removed successfully", { deleted_count: deletedCount });
});


/**
 * @swagger
 * /favorites/my-statistics:
 *   get:
 *     summary: Get user statistics
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics data
 */
export const getUserStatisticsHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const statistics = await getUserFavoriteStatistics(userId);
  
  return successResponse(res, "Statistics retrieved successfully", statistics);
});


/**
 * @swagger
 * /favorites/search:
 *   get:
 *     summary: Search in favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
export const searchFavoritesHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { q: searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: "Search term is required",
    });
  }

  const favorites = await searchUserFavorites(userId, searchTerm);
  return successResponse(res, "Search completed successfully", favorites);
});


/**
 * @swagger
 * /favorites/resource/{resourceId}/users:
 *   get:
 *     summary: Get users who favorited a resource
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 */
export const listUsersWhoFavoritedHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { reason = null } = req.query;
  const users = await getUsersByResourceFavorite(parseInt(resourceId));

  await logAudit({
    userId: req.user?.id || null,
    action: "FAVORITES_LIST_USERS_BY_RESOURCE",
    resourceType: "resource",
    resourceId: parseInt(resourceId),
    newValue: { result_count: users.length, reason },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Users retrieved successfully", users);
});
