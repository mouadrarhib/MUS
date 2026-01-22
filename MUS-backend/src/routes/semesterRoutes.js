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

const router = Router();

router.post(
  "/",
  [
    body("level_id").isUUID().withMessage("Valid level ID is required"),
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
  [
    body("semester_id_1").isUUID().withMessage("Valid semester ID 1 is required"),
    body("semester_id_2").isUUID().withMessage("Valid semester ID 2 is required"),
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
  [param("levelId").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  listSemestersByLevel
);

router.get(
  "/level/:levelId/next-sort-order",
  [param("levelId").isUUID().withMessage("Valid level ID is required")],
  validateRequest,
  getNextSortOrderHandler
);

router.get(
  "/level/:levelId/name/:name",
  [
    param("levelId").isUUID().withMessage("Valid level ID is required"),
    param("name").isString().withMessage("Name is required"),
  ],
  validateRequest,
  getSemesterByNameLevelHandler
);

router.get(
  "/:id",
  [param("id").isUUID().withMessage("Valid semester ID is required")],
  validateRequest,
  getSemester
);

router.patch(
  "/:id",
  [
    param("id").isUUID().withMessage("Valid semester ID is required"),
    body("name").optional().isString(),
    body("level_id").optional().isUUID(),
    body("sort_order").optional().isInt(),
  ],
  validateRequest,
  updateExistingSemester
);

router.delete(
  "/:id",
  [param("id").isUUID().withMessage("Valid semester ID is required")],
  validateRequest,
  deleteExistingSemester
);

router.get(
  "/:id/modules",
  [param("id").isUUID().withMessage("Valid semester ID is required")],
  validateRequest,
  listSemesterModules
);

router.patch(
  "/:id/sort-order",
  [
    param("id").isUUID().withMessage("Valid semester ID is required"),
    body("sort_order").isInt().withMessage("Sort order is required"),
  ],
  validateRequest,
  updateSemesterSortOrderHandler
);

router.get(
  "/:id/modules/count",
  [param("id").isUUID().withMessage("Valid semester ID is required")],
  validateRequest,
  countSemesterModulesHandler
);

router.get(
  "/:id/full-hierarchy",
  [param("id").isUUID().withMessage("Valid semester ID is required")],
  validateRequest,
  getSemesterFullHierarchyHandler
);

router.get(
  "/:id/full-details",
  [param("id").isUUID().withMessage("Valid semester ID is required")],
  validateRequest,
  getSemesterFullDetailsHandler
);

export default router;
