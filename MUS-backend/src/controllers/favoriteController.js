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


/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favorite resources management (Student only)
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Favorite:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         resource_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
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

  const favorite = await addFavorite(userId, resource_id);
  
  // Si la ressource était déjà favorite, favorite sera null/undefined
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

  const result = await toggleFavorite(userId, resource_id);
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
 *         description: Resource removed from favorites successfully
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
 *     summary: Check if a resource is in favorites
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
 *         description: Favorite check result
 */
export const checkFavoriteHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { resourceId } = req.params;

  const exists = await checkFavoriteExists(userId, parseInt(resourceId));
  return successResponse(res, "Favorite check completed", { is_favorited: exists });
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
 *         description: A list of favorites
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
 *     summary: Get user favorites by status
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
 *           enum: [published, draft, archived]
 *     responses:
 *       200:
 *         description: A list of favorites
 */
export const listFavoritesByStatusHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { status } = req.params;

  const favorites = await getUserFavoritesByStatus(userId, status);
  return successResponse(res, `Favorites with status '${status}' retrieved successfully`, favorites);
});


/**
 * @swagger
 * /favorites/by-educational-type/{educationalType}:
 *   get:
 *     summary: Get user favorites by educational type
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
 *     responses:
 *       200:
 *         description: A list of favorites
 */
export const listFavoritesByEducationalTypeHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { educationalType } = req.params;

  const favorites = await getUserFavoritesByEducationalType(userId, educationalType);
  return successResponse(res, `Favorites retrieved successfully`, favorites);
});


/**
 * @swagger
 * /favorites/by-format/{format}:
 *   get:
 *     summary: Get user favorites by format
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
 *     responses:
 *       200:
 *         description: A list of favorites
 */
export const listFavoritesByFormatHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const { format } = req.params;

  const favorites = await getUserFavoritesByFormat(userId, format);
  return successResponse(res, `Favorites retrieved successfully`, favorites);
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
  
  return successResponse(res, "Favorite count retrieved successfully", { count });
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
 *         description: Favorite count
 */
export const countResourceFavoritesHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const count = await countResourceFavorites(parseInt(resourceId));
  
  return successResponse(res, "Resource favorite count retrieved successfully", { count });
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
 *     responses:
 *       200:
 *         description: A list of most popular favorites
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
 *     responses:
 *       200:
 *         description: A list of recent favorites
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
 *         description: Favorite statistics
 */
export const getUserStatisticsHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  const statistics = await getUserFavoriteStatistics(userId);
  
  return successResponse(res, "Favorite statistics retrieved successfully", statistics);
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
 *         description: A list of users
 */
export const listUsersWhoFavoritedHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const users = await getUsersByResourceFavorite(parseInt(resourceId));
  
  return successResponse(res, "Users retrieved successfully", users);
});
