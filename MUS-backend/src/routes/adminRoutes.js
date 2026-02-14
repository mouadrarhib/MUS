import express from "express";
import { param, query, body } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import {
  // User Overview Management
  getAllUsersOverviewHandler,
  
  // Students Management
  getAllStudentsHandler,
  getStudentDetailsHandler,
  getStudentsStatisticsHandler,
  filterStudentsByStatusHandler,
  filterStudentsByProfileHandler,
  filterStudentsByInstitutionHandler,
  filterStudentsByProgramHandler,
  searchStudentsHandler,
  toggleUserStatusHandler,
  getAdminDashboardHandler,
  
  // Resources Management - Multi-roles
  getAllResourcesHandler,
  getAllStudentResourcesHandler,
  getAllTeacherResourcesHandler,
  getResourcesStatisticsHandler,
  
  // Compatibilité
  getStudentResourcesHandler,
} from "../controllers/adminController.js";


const router = express.Router();


// ===== MIDDLEWARE: Toutes les routes nécessitent authentification + rôle admin =====
router.use(authMiddleware);
router.use(requireRole("admin"));


/**
 * ============================================================================
 * DASHBOARD
 * ============================================================================
 */


// GET /admin/dashboard - Dashboard admin complet
router.get("/dashboard", getAdminDashboardHandler);


/**
 * ============================================================================
 * USER OVERVIEW MANAGEMENT
 * ============================================================================
 */


// GET /admin/users/overview - Vue d'ensemble de tous les utilisateurs
router.get("/users/overview", getAllUsersOverviewHandler);


/**
 * ============================================================================
 * STUDENTS MANAGEMENT
 * ============================================================================
 */


// GET /admin/students/statistics - Statistiques des étudiants
router.get("/students/statistics", getStudentsStatisticsHandler);


// GET /admin/students/search - Rechercher des étudiants
router.get(
  "/students/search",
  [query("q").notEmpty().withMessage("Search term is required")],
  validateRequest,
  searchStudentsHandler
);


// GET /admin/students/filter/status - Filtrer par statut
router.get(
  "/students/filter/status",
  [query("is_active").isBoolean().withMessage("is_active must be boolean")],
  validateRequest,
  filterStudentsByStatusHandler
);


// GET /admin/students/filter/profile - Filtrer par profil
router.get(
  "/students/filter/profile",
  [query("has_profile").isBoolean().withMessage("has_profile must be boolean")],
  validateRequest,
  filterStudentsByProfileHandler
);


// GET /admin/students/filter/institution/:institutionId - Filtrer par institution
router.get(
  "/students/filter/institution/:institutionId",
  [param("institutionId").isInt().withMessage("Invalid institution ID")],
  validateRequest,
  filterStudentsByInstitutionHandler
);


// GET /admin/students/filter/program/:programId - Filtrer par programme
router.get(
  "/students/filter/program/:programId",
  [param("programId").isInt().withMessage("Invalid program ID")],
  validateRequest,
  filterStudentsByProgramHandler
);


// GET /admin/students/:userId - Détails d'un étudiant
router.get(
  "/students/:userId",
  [param("userId").isUUID().withMessage("Invalid user ID")],
  validateRequest,
  getStudentDetailsHandler
);


// GET /admin/students - Liste de tous les étudiants
router.get("/students", getAllStudentsHandler);


// PATCH /admin/users/:userId/toggle-status - Activer/Désactiver un utilisateur
router.patch(
  "/users/:userId/toggle-status",
  [
    param("userId").isUUID().withMessage("Invalid user ID"),
    body("is_active").isBoolean().withMessage("is_active must be boolean"),
  ],
  validateRequest,
  toggleUserStatusHandler
);


/**
 * ============================================================================
 * RESOURCES MANAGEMENT - MULTI-ROLES
 * ============================================================================
 */


// GET /admin/resources/statistics - Statistiques des resources
router.get(
  "/resources/statistics",
  [
    query("group_by")
      .optional()
      .isIn(["role", "status", "module"])
      .withMessage("group_by must be one of: role, status, module"),
  ],
  validateRequest,
  getResourcesStatisticsHandler
);


// GET /admin/resources/students - Toutes les resources des étudiants
router.get("/resources/students", getAllStudentResourcesHandler);


// GET /admin/resources/teachers - Toutes les resources des enseignants
router.get("/resources/teachers", getAllTeacherResourcesHandler);


// GET /admin/resources - Toutes les resources avec filtres
router.get(
  "/resources",
  [
    query("role")
      .optional()
      .isIn(["student", "teacher", "admin"])
      .withMessage("role must be one of: student, teacher, admin"),
    query("status")
      .optional()
      .isIn(["draft", "pending", "published", "rejected", "archived"])
      .withMessage("status must be one of: draft, pending, published, rejected, archived"),
    query("creator_id")
      .optional()
      .isUUID()
      .withMessage("creator_id must be a valid UUID"),
    query("module_id")
      .optional()
      .isInt()
      .withMessage("module_id must be an integer"),
    query("program_id")
      .optional()
      .isInt()
      .withMessage("program_id must be an integer"),
    query("domain_id")
      .optional()
      .isInt()
      .withMessage("domain_id must be an integer"),
    query("search")
      .optional()
      .isString()
      .withMessage("search must be a string"),
  ],
  validateRequest,
  getAllResourcesHandler
);


/**
 * ============================================================================
 * COMPATIBILITÉ - ANCIENNES ROUTES (à conserver)
 * ============================================================================
 */


// GET /admin/students/:userId/resources - Resources d'un étudiant (legacy)
// ⚠️ Cette route est conservée pour compatibilité avec le code existant
router.get(
  "/students/:userId/resources",
  [param("userId").isUUID().withMessage("Invalid user ID")],
  validateRequest,
  getStudentResourcesHandler
);


export default router;
