import { Router } from "express";
import { body, param, query } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";

import {
  addOrUpdateRating,
  listMyRatings,
  getMyRatingSummary,
  getMyRatingForResource,
  deleteMyRating,
  listRatingsByResource,
  listRatingsWithComments,
  listRatingsByScore,
  getResourceAverageRating,
  getResourceRatingStatistics,
  countResourceRatings,
  listTopRatedResources,
  listRecentRatings,
  listResourcesWithRatings,
  listRatingsByUser,
  countUserRatings,
  getUserSummary,
  listRatingsByDateRange,
  checkCanRate,
} from "../controllers/ratingController.js";

const router = Router();

// ===================== PUBLIC =====================
router.get(
  "/top-rated",
  [query("limit").optional().isInt({ min: 1, max: 100 }), query("min_ratings").optional().isInt({ min: 1 })],
  validateRequest,
  listTopRatedResources
);

router.get("/recent", [query("limit").optional().isInt({ min: 1, max: 100 })], validateRequest, listRecentRatings);

router.get("/resources-with-ratings", listResourcesWithRatings);

router.get(
  "/resource/:resourceId",
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  listRatingsByResource
);

router.get(
  "/resource/:resourceId/with-comments",
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  listRatingsWithComments
);

router.get(
  "/resource/:resourceId/score/:score",
  [
    param("resourceId").isInt().withMessage("Valid resource ID is required"),
    param("score").isInt({ min: 1, max: 5 }).withMessage("Score must be between 1 and 5"),
  ],
  validateRequest,
  listRatingsByScore
);

router.get(
  "/resource/:resourceId/average",
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  getResourceAverageRating
);

router.get(
  "/resource/:resourceId/statistics",
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  getResourceRatingStatistics
);

router.get(
  "/resource/:resourceId/count",
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  countResourceRatings
);

router.get(
  "/resource/:resourceId/date-range",
  [
    param("resourceId").isInt().withMessage("Valid resource ID is required"),
    query("start_date").isISO8601().withMessage("Valid start date is required"),
    query("end_date").isISO8601().withMessage("Valid end date is required"),
  ],
  validateRequest,
  listRatingsByDateRange
);

router.get("/user/:userId", [param("userId").isUUID().withMessage("Valid user UUID is required")], validateRequest, listRatingsByUser);

router.get(
  "/user/:userId/count",
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  countUserRatings
);

router.get(
  "/user/:userId/summary",
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  getUserSummary
);

// ===================== AUTHENTICATED =====================
router.post(
  "/",
  authMiddleware,
  [
    body("resource_id").isInt().withMessage("Valid resource ID is required"),
    body("score").isInt({ min: 1, max: 5 }).withMessage("Score must be between 1 and 5"),
    body("comment").optional().isString(),
  ],
  validateRequest,
  addOrUpdateRating
);

router.get("/my-ratings", authMiddleware, listMyRatings);
router.get("/my-summary", authMiddleware, getMyRatingSummary);

router.get(
  "/resource/:resourceId/my-rating",
  authMiddleware,
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  getMyRatingForResource
);

router.delete(
  "/resource/:resourceId",
  authMiddleware,
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  deleteMyRating
);

router.get(
  "/can-rate/:resourceId",
  authMiddleware,
  [param("resourceId").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  checkCanRate
);

export default router;
