import { Router } from "express";
import { body, param, query } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import {
  addFavoriteHandler,
  removeFavoriteHandler,
  checkFavoriteHandler,
  listMyFavoritesHandler,
  listFavoritesByStatusHandler,
  listFavoritesByEducationalTypeHandler,
  listFavoritesByFormatHandler,
  countMyFavoritesHandler,
  countResourceFavoritesHandler,
  listMostPopularFavoritesHandler,
  listRecentFavoritesHandler,
  removeAllFavoritesHandler,
  getUserStatisticsHandler,
  searchFavoritesHandler,
  toggleFavoriteHandler,
  listUsersWhoFavoritedHandler,
} from "../controllers/favoriteController.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Toggle favorite (most common operation)
router.post(
  "/toggle",
  [body("resource_id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  toggleFavoriteHandler
);

// Add to favorites
router.post(
  "/",
  [body("resource_id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  addFavoriteHandler
);

// Get all user favorites (must be before /:resourceId)
router.get("/my-favorites", listMyFavoritesHandler);

// Get recent favorites
router.get(
  "/my-favorites/recent",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  listRecentFavoritesHandler
);

// Count user favorites
router.get("/my-favorites/count", countMyFavoritesHandler);

// Remove all favorites
router.delete("/my-favorites/all", removeAllFavoritesHandler);

// Get user statistics
router.get("/my-statistics", getUserStatisticsHandler);

// Search in favorites
router.get(
  "/search",
  [query("q").notEmpty().withMessage("Search term is required")],
  validateRequest,
  searchFavoritesHandler
);

// Get most popular
router.get(
  "/most-popular",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  listMostPopularFavoritesHandler
);

// Get favorites by status
router.get(
  "/by-status/:status",
  [
    param("status")
      .isIn(["draft", "published", "archived"])
      .withMessage("Status must be: draft, published, or archived")
  ],
  validateRequest,
  listFavoritesByStatusHandler
);

// Get favorites by educational type
router.get(
  "/by-educational-type/:educationalType",
  [
    param("educationalType")
      .isIn(["exam", "course", "correction", "notes", "resume"])
      .withMessage("Educational type must be: exam, course, correction, notes, or resume")
  ],
  validateRequest,
  listFavoritesByEducationalTypeHandler
);

// Get favorites by format
router.get(
  "/by-format/:format",
  [
    param("format")
      .isIn(["pdf", "video", "powerpoint", "word", "excel", "image", "audio", "zip", "other"])
      .withMessage("Format must be: pdf, video, powerpoint, word, excel, image, audio, zip, or other")
  ],
  validateRequest,
  listFavoritesByFormatHandler
);

// Check if resource is favorited
router.get(
  "/check/:resourceId",
  [param("resourceId").isInt()],
  validateRequest,
  checkFavoriteHandler
);

// Resource-specific endpoints
router.get(
  "/resource/:resourceId/count",
  [param("resourceId").isInt()],
  validateRequest,
  countResourceFavoritesHandler
);

router.get(
  "/resource/:resourceId/users",
  [param("resourceId").isInt()],
  validateRequest,
  listUsersWhoFavoritedHandler
);

// Remove from favorites (must be last to avoid conflicts)
router.delete(
  "/:resourceId",
  [param("resourceId").isInt()],
  validateRequest,
  removeFavoriteHandler
);

export default router;
