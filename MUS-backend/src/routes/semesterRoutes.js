import { Router } from "express";
import { body, param } from "express-validator";
import {
  addSemester,
  listSemesters,
  getSemester,
  updateExistingSemester,
  deleteExistingSemester,
  getSemesterByNameLevelHandler,
  searchSemestersHandler,
  listSemestersWithModuleCount,
  listSemesterModules,
  updateSemesterSortOrderHandler,
  reorderSemestersHandler,
  getNextSortOrderHandler,
  countSemesterModulesHandler,
  getSemesterFullHierarchyHandler,
  getSemesterFullDetailsHandler,
  listSemestersByLevel,
} from "../controllers/semesterController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  [
    body("level_id").isInt().withMessage("Valid level ID is required"),
    body("name").isString().withMessage("Name is required"),
    body("sort_order").isInt().withMessage("Sort order is required"),
  ],
  validateRequest,
  addSemester
);

router.get("/", listSemesters);
router.get("/with-module-count", listSemestersWithModuleCount);

router.post(
  "/reorder",
  authMiddleware,
  requireRole("admin"),
  [
    body("semester_id_1").isInt({ min: 1 }).withMessage("Valid semester ID 1 is required"),
    body("semester_id_2").isInt({ min: 1 }).withMessage("Valid semester ID 2 is required"),
  ],
  validateRequest,
  reorderSemestersHandler
);

router.get(
  "/search/:searchTerm",
  [param("searchTerm").isString().withMessage("Search term is required")],
  validateRequest,
  searchSemestersHandler
);

router.get(
  "/level/:levelId",
  [param("levelId").isInt().withMessage("Valid level ID is required")],
  validateRequest,
  listSemestersByLevel
);

router.get(
  "/level/:levelId/next-sort-order",
  [param("levelId").isInt().withMessage("Valid level ID is required")],
  validateRequest,
  getNextSortOrderHandler
);

router.get(
  "/level/:levelId/name/:name",
  [
    param("levelId").isInt().withMessage("Valid level ID is required"),
    param("name").isString().withMessage("Name is required"),
  ],
  validateRequest,
  getSemesterByNameLevelHandler
);

router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required")],
  validateRequest,
  getSemester
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required"),
    body("name").optional().isString(),
    body("level_id").optional().isInt(),
    body("sort_order").optional().isInt(),
  ],
  validateRequest,
  updateExistingSemester
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required")],
  validateRequest,
  deleteExistingSemester
);

router.get(
  "/:id/modules",
  [param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required")],
  validateRequest,
  listSemesterModules
);

router.patch(
  "/:id/sort-order",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required"),
    body("sort_order").isInt().withMessage("Sort order is required"),
  ],
  validateRequest,
  updateSemesterSortOrderHandler
);

router.get(
  "/:id/modules/count",
  [param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required")],
  validateRequest,
  countSemesterModulesHandler
);

router.get(
  "/:id/full-hierarchy",
  [param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required")],
  validateRequest,
  getSemesterFullHierarchyHandler
);

router.get(
  "/:id/full-details",
  [param("id").isInt({ min: 1 }).withMessage("Valid semester ID is required")],
  validateRequest,
  getSemesterFullDetailsHandler
);

export default router;
