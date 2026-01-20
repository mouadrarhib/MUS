import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgramById,
  deleteProgramById,
} from "../services/programService.js";

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Program management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Program:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         domain_id:
 *           type: integer
 *           format: int64
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ProgramRequest:
 *       type: object
 *       required: [name, domain_id]
 *       properties:
 *         name:
 *           type: string
 *           example: "Software Engineering"
 *         domain_id:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /programs:
 *   post:
 *     summary: Create a new program
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgramRequest'
 *     responses:
 *       201:
 *         description: Program created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Program'
 */
export const addProgram = asyncHandler(async (req, res) => {
  const result = await createProgram(req.body);
  return successResponse(res, "Program created successfully", result, 201);
});

/**
 * @swagger
 * /programs:
 *   get:
 *     summary: Get all programs
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Program'
 */
export const listPrograms = asyncHandler(async (req, res) => {
  const result = await getAllPrograms();
  return successResponse(res, "Programs retrieved successfully", result);
});

/**
 * @swagger
 * /programs/{id}:
 *   get:
 *     summary: Get a program by ID
 *     tags: [Programs]
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
 *         description: Program data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Program'
 */
export const getProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getProgramById(id);
  return successResponse(res, "Program retrieved successfully", result);
});

/**
 * @swagger
 * /programs/{id}:
 *   patch:
 *     summary: Update a program by ID
 *     tags: [Programs]
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
 *             $ref: '#/components/schemas/ProgramRequest'
 *     responses:
 *       200:
 *         description: Program updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Program'
 */
export const updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await updateProgramById(id, req.body);
  return successResponse(res, "Program updated successfully", result);
});

/**
 * @swagger
 * /programs/{id}:
 *   delete:
 *     summary: Delete a program by ID
 *     tags: [Programs]
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
 *         description: Program deleted
 */
export const deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteProgramById(id);
  return successResponse(res, "Program deleted successfully", result);
});
