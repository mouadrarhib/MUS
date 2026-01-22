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

const router = Router();

router.post(
  "/",
  [
    body("program_id").isUUID().withMessage("Valid program ID is required"),
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
  [
    body("level_id_1").isUUID().withMessage("Valid level ID 1 is required"),
    body("level_id_2").isUUID().withMessage("Valid level ID 2 is required"),
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
  [param("programId").isUUID().withMessage("Valid program ID is required")],
  validateRequest,
  listLevelsByProgram
);

router.get(
  "/program/:programId/next-sort-order",
  [param("programId").isUUID().withMessage("Valid program ID is required")],
  validateRequest,
  getNextSortOrderHandler
);

router.get(
  "/program/:programId/name/:name",
  [
    param("programId").isUUID().withMessage("Valid program ID is required"),
    param("name").isString().withMessage("Name is required"),
  ],
  validateRequest,
  getLevelByNameProgramHandler
);

router.get(
  "/:id",
  [param("id").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  getLevel
);

router.patch(
  "/:id",
  [
    param("id").isUUID().withMessage("Valid level ID is required"),
    body("name").optional().isString(),
    body("program_id").optional().isUUID(),
    body("sort_order").optional().isInt(),
  ],
  validateRequest,
  updateExistingLevel
);

router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  deleteExistingLevel
);

router.get(
  "/:id/semesters",
  [param("id").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  listLevelSemesters
);

router.patch(
  "/:id/sort-order",
  [
    param("id").isUUID().withMessage("Valid level ID is required"),
    body("sort_order").isInt().withMessage("Sort order is required"),
  ],
  validateRequest,
  updateLevelSortOrderHandler
);

router.get(
  "/:id/semesters/count",
  [param("id").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  countLevelSemestersHandler
);

router.get(
  "/:id/full-details",
  [param("id").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  getLevelFullDetailsHandler
);

export default router;
