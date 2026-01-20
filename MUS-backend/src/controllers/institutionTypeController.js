import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createInstitutionType,
  getAllInstitutionTypes,
  getInstitutionTypeById,
  updateInstitutionTypeById,
  deleteInstitutionTypeById,
} from "../services/institutionTypeService.js";

/**
 * @swagger
 * tags:
 *   name: Institution Types
 *   description: Institution type management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InstitutionType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: The institution type ID.
 *         name:
 *           type: string
 *           description: The name of the institution type.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the institution type was created.
 *     InstitutionTypeRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: University
 */

/**
 * @swagger
 * /institution-types:
 *   post:
 *     summary: Create a new institution type
 *     tags: [Institution Types]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstitutionTypeRequest'
 *     responses:
 *       201:
 *         description: Institution type created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionType'
 */
export const addInstitutionType = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const result = await createInstitutionType({ name });
  return successResponse(
    res,
    "Institution type created successfully",
    result,
    201
  );
});

/**
 * @swagger
 * /institution-types:
 *   get:
 *     summary: Get all institution types
 *     tags: [Institution Types]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of institution types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InstitutionType'
 */
export const listInstitutionTypes = asyncHandler(async (req, res) => {
  const result = await getAllInstitutionTypes();
  return successResponse(res, "Institution types retrieved successfully", result);
});

/**
 * @swagger
 * /institution-types/{id}:
 *   get:
 *     summary: Get an institution type by ID
 *     tags: [Institution Types]
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
 *         description: Institution type data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionType'
 */
export const getInstitutionType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getInstitutionTypeById(id);
  return successResponse(res, "Institution type retrieved successfully", result);
});

/**
 * @swagger
 * /institution-types/{id}:
 *   patch:
 *     summary: Update an institution type by ID
 *     tags: [Institution Types]
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
 *             $ref: '#/components/schemas/InstitutionTypeRequest'
 *     responses:
 *       200:
 *         description: Institution type updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionType'
 */
export const updateInstitutionType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const result = await updateInstitutionTypeById(id, { name });
  return successResponse(res, "Institution type updated successfully", result);
});

/**
 * @swagger
 * /institution-types/{id}:
 *   delete:
 *     summary: Delete an institution type by ID
 *     tags: [Institution Types]
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
 *         description: Institution type deleted
 */
export const deleteInstitutionType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteInstitutionTypeById(id);
  return successResponse(res, "Institution type deleted successfully", result);
});
