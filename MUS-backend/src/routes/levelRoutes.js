import { Router } from "express";
import { body, param } from "express-validator";
import {
  addLevel,
  listLevels,
  getLevel,
  updateExistingLevel,
  deleteExistingLevel,
  getLevelByNameProgramHandler,
  searchLevelsHandler,
  listLevelsWithSemesterCount,
  listLevelSemesters,
  updateLevelSortOrderHandler,
  reorderLevelsHandler,
  getNextSortOrderHandler,
  countLevelSemestersHandler,
  getLevelFullDetailsHandler,
  listLevelsByProgram,
} from "../controllers/levelController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  [
    body("program_id").isInt({ min: 1 }).withMessage("Valid program ID is required"),
    body("name").isString().withMessage("Name is required"),
    body("sort_order").isInt().withMessage("Sort order is required"),
  ],
  validateRequest,
  addLevel
);

router.get("/", listLevels);
router.get("/with-semester-count", listLevelsWithSemesterCount);

router.post(
  "/reorder",
  authMiddleware,
  requireRole("admin"),
  [
    body("level_id_1").isInt({ min: 1 }).withMessage("Valid level ID 1 is required"),
    body("level_id_2").isInt({ min: 1 }).withMessage("Valid level ID 2 is required"),
  ],
  validateRequest,
  reorderLevelsHandler
);

router.get(
  "/search/:searchTerm",
  [param("searchTerm").isString().withMessage("Search term is required")],
  validateRequest,
  searchLevelsHandler
);

router.get(
  "/program/:programId",
  [param("programId").isInt({ min: 1 }).withMessage("Valid program ID is required")],
  validateRequest,
  listLevelsByProgram
);

router.get(
  "/program/:programId/next-sort-order",
  [param("programId").isInt({ min: 1 }).withMessage("Valid program ID is required")],
  validateRequest,
  getNextSortOrderHandler
);

router.get(
  "/program/:programId/name/:name",
  [
    param("programId").isInt({ min: 1 }).withMessage("Valid program ID is required"),
    param("name").isString().withMessage("Name is required"),
  ],
  validateRequest,
  getLevelByNameProgramHandler
);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid level ID is required")],
  validateRequest,
  getLevel
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt({ min: 1 }).withMessage("Valid level ID is required"),
    body("name").optional().isString(),
    body("program_id").optional().isInt({ min: 1 }),
    body("sort_order").optional().isInt(),
  ],
  validateRequest,
  updateExistingLevel
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt({ min: 1 }).withMessage("Valid level ID is required")],
  validateRequest,
  deleteExistingLevel
);

router.get(
  "/:id/semesters",
  [param("id").isInt({ min: 1 }).withMessage("Valid level ID is required")],
  validateRequest,
  listLevelSemesters
);

router.patch(
  "/:id/sort-order",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt({ min: 1 }).withMessage("Valid level ID is required"),
    body("sort_order").isInt().withMessage("Sort order is required"),
  ],
  validateRequest,
  updateLevelSortOrderHandler
);

router.get(
  "/:id/semesters/count",
  [param("id").isInt({ min: 1 }).withMessage("Valid level ID is required")],
  validateRequest,
  countLevelSemestersHandler
);

router.get(
  "/:id/full-details",
  [param("id").isInt({ min: 1 }).withMessage("Valid level ID is required")],
  validateRequest,
  getLevelFullDetailsHandler
);

export default router;
