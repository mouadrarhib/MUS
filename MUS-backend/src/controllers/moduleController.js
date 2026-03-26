import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createModule,
  getModuleById,
  getModuleByCodeSemester,
  getAllModules,
  getModulesBySemester,
  updateModule,
  deleteModule,
  moduleExists,
  searchModules,
  getModulesWithResourceCount,
  getModuleResources,
  countModuleResources,
  getModuleFullHierarchy,
  getModuleFullDetails,
  getModulesByLevel,
  getModulesByProgram,
  getModulesByDomain,
  countModulesBySemester,
  getModuleStatistics,
  getModulesByResourceType,
  getDiscoverModules,
} from "../services/moduleService.js";

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Module management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         semester_id:
 *           type: integer
 *         code:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     ModuleRequest:
 *       type: object
 *       required: [semester_id, code, title]
 *       properties:
 *         semester_id:
 *           type: integer
 *           example: 5
 *         code:
 *           type: string
 *           example: "INFO301"
 *         title:
 *           type: string
 *           example: "Programmation Web"
 *         description:
 *           type: string
 *           example: "Introduction au développement web avec HTML, CSS, JavaScript et PHP"
 */

/**
 * @swagger
 * /modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModuleRequest'
 *     responses:
 *       201:
 *         description: Module created successfully
 *       400:
 *         description: Module already exists
 */
export const addModule = asyncHandler(async (req, res) => {
  const { semester_id, code, title, description } = req.body;

  // Check if module already exists
  const exists = await moduleExists(code, semester_id);
  if (exists) {
    return res.status(400).json({
      success: false,
      message: `Module with code "${code}" already exists in this semester`,
    });
  }

  const result = await createModule(semester_id, code, title, description);
  return successResponse(res, "Module created successfully", result, 201);
});

/**
 * @swagger
 * /modules:
 *   get:
 *     summary: Get all modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const listModules = asyncHandler(async (req, res) => {
  const result = await getAllModules();
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     summary: Get a module by ID
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module data
 *       404:
 *         description: Module not found
 */
export const getModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getModuleById(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return successResponse(res, "Module retrieved successfully", result);
});

/**
 * @swagger
 * /modules/code/{code}/semester/{semesterId}:
 *   get:
 *     summary: Get a module by code and semester
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Module code (e.g., INFO301)
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Semester ID
 *     responses:
 *       200:
 *         description: Module data
 *       404:
 *         description: Module not found
 */
export const getModuleByCode = asyncHandler(async (req, res) => {
  const { code, semesterId } = req.params;
  const result = await getModuleByCodeSemester(code, semesterId);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: `Module with code "${code}" not found in this semester`,
    });
  }

  return successResponse(res, "Module retrieved successfully", result);
});

/**
 * @swagger
 * /modules/{id}:
 *   patch:
 *     summary: Update a module by ID
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               semester_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module updated successfully
 */
export const updateExistingModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, title, description, semester_id } = req.body;

  const result = await updateModule(id, code, title, description, semester_id);
  return successResponse(res, "Module updated successfully", result);
});

/**
 * @swagger
 * /modules/{id}:
 *   delete:
 *     summary: Delete a module by ID
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module deleted successfully
 */
export const deleteExistingModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteModule(id);
  return successResponse(res, "Module deleted successfully");
});

/**
 * @swagger
 * /modules/semester/{semesterId}:
 *   get:
 *     summary: Get all modules by semester
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const listModulesBySemester = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;
  const result = await getModulesBySemester(semesterId);
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/level/{levelId}:
 *   get:
 *     summary: Get all modules by level
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const listModulesByLevel = asyncHandler(async (req, res) => {
  const { levelId } = req.params;
  const result = await getModulesByLevel(levelId);
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/program/{programId}:
 *   get:
 *     summary: Get all modules by program
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const listModulesByProgram = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const result = await getModulesByProgram(programId);
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/domain/{domainId}:
 *   get:
 *     summary: Get all modules by domain
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: domainId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const listModulesByDomain = asyncHandler(async (req, res) => {
  const { domainId } = req.params;
  const result = await getModulesByDomain(domainId);
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/search/{searchTerm}:
 *   get:
 *     summary: Search for modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const searchModulesHandler = asyncHandler(async (req, res) => {
  const { searchTerm } = req.params;
  const result = await searchModules(searchTerm);
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/with-resource-count:
 *   get:
 *     summary: Get all modules with resource count
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of modules with resource count
 */
export const listModulesWithResourceCount = asyncHandler(async (req, res) => {
  const result = await getModulesWithResourceCount();
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/{id}/resources:
 *   get:
 *     summary: Get all resources for a module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of resources
 */
export const getModuleResourcesHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const educationalType = String(req.query?.educational_type || "").trim() || null;
  const result = await getModuleResources(id, req.user || null, educationalType);
  return successResponse(res, "Module resources retrieved successfully", result);
});

/**
 * @swagger
 * /modules/{id}/resources/count:
 *   get:
 *     summary: Count resources for a module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource count
 */
export const countModuleResourcesHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const educationalType = String(req.query?.educational_type || "").trim() || null;
  const result = await countModuleResources(id, req.user || null, educationalType);
  return successResponse(res, "Resource count retrieved successfully", { count: result });
});

export const listDiscoverModules = asyncHandler(async (_req, res) => {
  const result = await getDiscoverModules();
  return successResponse(res, "Discover modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/{id}/hierarchy:
 *   get:
 *     summary: Get module full hierarchy
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module hierarchy
 */
export const getModuleHierarchyHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getModuleFullHierarchy(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return successResponse(res, "Module hierarchy retrieved successfully", result);
});

/**
 * @swagger
 * /modules/{id}/details:
 *   get:
 *     summary: Get module full details
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module full details
 */
export const getModuleDetailsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getModuleFullDetails(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return successResponse(res, "Module details retrieved successfully", result);
});

/**
 * @swagger
 * /modules/semester/{semesterId}/count:
 *   get:
 *     summary: Count modules by semester
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module count
 */
export const countModulesBySemesterHandler = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;
  const result = await countModulesBySemester(semesterId);
  return successResponse(res, "Module count retrieved successfully", { count: result });
});

/**
 * @swagger
 * /modules/{id}/statistics:
 *   get:
 *     summary: Get module statistics
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module statistics
 */
export const getModuleStatisticsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getModuleStatistics(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  return successResponse(res, "Module statistics retrieved successfully", result);
});

/**
 * @swagger
 * /modules/resource-type/{resourceTypeId}:
 *   get:
 *     summary: Get modules by resource type
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceTypeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of modules
 */
export const listModulesByResourceType = asyncHandler(async (req, res) => {
  const { resourceTypeId } = req.params;
  const result = await getModulesByResourceType(resourceTypeId);
  return successResponse(res, "Modules retrieved successfully", result);
});

/**
 * @swagger
 * /modules/check-exists:
 *   post:
 *     summary: Check if module exists
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, semester_id]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "INFO301"
 *               semester_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Existence check result
 */
export const checkModuleExists = asyncHandler(async (req, res) => {
  const { code, semester_id } = req.body;
  const exists = await moduleExists(code, semester_id);
  return successResponse(res, "Module existence checked", { exists });
});
