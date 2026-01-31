import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  upsertRating,
  getRatingsByUser,
  getUserRatingSummary,
  getRatingByUserResource,
  deleteRating,
  getRatingsByResource,
  getRatingsWithComments,
  getRatingsByScore,
  getAverageRating,
  getRatingStatistics,
  countRatingsByResource,
  getTopRatedResources,
  getRecentRatings,
  getResourcesWithRatings,
  countRatingsByUser,
  getRatingsByDateRange,
  ratingExists,
  validateRatingScore,
} from "../services/ratingService.js";

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating and review management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         resource_id:
 *           type: integer
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     RatingRequest:
 *       type: object
 *       required:
 *         - resource_id
 *         - score
 *       properties:
 *         resource_id:
 *           type: integer
 *           example: 1
 *         score:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Excellent cours, très bien expliqué!"
 *     RatingStatistics:
 *       type: object
 *       properties:
 *         resource_id:
 *           type: integer
 *         average_score:
 *           type: number
 *           format: float
 *         total_ratings:
 *           type: integer
 *         five_star_count:
 *           type: integer
 *         four_star_count:
 *           type: integer
 *         three_star_count:
 *           type: integer
 *         two_star_count:
 *           type: integer
 *         one_star_count:
 *           type: integer
 *         with_comment_count:
 *           type: integer
 */

const getAuthUserIdFromReq = (req) => req?.user?.sub || req?.user?.id;

// ============================================================================
// CREATE OR UPDATE RATING (UPSERT)
// ============================================================================
/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create or update a rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RatingRequest'
 *     responses:
 *       201:
 *         description: Rating created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Rating'
 *                       - type: object
 *                         properties:
 *                           is_new:
 *                             type: boolean
 *       200:
 *         description: Rating updated successfully
 *       401:
 *         description: Unauthorized
 */
export const addOrUpdateRating = asyncHandler(async (req, res) => {
  const { resource_id, score, comment } = req.body;

  const userId = getAuthUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const validScore = validateRatingScore(score);
  const result = await upsertRating(userId, resource_id, validScore, comment);

  const message = result?.[0]?.is_new ? "Rating created successfully" : "Rating updated successfully";
  const statusCode = result?.[0]?.is_new ? 201 : 200;

  return successResponse(res, message, result, statusCode);
});

// ============================================================================
// GET MY RATINGS
// ============================================================================
/**
 * @swagger
 * /ratings/my-ratings:
 *   get:
 *     summary: Get all ratings by authenticated user
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of user's ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       resource_id:
 *                         type: integer
 *                       resource_title:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
export const listMyRatings = asyncHandler(async (req, res) => {
  const userId = getAuthUserIdFromReq(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const result = await getRatingsByUser(userId);
  return successResponse(res, "Your ratings retrieved successfully", result);
});

// ============================================================================
// GET MY RATING SUMMARY
// ============================================================================
/**
 * @swagger
 * /ratings/my-summary:
 *   get:
 *     summary: Get rating summary for authenticated user
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User's rating summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     total_ratings:
 *                       type: integer
 *                     average_score_given:
 *                       type: number
 *                     five_star_given:
 *                       type: integer
 *                     four_star_given:
 *                       type: integer
 *                     three_star_given:
 *                       type: integer
 *                     two_star_given:
 *                       type: integer
 *                     one_star_given:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
export const getMyRatingSummary = asyncHandler(async (req, res) => {
  const userId = getAuthUserIdFromReq(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const result = await getUserRatingSummary(userId);
  return successResponse(res, "Rating summary retrieved successfully", result);
});

// ============================================================================
// GET MY RATING FOR A SPECIFIC RESOURCE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/my-rating:
 *   get:
 *     summary: Get authenticated user's rating for a specific resource
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: User's rating data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rating'
 *       404:
 *         description: Rating not found
 *       401:
 *         description: Unauthorized
 */
export const getMyRatingForResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const userId = getAuthUserIdFromReq(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const result = await getRatingByUserResource(userId, resourceId);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "You have not rated this resource yet",
    });
  }

  return successResponse(res, "Rating retrieved successfully", result);
});

// ============================================================================
// DELETE MY RATING
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}:
 *   delete:
 *     summary: Delete authenticated user's rating for a resource
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       401:
 *         description: Unauthorized
 */
export const deleteMyRating = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const userId = getAuthUserIdFromReq(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  await deleteRating(userId, resourceId);
  return successResponse(res, "Rating deleted successfully");
});

// ============================================================================
// GET ALL RATINGS FOR A RESOURCE (PUBLIC)
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}:
 *   get:
 *     summary: Get all ratings for a specific resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: A list of ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       user_full_name:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */
export const listRatingsByResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const result = await getRatingsByResource(resourceId);
  return successResponse(res, "Ratings retrieved successfully", result);
});

// ============================================================================
// GET RATINGS WITH COMMENTS FOR A RESOURCE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/with-comments:
 *   get:
 *     summary: Get all ratings with comments for a specific resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: A list of ratings with comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       user_full_name:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */
export const listRatingsWithComments = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const result = await getRatingsWithComments(resourceId);
  return successResponse(res, "Ratings with comments retrieved successfully", result);
});

// ============================================================================
// GET RATINGS BY SCORE FOR A RESOURCE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/score/{score}:
 *   get:
 *     summary: Get ratings by specific score for a resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *       - in: path
 *         name: score
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: The rating score (1-5)
 *     responses:
 *       200:
 *         description: A list of ratings with the specified score
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       user_full_name:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
export const listRatingsByScore = asyncHandler(async (req, res) => {
  const { resourceId, score } = req.params;
  const validScore = validateRatingScore(score);
  const result = await getRatingsByScore(resourceId, validScore);
  return successResponse(res, "Ratings retrieved successfully", result);
});

// ============================================================================
// GET AVERAGE RATING FOR A RESOURCE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/average:
 *   get:
 *     summary: Get average rating for a resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Average rating data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     resource_id:
 *                       type: integer
 *                     average_score:
 *                       type: number
 *                       format: float
 *                     total_ratings:
 *                       type: integer
 */
export const getResourceAverageRating = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const result = await getAverageRating(resourceId);
  return successResponse(res, "Average rating retrieved successfully", result);
});

// ============================================================================
// GET RATING STATISTICS FOR A RESOURCE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/statistics:
 *   get:
 *     summary: Get detailed rating statistics for a resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Rating statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/RatingStatistics'
 */
export const getResourceRatingStatistics = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const result = await getRatingStatistics(resourceId);
  return successResponse(res, "Rating statistics retrieved successfully", result);
});

// ============================================================================
// COUNT RATINGS FOR A RESOURCE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/count:
 *   get:
 *     summary: Count ratings for a specific resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Rating count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 */
export const countResourceRatings = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const count = await countRatingsByResource(resourceId);
  return successResponse(res, "Rating count retrieved successfully", { count });
});

// ============================================================================
// GET TOP RATED RESOURCES
// ============================================================================
/**
 * @swagger
 * /ratings/top-rated:
 *   get:
 *     summary: Get top rated resources
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of resources to return
 *       - in: query
 *         name: min_ratings
 *         schema:
 *           type: integer
 *           default: 5
 *           minimum: 1
 *         description: Minimum number of ratings required
 *     responses:
 *       200:
 *         description: A list of top rated resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       resource_id:
 *                         type: integer
 *                       resource_title:
 *                         type: string
 *                       resource_description:
 *                         type: string
 *                       resource_format:
 *                         type: string
 *                       average_score:
 *                         type: number
 *                       total_ratings:
 *                         type: integer
 */
export const listTopRatedResources = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const minRatings = parseInt(req.query.min_ratings, 10) || 5;
  const result = await getTopRatedResources(limit, minRatings);
  return successResponse(res, "Top rated resources retrieved successfully", result);
});

// ============================================================================
// GET RECENT RATINGS
// ============================================================================
/**
 * @swagger
 * /ratings/recent:
 *   get:
 *     summary: Get recent ratings
 *     tags: [Ratings]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of ratings to return
 *     responses:
 *       200:
 *         description: A list of recent ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       user_full_name:
 *                         type: string
 *                       resource_id:
 *                         type: integer
 *                       resource_title:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
export const listRecentRatings = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const result = await getRecentRatings(limit);
  return successResponse(res, "Recent ratings retrieved successfully", result);
});

// ============================================================================
// GET RESOURCES WITH RATINGS
// ============================================================================
/**
 * @swagger
 * /ratings/resources-with-ratings:
 *   get:
 *     summary: Get all resources with their ratings
 *     tags: [Ratings]
 *     responses:
 *       200:
 *         description: A list of resources with ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       resource_id:
 *                         type: integer
 *                       resource_title:
 *                         type: string
 *                       resource_status:
 *                         type: string
 *                       average_score:
 *                         type: number
 *                       total_ratings:
 *                         type: integer
 */
export const listResourcesWithRatings = asyncHandler(async (_req, res) => {
  const result = await getResourcesWithRatings();
  return successResponse(res, "Resources with ratings retrieved successfully", result);
});

// ============================================================================
// GET RATINGS BY USER
// ============================================================================
/**
 * @swagger
 * /ratings/user/{userId}:
 *   get:
 *     summary: Get all ratings by a specific user
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A list of user's ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       resource_id:
 *                         type: integer
 *                       resource_title:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */
export const listRatingsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getRatingsByUser(userId);
  return successResponse(res, "Ratings retrieved successfully", result);
});

// ============================================================================
// COUNT RATINGS BY USER
// ============================================================================
/**
 * @swagger
 * /ratings/user/{userId}/count:
 *   get:
 *     summary: Count ratings by a specific user
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Rating count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 */
export const countUserRatings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const count = await countRatingsByUser(userId);
  return successResponse(res, "Rating count retrieved successfully", { count });
});

// ============================================================================
// GET USER RATING SUMMARY
// ============================================================================
/**
 * @swagger
 * /ratings/user/{userId}/summary:
 *   get:
 *     summary: Get rating summary for a specific user
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User's rating summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                     total_ratings:
 *                       type: integer
 *                     average_score_given:
 *                       type: number
 *                     five_star_given:
 *                       type: integer
 *                     four_star_given:
 *                       type: integer
 *                     three_star_given:
 *                       type: integer
 *                     two_star_given:
 *                       type: integer
 *                     one_star_given:
 *                       type: integer
 */
export const getUserSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getUserRatingSummary(userId);
  return successResponse(res, "User rating summary retrieved successfully", result);
});

// ============================================================================
// GET RATINGS BY DATE RANGE
// ============================================================================
/**
 * @swagger
 * /ratings/resource/{resourceId}/date-range:
 *   get:
 *     summary: Get ratings by date range for a resource
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO 8601)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO 8601)
 *     responses:
 *       200:
 *         description: A list of ratings within date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         format: uuid
 *                       user_full_name:
 *                         type: string
 *                       score:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Missing required date parameters
 */
export const listRatingsByDateRange = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ success: false, message: "start_date and end_date are required" });
  }

  const result = await getRatingsByDateRange(resourceId, start_date, end_date);
  return successResponse(res, "Ratings retrieved successfully", result);
});

// ============================================================================
// CHECK IF USER CAN RATE
// ============================================================================
/**
 * @swagger
 * /ratings/can-rate/{resourceId}:
 *   get:
 *     summary: Check if authenticated user can rate a resource
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Can rate status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     can_rate:
 *                       type: boolean
 *                     already_rated:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
export const checkCanRate = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const userId = getAuthUserIdFromReq(req);
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const exists = await ratingExists(userId, resourceId);
  return successResponse(res, "Rating status checked", { can_rate: !exists, already_rated: exists });
});
