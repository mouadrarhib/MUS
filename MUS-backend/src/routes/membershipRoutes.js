import { Router } from "express";
import { body } from "express-validator";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";
import {
  assignMembershipHandler,
  cancelMembershipHandler,
  getMyMembershipHandler,
  listMembershipPlansHandler,
} from "../controllers/membershipController.js";

const router = Router();

router.get("/plans", listMembershipPlansHandler);

router.get("/me", authMiddleware, getMyMembershipHandler);

router.post(
  "/assign",
  authMiddleware,
  requireRole("admin"),
  [
    body("user_id").isUUID().withMessage("Valid user_id is required"),
    body("plan_code").isString().notEmpty().withMessage("plan_code is required"),
    body("starts_at").optional().isISO8601().withMessage("starts_at must be a valid datetime"),
    body("ends_at").optional().isISO8601().withMessage("ends_at must be a valid datetime"),
    body("notes").optional().isString(),
  ],
  validateRequest,
  assignMembershipHandler
);

router.post(
  "/cancel",
  authMiddleware,
  requireRole("admin"),
  [
    body("user_id").isUUID().withMessage("Valid user_id is required"),
    body("notes").optional().isString(),
  ],
  validateRequest,
  cancelMembershipHandler
);

export default router;
