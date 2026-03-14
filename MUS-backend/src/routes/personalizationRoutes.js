import { Router } from "express";
import { body, query } from "express-validator";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";
import {
  getMyRecommendationsHandler,
  getMyTagPreferencesHandler,
  setMyTagPreferencesHandler,
} from "../controllers/personalizationController.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("student", "teacher", "admin"));

router.get("/me/tags", getMyTagPreferencesHandler);

router.put(
  "/me/tags",
  [
    body("tag_ids").isArray().withMessage("tag_ids must be an array"),
    body("tag_ids.*").isInt({ min: 1 }).withMessage("Each tag id must be a positive integer"),
  ],
  validateRequest,
  setMyTagPreferencesHandler
);

router.get(
  "/me/recommendations",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  getMyRecommendationsHandler
);

export default router;
