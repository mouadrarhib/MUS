import { Router } from "express";
import { body, param } from "express-validator";
import {
  getMyTutorProfileHandler,
  getPublicTutorProfileHandler,
  replaceMyTutorProfileEducationHandler,
  replaceMyTutorProfileSkillsHandler,
  setMyTutorProfileVisibilityHandler,
  upsertMyTutorProfileHandler,
} from "../controllers/tutorProfileController.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.get(
  "/:userId/public",
  [param("userId").isUUID().withMessage("Valid tutor UUID is required")],
  validateRequest,
  getPublicTutorProfileHandler
);

router.use(authMiddleware);
router.use(requireRole("teacher", "student", "admin"));

router.get("/me", getMyTutorProfileHandler);

router.put(
  "/me",
  [
    body("headline").optional().isString().isLength({ max: 160 }).withMessage("headline must be <= 160 characters"),
    body("bio").optional().isString().isLength({ max: 5000 }).withMessage("bio must be <= 5000 characters"),
    body("years_experience").optional().isInt({ min: 0, max: 100 }).withMessage("years_experience must be between 0 and 100"),
    body("hourly_rate").optional().isFloat({ min: 0 }).withMessage("hourly_rate must be >= 0"),
    body("currency").optional().isString().isLength({ min: 3, max: 3 }).withMessage("currency must be 3 characters"),
    body("response_time_minutes").optional().isInt({ min: 0, max: 10080 }).withMessage("response_time_minutes must be between 0 and 10080"),
    body("visibility_status").optional().isIn(["draft", "published", "hidden"]).withMessage("visibility_status must be draft, published, or hidden"),
  ],
  validateRequest,
  upsertMyTutorProfileHandler
);

router.patch(
  "/me/visibility",
  [
    body("visibility_status")
      .isIn(["draft", "published", "hidden"])
      .withMessage("visibility_status must be draft, published, or hidden"),
  ],
  validateRequest,
  setMyTutorProfileVisibilityHandler
);

router.put(
  "/me/skills",
  [
    body("skills").isArray({ max: 50 }).withMessage("skills must be an array with at most 50 items"),
    body("skills.*").isString().isLength({ min: 1, max: 120 }).withMessage("each skill must be 1-120 characters"),
  ],
  validateRequest,
  replaceMyTutorProfileSkillsHandler
);

router.put(
  "/me/education",
  [
    body("education").isArray({ max: 20 }).withMessage("education must be an array with at most 20 items"),
    body("education.*.degree").isString().isLength({ min: 1, max: 240 }).withMessage("degree is required and must be <= 240 characters"),
    body("education.*.institution").isString().isLength({ min: 1, max: 240 }).withMessage("institution is required and must be <= 240 characters"),
    body("education.*.start_year").optional({ nullable: true }).isInt({ min: 1900, max: 2200 }).withMessage("start_year must be between 1900 and 2200"),
    body("education.*.end_year").optional({ nullable: true }).isInt({ min: 1900, max: 2200 }).withMessage("end_year must be between 1900 and 2200"),
    body("education.*.description").optional({ nullable: true }).isString().isLength({ max: 2000 }).withMessage("description must be <= 2000 characters"),
    body("education.*.sort_order").optional({ nullable: true }).isInt({ min: 1, max: 10000 }).withMessage("sort_order must be between 1 and 10000"),
  ],
  validateRequest,
  replaceMyTutorProfileEducationHandler
);

export default router;
