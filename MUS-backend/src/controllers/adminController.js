import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import { createUserByAdmin } from "../services/authService.js";
import {
  // User Overview Management
  getAllUsersOverview,
  getUsersPointsOverview,
  getContributorRewardsAnalytics,
  adjustUserPoints,
  
  // Students Management
  getAllStudents,
  getStudentDetails,
  getStudentsStatistics,
  filterStudentsByStatus,
  filterStudentsByProfile,
  filterStudentsByInstitution,
  filterStudentsByProgram,
  searchStudents,
  toggleUserStatus,
  getAdminDashboard,
  
  // Resources Management - Multi-roles
  getAllUserResources,
  getUserResourcesByCreator,
  getAllStudentResources,
  getAllTeacherResources,
  filterResourcesByRole,
  filterResourcesByStatus,
  filterResourcesByModule,
  filterResourcesByProgram,
  filterResourcesByDomain,
  getResourcesStatsByRole,
  getResourcesStatsByStatus,
  getResourcesStatsByModule,
  searchResources,
  searchResourcesByCreator,
  
  // Compatibilité
  getStudentResources,
} from "../services/adminService.js";


/**
 * ============================================================================
 * USER OVERVIEW MANAGEMENT
 * ============================================================================
 */


/**
 * @swagger
 * /admin/users/overview:
 *   get:
 *     summary: Get all users overview
 *     description: Récupère la vue d'ensemble complète de tous les utilisateurs (infos personnelles, profil académique, statistiques ressources)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users overview retrieved successfully
 */
export const getAllUsersOverviewHandler = asyncHandler(async (req, res) => {
  const users = await getAllUsersOverview();
  
  return successResponse(res, "Users overview retrieved successfully", {
    total: users.length,
    users,
  });
});

export const getUsersPointsOverviewHandler = asyncHandler(async (req, res) => {
  const includeAdmin = String(req.query.include_admin || "false") === "true";
  const users = await getUsersPointsOverview({ includeAdmin });

  return successResponse(res, "Users points overview retrieved successfully", {
    total: users.length,
    users,
  });
});

export const getContributorRewardsAnalyticsHandler = asyncHandler(async (_req, res) => {
  const result = await getContributorRewardsAnalytics();

  return successResponse(res, "Contributor rewards analytics retrieved successfully", result);
});

export const adjustUserPointsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { points_delta, note } = req.body;

  const result = await adjustUserPoints(userId, Number(points_delta), note || null);

  return successResponse(res, "User points updated successfully", result);
});

export const createAdminManagedUserHandler = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    full_name,
    role_name,
    institution_id,
    program_id,
    level_id,
    current_semester_id,
    preferred_tag_ids,
  } = req.body;

  const result = await createUserByAdmin({
    email,
    password,
    full_name,
    role_name,
    institution_id,
    program_id,
    level_id,
    current_semester_id,
    preferred_tag_ids,
  });

  return successResponse(res, "User created successfully", result, 201);
});


/**
 * ============================================================================
 * STUDENTS MANAGEMENT
 * ============================================================================
 */


/**
 * @swagger
 * /admin/students:
 *   get:
 *     summary: Get all students
 *     description: Récupère la liste complète de tous les étudiants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students list retrieved successfully
 */
export const getAllStudentsHandler = asyncHandler(async (req, res) => {
  const students = await getAllStudents();
  
  return successResponse(res, "Students list retrieved successfully", {
    total: students.length,
    students,
  });
});


/**
 * @swagger
 * /admin/students/{userId}:
 *   get:
 *     summary: Get student details
 *     description: Récupère les détails complets d'un étudiant spécifique
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *       404:
 *         description: Student not found
 */
export const getStudentDetailsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const student = await getStudentDetails(userId);
  
  return successResponse(res, "Student details retrieved successfully", student);
});


/**
 * @swagger
 * /admin/students/statistics:
 *   get:
 *     summary: Get students statistics
 *     description: Récupère les statistiques globales des étudiants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
export const getStudentsStatisticsHandler = asyncHandler(async (req, res) => {
  const stats = await getStudentsStatistics();
  
  return successResponse(res, "Statistics retrieved successfully", stats);
});


/**
 * @swagger
 * /admin/students/filter/status:
 *   get:
 *     summary: Filter students by status
 *     description: Filtrer les étudiants par statut actif/inactif
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: is_active
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Active status
 *     responses:
 *       200:
 *         description: Filtered students retrieved successfully
 */
export const filterStudentsByStatusHandler = asyncHandler(async (req, res) => {
  const { is_active } = req.query;
  const isActive = is_active === "true";
  
  const students = await filterStudentsByStatus(isActive);
  
  return successResponse(res, "Filtered students retrieved successfully", {
    total: students.length,
    filter: { is_active: isActive },
    students,
  });
});


/**
 * @swagger
 * /admin/students/filter/profile:
 *   get:
 *     summary: Filter students by profile completion
 *     description: Filtrer les étudiants par profil complété ou non
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: has_profile
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Profile completion status
 *     responses:
 *       200:
 *         description: Filtered students retrieved successfully
 */
export const filterStudentsByProfileHandler = asyncHandler(async (req, res) => {
  const { has_profile } = req.query;
  const hasProfile = has_profile === "true";
  
  const students = await filterStudentsByProfile(hasProfile);
  
  return successResponse(res, "Filtered students retrieved successfully", {
    total: students.length,
    filter: { has_profile: hasProfile },
    students,
  });
});


/**
 * @swagger
 * /admin/students/filter/institution/{institutionId}:
 *   get:
 *     summary: Filter students by institution
 *     description: Filtrer les étudiants par institution
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Institution ID
 *     responses:
 *       200:
 *         description: Filtered students retrieved successfully
 */
export const filterStudentsByInstitutionHandler = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const students = await filterStudentsByInstitution(institutionId);
  
  return successResponse(res, "Filtered students retrieved successfully", {
    total: students.length,
    filter: { institution_id: institutionId },
    students,
  });
});


/**
 * @swagger
 * /admin/students/filter/program/{programId}:
 *   get:
 *     summary: Filter students by program
 *     description: Filtrer les étudiants par programme académique
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Program ID
 *     responses:
 *       200:
 *         description: Filtered students retrieved successfully
 */
export const filterStudentsByProgramHandler = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const students = await filterStudentsByProgram(programId);
  
  return successResponse(res, "Filtered students retrieved successfully", {
    total: students.length,
    filter: { program_id: programId },
    students,
  });
});


/**
 * @swagger
 * /admin/students/search:
 *   get:
 *     summary: Search students
 *     description: Rechercher des étudiants par nom ou email
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */
export const searchStudentsHandler = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const students = await searchStudents(q);
  
  return successResponse(res, "Search results retrieved successfully", {
    total: students.length,
    search_term: q,
    students,
  });
});


/**
 * @swagger
 * /admin/users/{userId}/toggle-status:
 *   patch:
 *     summary: Toggle user status
 *     description: Activer ou désactiver un utilisateur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
export const toggleUserStatusHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { is_active } = req.body;
  
  const result = await toggleUserStatus(userId, is_active);
  
  return successResponse(res, result.message, result);
});


/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard
 *     description: Récupère toutes les statistiques pour le dashboard admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
export const getAdminDashboardHandler = asyncHandler(async (req, res) => {
  const dashboard = await getAdminDashboard();
  
  return successResponse(res, "Dashboard data retrieved successfully", dashboard);
});


/**
 * ============================================================================
 * RESOURCES MANAGEMENT - MULTI-ROLES
 * ============================================================================
 */


/**
 * @swagger
 * /admin/resources:
 *   get:
 *     summary: Get all resources (multi-roles)
 *     description: Récupère toutes les resources de tous les utilisateurs avec filtres optionnels
 *     tags: [Admin - Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, teacher, admin]
 *         description: Filtrer par rôle du créateur
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filtrer par statut de la resource
 *       - in: query
 *         name: creator_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par créateur spécifique
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: integer
 *         description: Filtrer par module
 *       - in: query
 *         name: program_id
 *         schema:
 *           type: integer
 *         description: Filtrer par programme
 *       - in: query
 *         name: domain_id
 *         schema:
 *           type: integer
 *         description: Filtrer par domaine
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher dans titre/description
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 */
export const getAllResourcesHandler = asyncHandler(async (req, res) => {
  const { role, status, creator_id, module_id, program_id, domain_id, search } = req.query;
  
  let resources;
  let filterApplied = {};
  
  // Priorité des filtres
  if (search) {
    if (creator_id) {
      resources = await searchResourcesByCreator(search, creator_id);
      filterApplied = { search, creator_id };
    } else {
      resources = await searchResources(search);
      filterApplied = { search };
    }
  } else if (creator_id) {
    resources = await getUserResourcesByCreator(creator_id);
    filterApplied = { creator_id };
  } else if (role) {
    resources = await filterResourcesByRole(role);
    filterApplied = { role };
  } else if (status) {
    resources = await filterResourcesByStatus(status);
    filterApplied = { status };
  } else if (module_id) {
    resources = await filterResourcesByModule(module_id);
    filterApplied = { module_id };
  } else if (program_id) {
    resources = await filterResourcesByProgram(program_id);
    filterApplied = { program_id };
  } else if (domain_id) {
    resources = await filterResourcesByDomain(domain_id);
    filterApplied = { domain_id };
  } else {
    resources = await getAllUserResources();
    filterApplied = { all: true };
  }
  
  return successResponse(res, "Resources retrieved successfully", {
    total: resources.length,
    filter: filterApplied,
    resources,
  });
});


/**
 * @swagger
 * /admin/resources/students:
 *   get:
 *     summary: Get all student resources
 *     description: Récupère toutes les resources créées par les étudiants
 *     tags: [Admin - Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student resources retrieved successfully
 */
export const getAllStudentResourcesHandler = asyncHandler(async (req, res) => {
  const resources = await getAllStudentResources();
  
  return successResponse(res, "Student resources retrieved successfully", {
    total: resources.length,
    resources,
  });
});


/**
 * @swagger
 * /admin/resources/teachers:
 *   get:
 *     summary: Get all teacher resources
 *     description: Récupère toutes les resources créées par les enseignants
 *     tags: [Admin - Resources]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher resources retrieved successfully
 */
export const getAllTeacherResourcesHandler = asyncHandler(async (req, res) => {
  const resources = await getAllTeacherResources();
  
  return successResponse(res, "Teacher resources retrieved successfully", {
    total: resources.length,
    resources,
  });
});


/**
 * @swagger
 * /admin/resources/statistics:
 *   get:
 *     summary: Get resources statistics
 *     description: Récupère les statistiques des resources (par rôle, statut, module)
 *     tags: [Admin - Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [role, status, module]
 *         description: Grouper les statistiques par
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
export const getResourcesStatisticsHandler = asyncHandler(async (req, res) => {
  const { group_by } = req.query;
  
  let stats;
  
  switch (group_by) {
    case "status":
      stats = await getResourcesStatsByStatus();
      break;
    case "module":
      stats = await getResourcesStatsByModule();
      break;
    case "role":
    default:
      stats = await getResourcesStatsByRole();
      break;
  }
  
  return successResponse(res, "Statistics retrieved successfully", {
    group_by: group_by || "role",
    statistics: stats,
  });
});


/**
 * ============================================================================
 * COMPATIBILITÉ - ANCIENNES ROUTES
 * ============================================================================
 */


/**
 * @swagger
 * /admin/students/{userId}/resources:
 *   get:
 *     summary: Get student resources (legacy)
 *     description: Récupère les resources d'un étudiant spécifique (ancienne route, utilise getUserResourcesByCreator)
 *     tags: [Admin - Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Student resources retrieved successfully
 *     deprecated: true
 */
export const getStudentResourcesHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const resources = await getStudentResources(userId);
  
  return successResponse(res, "Student resources retrieved successfully", {
    total: resources.length,
    user_id: userId,
    resources,
  });
});
