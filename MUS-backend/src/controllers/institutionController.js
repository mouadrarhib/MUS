import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitutionById,
  deleteInstitutionById,
} from "../services/institutionService.js";

/**
 * @swagger
 * tags:
 *   name: Institutions
 *   description: Institution management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Institution:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         institution_type_id:
 *           type: integer
 *           format: int64
 *         country:
 *           type: string
 *         city:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     InstitutionRequest:
 *       type: object
 *       required: [name, institution_type_id]
 *       properties:
 *         name:
 *           type: string
 *           example: "ABC University"
 *         institution_type_id:
 *           type: integer
 *           example: 1
 *         country:
 *           type: string
 *           example: "USA"
 *         city:
 *           type: string
 *           example: "New York"
 */

/**
 * @swagger
 * /institutions:
 *   post:
 *     summary: Create a new institution
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstitutionRequest'
 *     responses:
 *       201:
 *         description: Institution created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 */
export const addInstitution = asyncHandler(async (req, res) => {
  const result = await createInstitution(req.body);
  return successResponse(res, "Institution created successfully", result, 201);
});

/**
 * @swagger
 * /institutions:
 *   get:
 *     summary: Get all institutions
 *     tags: [Institutions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Institution'
 */
export const listInstitutions = asyncHandler(async (req, res) => {
  const result = await getAllInstitutions();
  return successResponse(res, "Institutions retrieved successfully", result);
});

/**
 * @swagger
 * /institutions/{id}:
 *   get:
 *     summary: Get an institution by ID
 *     tags: [Institutions]
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
 *         description: Institution data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 */
export const getInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getInstitutionById(id);
  return successResponse(res, "Institution retrieved successfully", result);
});

/**
 * @swagger
 * /institutions/{id}:
 *   patch:
 *     summary: Update an institution by ID
 *     tags: [Institutions]
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
 *             $ref: '#/components/schemas/InstitutionRequest'
 *     responses:
 *       200:
 *         description: Institution updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 */
export const updateInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await updateInstitutionById(id, req.body);
  return successResponse(res, "Institution updated successfully", result);
});

/**
 * @swagger
 * /institutions/{id}:
 *   delete:
 *     summary: Delete an institution by ID
 *     tags: [Institutions]
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
 *         description: Institution deleted
 */
export const deleteInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteInstitutionById(id);
  return successResponse(res, "Institution deleted successfully", result);
});
