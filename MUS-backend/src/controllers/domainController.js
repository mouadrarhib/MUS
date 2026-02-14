import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
    createDomain,
    getAllDomains,
    getDomainById,
    updateDomain,
    deleteDomain,
    getDomainByName,
    searchDomains,
    getDomainsWithProgramCount,
    getDomainByIdWithPrograms,
    getDomainPrograms,
    countDomainPrograms,
} from "../services/domainService.js";

/**
 * @swagger
 * tags:
 *   name: Domains
 *   description: Domain management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Domain:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *     DomainRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: "Computer Science"
 */

/**
 * @swagger
 * /domains:
 *   post:
 *     summary: Create a new domain
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DomainRequest'
 *     responses:
 *       201:
 *         description: Domain created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
 */
export const addDomain = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const result = await createDomain(name);
    return successResponse(res, "Domain created successfully", result, 201);
});

/**
 * @swagger
 * /domains:
 *   get:
 *     summary: Get all domains
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of domains
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Domain'
 */
export const listDomains = asyncHandler(async (req, res) => {
    const result = await getAllDomains();
    return successResponse(res, "Domains retrieved successfully", result);
});

/**
 * @swagger
 * /domains/{id}:
 *   get:
 *     summary: Get a domain by ID
 *     tags: [Domains]
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
 *         description: Domain data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
 */
export const getDomain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await getDomainById(id);
    return successResponse(res, "Domain retrieved successfully", result);
});

/**
 * @swagger
 * /domains/{id}:
 *   patch:
 *     summary: Update a domain by ID
 *     tags: [Domains]
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
 *             $ref: '#/components/schemas/DomainRequest'
 *     responses:
 *       200:
 *         description: Domain updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
 */
export const updateExistingDomain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const result = await updateDomain(id, name);
    return successResponse(res, "Domain updated successfully", result);
});

/**
 * @swagger
 * /domains/{id}:
 *   delete:
 *     summary: Delete a domain by ID
 *     tags: [Domains]
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
 *         description: Domain deleted
 */
export const deleteExistingDomain = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deleteDomain(id);
    return successResponse(res, "Domain deleted successfully");
});

/**
 * @swagger
 * /domains/name/{name}:
 *   get:
 *     summary: Get a domain by name
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Domain data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Domain'
 */
export const getDomainByNameHandler = asyncHandler(async (req, res) => {
    const { name } = req.params;
    const result = await getDomainByName(name);
    return successResponse(res, "Domain retrieved successfully", result);
});

/**
 * @swagger
 * /domains/search/{searchTerm}:
 *   get:
 *     summary: Search for domains
 *     tags: [Domains]
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
 *         description: A list of domains
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Domain'
 */
export const searchDomainsHandler = asyncHandler(async (req, res) => {
    const { searchTerm } = req.params;
    const result = await searchDomains(searchTerm);
    return successResponse(res, "Domains retrieved successfully", result);
});

/**
 * @swagger
 * /domains/with-program-count:
 *   get:
 *     summary: Get all domains with a count of their programs
 *     tags: [Domains]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of domains with program counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   program_count:
 *                     type: integer
 */
export const listDomainsWithProgramCount = asyncHandler(async (req, res) => {
    const result = await getDomainsWithProgramCount();
    return successResponse(res, "Domains with program count retrieved successfully", result);
});

/**
 * @swagger
 * /domains/{id}/with-programs:
 *   get:
 *     summary: Get a domain by ID with its programs
 *     tags: [Domains]
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
 *         description: Domain data with a list of programs
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Domain'
 *                 - type: object
 *                   properties:
 *                     programs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Program'
 */
export const getDomainWithPrograms = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await getDomainByIdWithPrograms(id);
    return successResponse(res, "Domain with programs retrieved successfully", result);
});

/**
 * @swagger
 * /domains/{id}/programs:
 *   get:
 *     summary: Get all programs for a specific domain
 *     tags: [Domains]
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
 *         description: A list of programs for the domain
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Program'
 */
export const listDomainPrograms = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await getDomainPrograms(id);
    return successResponse(res, "Domain programs retrieved successfully", result);
});

/**
 * @swagger
 * /domains/{id}/programs/count:
 *   get:
 *     summary: Count all programs for a specific domain
 *     tags: [Domains]
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
 *         description: The number of programs for the domain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countDomainProgramsHandler = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await countDomainPrograms(id);
    return successResponse(res, "Domain programs count retrieved successfully", result);
});
