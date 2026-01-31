import { Router } from "express";
import { body, param } from "express-validator";
import {
  addModule,
  listModules,
  getModule,
  getModuleByCode,
  updateExistingModule,
  deleteExistingModule,
  listModulesBySemester,
  listModulesByLevel,
  listModulesByProgram,
  listModulesByDomain,
  searchModulesHandler,
  listModulesWithResourceCount,
  getModuleResourcesHandler,
  countModuleResourcesHandler,
  getModuleHierarchyHandler,
  getModuleDetailsHandler,
  countModulesBySemesterHandler,
  getModuleStatisticsHandler,
  listModulesByResourceType,
  checkModuleExists,
} from "../controllers/moduleController.js";
import validateRequest from "./validateRequest.js";
// import authMiddleware from "../middleware/auth.js";

const router = Router();

// ============================================================================
// PUBLIC ROUTES (no auth required)
// ============================================================================
// Optionally, you can make some routes public for students to browse modules

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================
// Apply authentication to all routes

// router.use(authMiddleware);

// ============================================================================
// CREATE MODULE
// ============================================================================
router.post(
  "/",
  [
    body("semester_id").isInt().withMessage("Valid semester ID is required"),
    body("code").isString().withMessage("Module code is required"),
    body("title").isString().withMessage("Module title is required"),
    body("description").optional().isString(),
  ],
  validateRequest,
  addModule
);

// ============================================================================
// GET ALL MODULES (with optional resource count)
// ============================================================================
router.get("/", listModules);

// ============================================================================
// GET MODULES WITH RESOURCE COUNT
// ⚠️ MUST be BEFORE /:id to avoid conflict
// ============================================================================
router.get("/with-resource-count", listModulesWithResourceCount);

// ============================================================================
// CHECK IF MODULE EXISTS
// ============================================================================
router.post(
  "/check-exists",
  [
    body("code").isString().withMessage("Module code is required"),
    body("semester_id").isInt().withMessage("Valid semester ID is required"),
  ],
  validateRequest,
  checkModuleExists
);

// ============================================================================
// SEARCH MODULES
// ⚠️ MUST be BEFORE /:id to avoid conflict
// ============================================================================
router.get(
  "/search/:searchTerm",
  [param("searchTerm").isString().withMessage("Search term is required")],
  validateRequest,
  searchModulesHandler
);

// ============================================================================
// GET MODULES BY HIERARCHY LEVELS
// ⚠️ MUST be BEFORE /:id to avoid conflict
// ============================================================================
router.get(
  "/semester/:semesterId",
  [param("semesterId").isInt().withMessage("Valid semester ID is required")],
  validateRequest,
  listModulesBySemester
);

router.get(
  "/level/:levelId",
  [param("levelId").isInt().withMessage("Valid level ID is required")],
  validateRequest,
  listModulesByLevel
);

router.get(
  "/program/:programId",
  [param("programId").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  listModulesByProgram
);

router.get(
  "/domain/:domainId",
  [param("domainId").isInt().withMessage("Valid domain ID is required")],
  validateRequest,
  listModulesByDomain
);

// ============================================================================
// GET MODULES BY RESOURCE TYPE
// ⚠️ MUST be BEFORE /:id to avoid conflict
// ============================================================================
router.get(
  "/resource-type/:resourceTypeId",
  [param("resourceTypeId").isInt().withMessage("Valid resource type ID is required")],
  validateRequest,
  listModulesByResourceType
);

// ============================================================================
// GET MODULE BY CODE AND SEMESTER
// ⚠️ MUST be BEFORE /:id to avoid conflict
// ============================================================================
router.get(
  "/code/:code/semester/:semesterId",
  [
    param("code").isString().withMessage("Module code is required"),
    param("semesterId").isInt().withMessage("Valid semester ID is required"),
  ],
  validateRequest,
  getModuleByCode
);

// ============================================================================
// COUNT MODULES BY SEMESTER
// ⚠️ Pattern: /semester/:semesterId/count - BEFORE /:id
// ============================================================================
router.get(
  "/semester/:semesterId/count",
  [param("semesterId").isInt().withMessage("Valid semester ID is required")],
  validateRequest,
  countModulesBySemesterHandler
);

// ============================================================================
// GET MODULE BY ID (with sub-routes)
// ⚠️ MUST be AFTER all specific routes
// ============================================================================
router.get(
  "/:id",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  getModule
);

// ============================================================================
// UPDATE MODULE
// ============================================================================
router.patch(
  "/:id",
  [
    param("id").isInt().withMessage("Valid module ID is required"),
    body("code").optional().isString(),
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("semester_id").optional().isInt(),
  ],
  validateRequest,
  updateExistingModule
);

// ============================================================================
// DELETE MODULE
// ============================================================================
router.delete(
  "/:id",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  deleteExistingModule
);

// ============================================================================
// MODULE RESOURCES
// ============================================================================
router.get(
  "/:id/resources",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  getModuleResourcesHandler
);

router.get(
  "/:id/resources/count",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  countModuleResourcesHandler
);

// ============================================================================
// MODULE DETAILS AND HIERARCHY
// ============================================================================
router.get(
  "/:id/hierarchy",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  getModuleHierarchyHandler
);

router.get(
  "/:id/details",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  getModuleDetailsHandler
);

router.get(
  "/:id/statistics",
  [param("id").isInt().withMessage("Valid module ID is required")],
  validateRequest,
  getModuleStatisticsHandler
);

export default router;
