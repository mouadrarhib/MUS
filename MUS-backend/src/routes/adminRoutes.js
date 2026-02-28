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
import { getConfusionOverviewHandler } from "../controllers/resourceConfusionController.js";


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

// GET /admin/confusion/overview - Vue globale des signaux de blocage
router.get(
  "/confusion/overview",
  [
    query("group_by").optional().isIn(["resource", "module"]).withMessage("group_by doit etre resource ou module"),
    query("days").optional().isInt({ min: 1, max: 90 }).withMessage("days doit etre entre 1 et 90"),
  ],
  validateRequest,
  getConfusionOverviewHandler
);


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
  [query("q").notEmpty().withMessage("Le terme de recherche est requis")],
  validateRequest,
  searchStudentsHandler
);


// GET /admin/students/filter/status - Filtrer par statut
router.get(
  "/students/filter/status",
  [query("is_active").isBoolean().withMessage("is_active doit etre un booleen")],
  validateRequest,
  filterStudentsByStatusHandler
);


// GET /admin/students/filter/profile - Filtrer par profil
router.get(
  "/students/filter/profile",
  [query("has_profile").isBoolean().withMessage("has_profile doit etre un booleen")],
  validateRequest,
  filterStudentsByProfileHandler
);


// GET /admin/students/filter/institution/:institutionId - Filtrer par institution
router.get(
  "/students/filter/institution/:institutionId",
  [param("institutionId").isInt().withMessage("ID d'institution invalide")],
  validateRequest,
  filterStudentsByInstitutionHandler
);


// GET /admin/students/filter/program/:programId - Filtrer par programme
router.get(
  "/students/filter/program/:programId",
  [param("programId").isInt().withMessage("ID de programme invalide")],
  validateRequest,
  filterStudentsByProgramHandler
);


// GET /admin/students/:userId - Détails d'un étudiant
router.get(
  "/students/:userId",
  [param("userId").isUUID().withMessage("ID utilisateur invalide")],
  validateRequest,
  getStudentDetailsHandler
);


// GET /admin/students - Liste de tous les étudiants
router.get("/students", getAllStudentsHandler);


// PATCH /admin/users/:userId/toggle-status - Activer/Désactiver un utilisateur
router.patch(
  "/users/:userId/toggle-status",
  [
    param("userId").isUUID().withMessage("ID utilisateur invalide"),
    body("is_active").isBoolean().withMessage("is_active doit etre un booleen"),
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
      .withMessage("group_by doit etre l'un de: role, status, module"),
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
      .withMessage("role doit etre l'un de: student, teacher, admin"),
    query("status")
      .optional()
      .isIn(["draft", "pending", "published", "rejected", "archived"])
      .withMessage("status doit etre l'un de: draft, pending, published, rejected, archived"),
    query("creator_id")
      .optional()
      .isUUID()
      .withMessage("creator_id doit etre un UUID valide"),
    query("module_id")
      .optional()
      .isInt()
      .withMessage("module_id doit etre un entier"),
    query("program_id")
      .optional()
      .isInt()
      .withMessage("program_id doit etre un entier"),
    query("domain_id")
      .optional()
      .isInt()
      .withMessage("domain_id doit etre un entier"),
    query("search")
      .optional()
      .isString()
      .withMessage("search doit etre une chaine de caracteres"),
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
  [param("userId").isUUID().withMessage("ID utilisateur invalide")],
  validateRequest,
  getStudentResourcesHandler
);


export default router;
