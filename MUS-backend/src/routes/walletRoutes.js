import { Router } from "express";
import { query } from "express-validator";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";
import {
  getMyWalletActivityHandler,
  getMyWalletSummaryHandler,
  getMyWalletTopResourcesHandler,
} from "../controllers/walletController.js";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("student", "teacher", "admin"));

router.get("/me/summary", getMyWalletSummaryHandler);

router.get(
  "/me/top-resources",
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  validateRequest,
  getMyWalletTopResourcesHandler
);

router.get(
  "/me/activity",
  [
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  validateRequest,
  getMyWalletActivityHandler
);

export default router;
