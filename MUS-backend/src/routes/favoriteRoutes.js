import { Router } from "express";
import { body, param, query } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
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
router.use(authMiddleware);

router.get(
  "/resource/:resourceId/users",
  requireRole("admin"),
  [
    param("resourceId").isInt(),
    query("reason")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Reason must be a string up to 500 chars"),
  ],
  validateRequest,
  listUsersWhoFavoritedHandler
);

router.use(requireRole("student", "teacher"));

router.post(
  "/toggle",
  [body("resource_id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  toggleFavoriteHandler
);

router.post(
  "/",
  [body("resource_id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  addFavoriteHandler
);

router.get("/my-favorites", listMyFavoritesHandler);

router.get(
  "/my-favorites/recent",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  listRecentFavoritesHandler
);

router.get("/my-favorites/count", countMyFavoritesHandler);
router.delete("/my-favorites/all", removeAllFavoritesHandler);
router.get("/my-statistics", getUserStatisticsHandler);

router.get(
  "/search",
  [query("q").notEmpty().withMessage("Search term is required")],
  validateRequest,
  searchFavoritesHandler
);

router.get(
  "/most-popular",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  listMostPopularFavoritesHandler
);

router.get(
  "/by-status/:status",
  [
    param("status")
      .isIn(["draft", "pending", "published", "rejected", "archived"])
      .withMessage("Status must be: draft, pending, published, rejected, or archived"),
  ],
  validateRequest,
  listFavoritesByStatusHandler
);

router.get(
  "/by-educational-type/:educationalType",
  [
    param("educationalType")
      .isIn(["exam", "course", "correction", "notes", "resume"])
      .withMessage("Educational type must be: exam, course, correction, notes, or resume"),
  ],
  validateRequest,
  listFavoritesByEducationalTypeHandler
);

router.get(
  "/by-format/:format",
  [
    param("format")
      .isIn(["pdf", "video", "powerpoint", "word", "excel", "image", "audio", "zip", "other"])
      .withMessage("Format must be: pdf, video, powerpoint, word, excel, image, audio, zip, or other"),
  ],
  validateRequest,
  listFavoritesByFormatHandler
);

router.get(
  "/check/:resourceId",
  [param("resourceId").isInt()],
  validateRequest,
  checkFavoriteHandler
);

router.get(
  "/resource/:resourceId/count",
  [param("resourceId").isInt()],
  validateRequest,
  countResourceFavoritesHandler
);

router.delete(
  "/:resourceId",
  [param("resourceId").isInt()],
  validateRequest,
  removeFavoriteHandler
);

export default router;
