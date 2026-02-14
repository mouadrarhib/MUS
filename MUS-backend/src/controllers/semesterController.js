import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
  deleteSemester,
  getSemesterByNameLevel,
  searchSemesters,
  getSemestersWithModuleCount,
  getSemesterModules,
  updateSemesterSortOrder,
  reorderSemesters,
  getNextSortOrder,
  countSemesterModules,
  getSemesterFullHierarchy,
  getSemesterFullDetails,
  getSemestersByLevel,
} from "../services/semesterService.js";

/**
 * @swagger
 * tags:
 *   name: Semesters
 *   description: Semester management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Semester:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         level_id:
 *           type: integer
 *         name:
 *           type: string
 *         sort_order:
 *           type: integer
 *     SemesterRequest:
 *       type: object
 *       required: [level_id, name, sort_order]
 *       properties:
 *         level_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Semester 1"
 *         sort_order:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /semesters:
 *   post:
 *     summary: Create a new semester
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SemesterRequest'
 *     responses:
 *       201:
 *         description: Semester created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 */
export const addSemester = asyncHandler(async (req, res) => {
  const { level_id, name, sort_order } = req.body;
  const result = await createSemester(level_id, name, sort_order);
  return successResponse(res, "Semester created successfully", result, 201);
});

/**
 * @swagger
 * /semesters:
 *   get:
 *     summary: Get all semesters
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of semesters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semester'
 */
export const listSemesters = asyncHandler(async (req, res) => {
  const result = await getAllSemesters();
  return successResponse(res, "Semesters retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}:
 *   get:
 *     summary: Get a semester by ID
 *     tags: [Semesters]
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
 *         description: Semester data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 */
export const getSemester = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getSemesterById(id);
  return successResponse(res, "Semester retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}:
 *   patch:
 *     summary: Update a semester by ID
 *     tags: [Semesters]
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
 *             $ref: '#/components/schemas/SemesterRequest'
 *     responses:
 *       200:
 *         description: Semester updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 */
export const updateExistingSemester = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, level_id, sort_order } = req.body;
  const result = await updateSemester(id, name, level_id, sort_order);
  return successResponse(res, "Semester updated successfully", result);
});

/**
 * @swagger
 * /semesters/{id}:
 *   delete:
 *     summary: Delete a semester by ID
 *     tags: [Semesters]
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
 *         description: Semester deleted
 */
export const deleteExistingSemester = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteSemester(id);
  return successResponse(res, "Semester deleted successfully");
});

/**
 * @swagger
 * /semesters/level/{levelId}/name/{name}:
 *   get:
 *     summary: Get a semester by name and level
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: levelId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Semester data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semester'
 */
export const getSemesterByNameLevelHandler = asyncHandler(async (req, res) => {
  const { name, levelId } = req.params;
  const result = await getSemesterByNameLevel(name, levelId);
  return successResponse(res, "Semester retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/search/{searchTerm}:
 *   get:
 *     summary: Search for semesters
 *     tags: [Semesters]
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
 *         description: A list of semesters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semester'
 */
export const searchSemestersHandler = asyncHandler(async (req, res) => {
  const { searchTerm } = req.params;
  const result = await searchSemesters(searchTerm);
  return successResponse(res, "Semesters retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/with-module-count:
 *   get:
 *     summary: Get all semesters with a count of their modules
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of semesters with module counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   level_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   sort_order:
 *                     type: integer
 *                   module_count:
 *                     type: integer
 */
export const listSemestersWithModuleCount = asyncHandler(async (req, res) => {
  const result = await getSemestersWithModuleCount();
  return successResponse(res, "Semesters with module count retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}/modules:
 *   get:
 *     summary: Get all modules for a specific semester
 *     tags: [Semesters]
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
 *         description: A list of modules for the semester
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 */
export const listSemesterModules = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getSemesterModules(id);
  return successResponse(res, "Semester modules retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}/sort-order:
 *   patch:
 *     summary: Update a semester's sort order
 *     tags: [Semesters]
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
 *             required: [sort_order]
 *             properties:
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Semester sort order updated
 */
export const updateSemesterSortOrderHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sort_order } = req.body;
  const result = await updateSemesterSortOrder(id, sort_order);
  return successResponse(res, "Semester sort order updated successfully", result);
});

/**
 * @swagger
 * /semesters/reorder:
 *   post:
 *     summary: Reorder two semesters
 *     tags: [Semesters]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [semester_id_1, semester_id_2]
 *             properties:
 *               semester_id_1:
 *                 type: integer
 *               semester_id_2:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Semesters reordered successfully
 */
export const reorderSemestersHandler = asyncHandler(async (req, res) => {
  const { semester_id_1, semester_id_2 } = req.body;
  await reorderSemesters(semester_id_1, semester_id_2);
  return successResponse(res, "Semesters reordered successfully");
});

/**
 * @swagger
 * /semesters/level/{levelId}/next-sort-order:
 *   get:
 *     summary: Get the next sort order for a level
 *     tags: [Semesters]
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
 *         description: Next sort order value
 */
export const getNextSortOrderHandler = asyncHandler(async (req, res) => {
  const { levelId } = req.params;
  const result = await getNextSortOrder(levelId);
  return successResponse(res, "Next sort order retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}/modules/count:
 *   get:
 *     summary: Count all modules for a specific semester
 *     tags: [Semesters]
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
 *         description: The number of modules for the semester
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countSemesterModulesHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await countSemesterModules(id);
  return successResponse(res, "Semester modules count retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}/full-hierarchy:
 *   get:
 *     summary: Get full hierarchy for a semester
 *     tags: [Semesters]
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
 *         description: Full semester hierarchy
 */
export const getSemesterFullHierarchyHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getSemesterFullHierarchy(id);
  return successResponse(res, "Semester full hierarchy retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/{id}/full-details:
 *   get:
 *     summary: Get full details for a semester
 *     tags: [Semesters]
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
 *         description: Full semester details
 */
export const getSemesterFullDetailsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getSemesterFullDetails(id);
  return successResponse(res, "Semester full details retrieved successfully", result);
});

/**
 * @swagger
 * /semesters/level/{levelId}:
 *   get:
 *     summary: Get all semesters for a specific level
 *     tags: [Semesters]
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
 *         description: A list of semesters for the level
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semester'
 */
export const listSemestersByLevel = asyncHandler(async (req, res) => {
  const { levelId } = req.params;
  const result = await getSemestersByLevel(levelId);
  return successResponse(res, "Semesters retrieved successfully", result);
});
