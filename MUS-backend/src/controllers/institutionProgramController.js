import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  addProgramToInstitution,
  removeProgramFromInstitution,
  getProgramsByInstitution,
  getInstitutionsByProgram,
} from "../services/institutionProgramService.js";

/**
 * @swagger
 * tags:
 *   name: Institution Programs
 *   description: Institution-Program association management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InstitutionProgramRequest:
 *       type: object
 *       required: [institution_id, program_id]
 *       properties:
 *         institution_id:
 *           type: integer
 *           example: 1
 *         program_id:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /institution-programs/add:
 *   post:
 *     summary: Add a program to an institution
 *     tags: [Institution Programs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstitutionProgramRequest'
 *     responses:
 *       201:
 *         description: Association created
 */
export const addAssociation = asyncHandler(async (req, res) => {
  const result = await addProgramToInstitution(req.body);
  return successResponse(
    res,
    "Program added to institution successfully",
    result,
    201
  );
});

/**
 * @swagger
 * /institution-programs/remove:
 *   post:
 *     summary: Remove a program from an institution
 *     tags: [Institution Programs]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InstitutionProgramRequest'
 *     responses:
 *       200:
 *         description: Association removed
 */
export const removeAssociation = asyncHandler(async (req, res) => {
  const result = await removeProgramFromInstitution(req.body);
  return successResponse(
    res,
    "Program removed from institution successfully",
    result
  );
});

/**
 * @swagger
 * /institutions/{id}/programs:
 *   get:
 *     summary: Get all programs for an institution
 *     tags: [Institution Programs]
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
 *         description: A list of programs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Program'
 */
export const listProgramsByInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getProgramsByInstitution(id);
  return successResponse(
    res,
    "Programs for institution retrieved successfully",
    result
  );
});

/**
 * @swagger
 * /programs/{id}/institutions:
 *   get:
 *     summary: Get all institutions for a program
 *     tags: [Institution Programs]
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
 *         description: A list of institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Institution'
 */
export const listInstitutionsByProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getInstitutionsByProgram(id);
  return successResponse(
    res,
    "Institutions for program retrieved successfully",
    result
  );
});
