import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
  getLevelByNameProgram,
  searchLevels,
  getLevelsWithSemesterCount,
  getLevelSemesters,
  updateLevelSortOrder,
  reorderLevels,
  getNextSortOrder,
  countLevelSemesters,
  getLevelFullDetails,
  getLevelsByProgram,
} from "../services/levelService.js";

/**
 * @swagger
 * tags:
 *   name: Levels
 *   description: Level management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Level:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         program_id:
 *           type: integer
 *         name:
 *           type: string
 *         sort_order:
 *           type: integer
 *     LevelRequest:
 *       type: object
 *       required: [program_id, name, sort_order]
 *       properties:
 *         program_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Year 1"
 *         sort_order:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /levels:
 *   post:
 *     summary: Create a new level
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LevelRequest'
 *     responses:
 *       201:
 *         description: Level created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Level'
 */
export const addLevel = asyncHandler(async (req, res) => {
  const { program_id, name, sort_order } = req.body;
  const result = await createLevel(program_id, name, sort_order);
  return successResponse(res, "Level created successfully", result, 201);
});

/**
 * @swagger
 * /levels:
 *   get:
 *     summary: Get all levels
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Level'
 */
export const listLevels = asyncHandler(async (req, res) => {
  const result = await getAllLevels();
  return successResponse(res, "Levels retrieved successfully", result);
});

/**
 * @swagger
 * /levels/{id}:
 *   get:
 *     summary: Get a level by ID
 *     tags: [Levels]
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
 *         description: Level data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Level'
 */
export const getLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getLevelById(id);
  return successResponse(res, "Level retrieved successfully", result);
});

/**
 * @swagger
 * /levels/{id}:
 *   patch:
 *     summary: Update a level by ID
 *     tags: [Levels]
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
 *             $ref: '#/components/schemas/LevelRequest'
 *     responses:
 *       200:
 *         description: Level updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Level'
 */
export const updateExistingLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, program_id, sort_order } = req.body;
  const result = await updateLevel(id, name, program_id, sort_order);
  return successResponse(res, "Level updated successfully", result);
});

/**
 * @swagger
 * /levels/{id}:
 *   delete:
 *     summary: Delete a level by ID
 *     tags: [Levels]
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
 *         description: Level deleted
 */
export const deleteExistingLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteLevel(id);
  return successResponse(res, "Level deleted successfully");
});

/**
 * @swagger
 * /levels/program/{programId}/name/{name}:
 *   get:
 *     summary: Get a level by name and program
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
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
 *         description: Level data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Level'
 */
export const getLevelByNameProgramHandler = asyncHandler(async (req, res) => {
  const { name, programId } = req.params;
  const result = await getLevelByNameProgram(name, programId);
  return successResponse(res, "Level retrieved successfully", result);
});

/**
 * @swagger
 * /levels/search/{searchTerm}:
 *   get:
 *     summary: Search for levels
 *     tags: [Levels]
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
 *         description: A list of levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Level'
 */
export const searchLevelsHandler = asyncHandler(async (req, res) => {
  const { searchTerm } = req.params;
  const result = await searchLevels(searchTerm);
  return successResponse(res, "Levels retrieved successfully", result);
});

/**
 * @swagger
 * /levels/with-semester-count:
 *   get:
 *     summary: Get all levels with a count of their semesters
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of levels with semester counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   program_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   sort_order:
 *                     type: integer
 *                   semester_count:
 *                     type: integer
 */
export const listLevelsWithSemesterCount = asyncHandler(async (req, res) => {
  const result = await getLevelsWithSemesterCount();
  return successResponse(res, "Levels with semester count retrieved successfully", result);
});

/**
 * @swagger
 * /levels/{id}/semesters:
 *   get:
 *     summary: Get all semesters for a specific level
 *     tags: [Levels]
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
 *         description: A list of semesters for the level
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semester'
 */
export const listLevelSemesters = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getLevelSemesters(id);
  return successResponse(res, "Level semesters retrieved successfully", result);
});

/**
 * @swagger
 * /levels/{id}/sort-order:
 *   patch:
 *     summary: Update a level's sort order
 *     tags: [Levels]
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
 *         description: Level sort order updated
 */
export const updateLevelSortOrderHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sort_order } = req.body;
  const result = await updateLevelSortOrder(id, sort_order);
  return successResponse(res, "Level sort order updated successfully", result);
});

/**
 * @swagger
 * /levels/reorder:
 *   post:
 *     summary: Reorder two levels
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [level_id_1, level_id_2]
 *             properties:
 *               level_id_1:
 *                 type: integer
 *               level_id_2:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Levels reordered successfully
 */
export const reorderLevelsHandler = asyncHandler(async (req, res) => {
  const { level_id_1, level_id_2 } = req.body;
  await reorderLevels(level_id_1, level_id_2);
  return successResponse(res, "Levels reordered successfully");
});

/**
 * @swagger
 * /levels/program/{programId}/next-sort-order:
 *   get:
 *     summary: Get the next sort order for a program
 *     tags: [Levels]
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
 *         description: Next sort order value
 */
export const getNextSortOrderHandler = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const result = await getNextSortOrder(programId);
  return successResponse(res, "Next sort order retrieved successfully", result);
});

/**
 * @swagger
 * /levels/{id}/semesters/count:
 *   get:
 *     summary: Count all semesters for a specific level
 *     tags: [Levels]
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
 *         description: The number of semesters for the level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countLevelSemestersHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await countLevelSemesters(id);
  return successResponse(res, "Level semesters count retrieved successfully", result);
});

/**
 * @swagger
 * /levels/{id}/full-details:
 *   get:
 *     summary: Get full details for a level
 *     tags: [Levels]
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
 *         description: Full level details
 */
export const getLevelFullDetailsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getLevelFullDetails(id);
  return successResponse(res, "Level full details retrieved successfully", result);
});

/**
 * @swagger
 * /levels/program/{programId}:
 *   get:
 *     summary: Get all levels for a specific program
 *     tags: [Levels]
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
 *         description: A list of levels for the program
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Level'
 */
export const listLevelsByProgram = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const result = await getLevelsByProgram(programId);
  return successResponse(res, "Levels retrieved successfully", result);
});
