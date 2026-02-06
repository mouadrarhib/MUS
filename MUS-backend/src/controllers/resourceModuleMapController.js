import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  addResourceToModule,
  removeResourceFromModule,
  getModulesByResource,
  getResourcesByModule,
  updateResourceModuleMap,
  getAvailableModulesForStudent,
  removeAllModulesFromResource,
} from "../services/resourceModuleMapService.js";
import { getCurrentUserId } from "../middleware/auth.js";

/**
 * @swagger
 * tags:
 *   name: Resource-Module
 *   description: Association entre resources et modules
 */

/**
 * @swagger
 * /resources/{resourceId}/modules:
 *   post:
 *     summary: Associate a resource with a module
 *     description: Associe une resource à un module (student doit être le créateur de la resource)
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la resource
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - module_id
 *             properties:
 *               module_id:
 *                 type: integer
 *                 example: 1
 *               chapter:
 *                 type: string
 *                 example: "Chapitre 1"
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 example: medium
 *               exam_related:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Association created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource or module not found
 *       409:
 *         description: Association already exists
 */
export const addModuleToResourceHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { module_id, chapter, difficulty, exam_related } = req.body;
  
  const result = await addResourceToModule(
    parseInt(resourceId),
    module_id,
    chapter,
    difficulty,
    exam_related
  );
  
  return successResponse(res, "Resource associated with module successfully", result, 201);
});

/**
 * @swagger
 * /resources/{resourceId}/modules/{moduleId}:
 *   delete:
 *     summary: Remove module from resource
 *     description: Retire l'association entre une resource et un module
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Association removed successfully
 *       404:
 *         description: Association not found
 */
export const removeModuleFromResourceHandler = asyncHandler(async (req, res) => {
  const { resourceId, moduleId } = req.params;
  
  const result = await removeResourceFromModule(
    parseInt(resourceId),
    parseInt(moduleId)
  );
  
  return successResponse(res, result.message);
});

/**
 * @swagger
 * /resources/{resourceId}/modules:
 *   get:
 *     summary: Get all modules of a resource
 *     description: Récupère tous les modules associés à une resource avec la hiérarchie académique complète
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modules retrieved successfully
 */
export const getModulesByResourceHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  
  const modules = await getModulesByResource(parseInt(resourceId));
  
  return successResponse(res, "Modules retrieved successfully", {
    total: modules.length,
    modules,
  });
});

/**
 * @swagger
 * /modules/{moduleId}/resources:
 *   get:
 *     summary: Get all resources of a module
 *     description: Récupère toutes les resources associées à un module
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 */
export const getResourcesByModuleHandler = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  
  const resources = await getResourcesByModule(parseInt(moduleId));
  
  return successResponse(res, "Resources retrieved successfully", {
    total: resources.length,
    resources,
  });
});

/**
 * @swagger
 * /resources/{resourceId}/modules/{moduleId}:
 *   patch:
 *     summary: Update resource-module association details
 *     description: Met à jour les infos d'association (chapter, difficulty, exam_related)
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
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
 *               chapter:
 *                 type: string
 *                 example: "Chapitre 2"
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 example: hard
 *               exam_related:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Association updated successfully
 */
export const updateResourceModuleMapHandler = asyncHandler(async (req, res) => {
  const { resourceId, moduleId } = req.params;
  const { chapter, difficulty, exam_related } = req.body;
  
  const result = await updateResourceModuleMap(
    parseInt(resourceId),
    parseInt(moduleId),
    { chapter, difficulty, examRelated: exam_related }
  );
  
  return successResponse(res, "Association updated successfully", result);
});

/**
 * @swagger
 * /students/me/available-modules:
 *   get:
 *     summary: Get available modules for current student
 *     description: Récupère les modules disponibles pour le semestre actuel du student connecté
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available modules retrieved successfully
 */
export const getAvailableModulesHandler = asyncHandler(async (req, res) => {
  const userId = getCurrentUserId();
  
  const modules = await getAvailableModulesForStudent(userId);
  
  return successResponse(res, "Available modules retrieved successfully", {
    total: modules.length,
    modules,
  });
});

/**
 * @swagger
 * /resources/{resourceId}/modules:
 *   delete:
 *     summary: Remove all modules from a resource
 *     description: Supprime toutes les associations entre une resource et ses modules
 *     tags: [Resource-Module]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All associations removed successfully
 */
export const removeAllModulesHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  
  const result = await removeAllModulesFromResource(parseInt(resourceId));
  
  return successResponse(res, result.message, {
    deleted_count: result.deleted_count,
  });
});
