import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createResource,
  getAllResources,
  getResourceById,
  getResourcesByStatus,
  getResourcesByEducationalType,
  getResourcesByFormat,
  getResourcesByResourceType,
  getResourcesByCreator,
  getResourcesByLanguage,
  updateResource,
  updateResourceMetadata,
  updateResourceStatus,
  publishResource,
  archiveResource,
  deleteResource,
  searchResources,
  advancedSearchResources,
  searchResourcesByMetadata,
  getPublishedResources,
  countResourcesByStatus,
  countResourcesByEducationalType,
  countResourcesByFormat,
  countResourcesByCreator,
  getResourcesWithRatings,
  getResourceStatistics,
  getResourceStatuses,
  getResourceEducationalTypes,
  getResourceFormats,
  recordResourceDownload,
} from "../services/resourceService.js";


/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *         url:
 *           type: string
 *         language:
 *           type: string
 *         license:
 *           type: string
 *         created_by:
 *           type: string
 *           format: uuid
 *         educational_type:
 *           type: string
 *         format:
 *           type: string
 *         resource_type_id:
 *           type: integer
 *         metadata:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     ResourceRequest:
 *       type: object
 *       required: [title, status, resource_type_id]
 *       properties:
 *         title:
 *           type: string
 *           example: "Introduction to Programming"
 *         description:
 *           type: string
 *           example: "A comprehensive guide to programming basics"
 *         status:
 *           type: string
 *           example: "draft"
 *         url:
 *           type: string
 *           example: "https://example.com/resource.pdf"
 *         language:
 *           type: string
 *           example: "en"
 *         license:
 *           type: string
 *           example: "CC BY 4.0"
 *         educational_type:
 *           type: string
 *           example: "Lecture"
 *         format:
 *           type: string
 *           example: "PDF"
 *         resource_type_id:
 *           type: integer
 *           example: 1
 *         metadata:
 *           type: object
 *           example: {"author": "John Doe", "duration": "45 minutes"}
 */

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResourceRequest'
 *     responses:
 *       201:
 *         description: Resource created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 */
export const addResource = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    status, 
    url, 
    language, 
    license, 
    educational_type, 
    format, 
    resource_type_id, 
    metadata 
  } = req.body;
  
  // ✅ Get created_by from authenticated user
  const created_by = req.user.id;
  
  const result = await createResource(
    title,
    description,
    status,
    url,
    language,
    license,
    created_by,
    educational_type,
    format,
    resource_type_id,
    metadata,
    req.user
  );
  return successResponse(res, "Resource created successfully", result, 201);
});

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResources = asyncHandler(async (req, res) => {
  const result = await getAllResources(req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/my-resources:
 *   get:
 *     summary: Get all resources created by the authenticated user
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of user's resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listMyResources = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await getResourcesByCreator(userId, req.user || null);
  return successResponse(res, "Your resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
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
 *         description: Resource data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 */
export const getResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getResourceById(id);
  return successResponse(res, "Resource retrieved successfully", result);
});

/**
 * @swagger
 * /resources/{id}:
 *   patch:
 *     summary: Update a resource by ID
 *     tags: [Resources]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               url:
 *                 type: string
 *               language:
 *                 type: string
 *               license:
 *                 type: string
 *               educational_type:
 *                 type: string
 *               format:
 *                 type: string
 *               resource_type_id:
 *                 type: integer
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Resource updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 */
export const updateExistingResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    status, 
    url, 
    language, 
    license, 
    educational_type, 
    format, 
    resource_type_id, 
    metadata 
  } = req.body;
  
  const result = await updateResource(
    id,
    title,
    description,
    status,
    url,
    language,
    license,
    educational_type,
    format,
    resource_type_id,
    metadata,
    req.user
  );
  return successResponse(res, "Resource updated successfully", result);
});

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
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
 *         description: Resource deleted
 */
export const deleteExistingResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteResource(id, req.user);
  return successResponse(res, "Resource deleted successfully");
});

/**
 * @swagger
 * /resources/status/{status}:
 *   get:
 *     summary: Get all resources by status
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResourcesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const result = await getResourcesByStatus(status, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/educational-type/{educationalType}:
 *   get:
 *     summary: Get all resources by educational type
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: educationalType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResourcesByEducationalType = asyncHandler(async (req, res) => {
  const { educationalType } = req.params;
  const result = await getResourcesByEducationalType(educationalType, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/format/{format}:
 *   get:
 *     summary: Get all resources by format
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResourcesByFormat = asyncHandler(async (req, res) => {
  const { format } = req.params;
  const result = await getResourcesByFormat(format, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/resource-type/{resourceTypeId}:
 *   get:
 *     summary: Get all resources by resource type
 *     tags: [Resources]
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
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResourcesByResourceType = asyncHandler(async (req, res) => {
  const { resourceTypeId } = req.params;
  const result = await getResourcesByResourceType(resourceTypeId, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/creator/{creatorId}:
 *   get:
 *     summary: Get all resources by creator
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResourcesByCreator = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;
  const result = await getResourcesByCreator(creatorId, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/language/{language}:
 *   get:
 *     summary: Get all resources by language
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listResourcesByLanguage = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const result = await getResourcesByLanguage(language, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/{id}/metadata:
 *   patch:
 *     summary: Update resource metadata
 *     tags: [Resources]
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
 *             required: [metadata]
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Resource metadata updated
 */
export const updateResourceMetadataHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metadata } = req.body;
  const result = await updateResourceMetadata(id, metadata);
  return successResponse(res, "Resource metadata updated successfully", result);
});

/**
 * @swagger
 * /resources/{id}/status:
 *   patch:
 *     summary: Update resource status
 *     tags: [Resources]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource status updated
 */
export const updateResourceStatusHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await updateResourceStatus(id, status, req.user);
  return successResponse(res, "Resource status updated successfully", result);
});

/**
 * @swagger
 * /resources/{id}/publish:
 *   post:
 *     summary: Publish a resource
 *     tags: [Resources]
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
 *         description: Resource published
 */
export const publishResourceHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await publishResource(id, req.user);
  return successResponse(res, "Resource published successfully", result);
});

/**
 * @swagger
 * /resources/{id}/archive:
 *   post:
 *     summary: Archive a resource
 *     tags: [Resources]
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
 *         description: Resource archived
 */
export const archiveResourceHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await archiveResource(id, req.user);
  return successResponse(res, "Resource archived successfully", result);
});

/**
 * @swagger
 * /resources/search/{searchTerm}:
 *   get:
 *     summary: Search for resources
 *     tags: [Resources]
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
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const searchResourcesHandler = asyncHandler(async (req, res) => {
  const { searchTerm } = req.params;
  const result = await searchResources(searchTerm, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/advanced-search:
 *   post:
 *     summary: Advanced search for resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search_term:
 *                 type: string
 *               status:
 *                 type: string
 *               educational_type:
 *                 type: string
 *               format:
 *                 type: string
 *               language:
 *                 type: string
 *               resource_type_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const advancedSearchResourcesHandler = asyncHandler(async (req, res) => {
  const { search_term, status, educational_type, format, language, resource_type_id } = req.body;
  const result = await advancedSearchResources(
    search_term, 
    status, 
    educational_type, 
    format, 
    language, 
    resource_type_id,
    req.user || null
  );
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/search-metadata:
 *   post:
 *     summary: Search resources by metadata
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [metadata_key, metadata_value]
 *             properties:
 *               metadata_key:
 *                 type: string
 *               metadata_value:
 *                 type: string
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const searchResourcesByMetadataHandler = asyncHandler(async (req, res) => {
  const { metadata_key, metadata_value } = req.body;
  const result = await searchResourcesByMetadata(metadata_key, metadata_value, req.user || null);
  return successResponse(res, "Resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/published:
 *   get:
 *     summary: Get all published resources
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of published resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 */
export const listPublishedResources = asyncHandler(async (req, res) => {
  const result = await getPublishedResources();
  return successResponse(res, "Published resources retrieved successfully", result);
});

/**
 * @swagger
 * /resources/status/{status}/count:
 *   get:
 *     summary: Count resources by status
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countResourcesByStatusHandler = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const result = await countResourcesByStatus(status, req.user || null);
  return successResponse(res, "Resource count retrieved successfully", { count: result });
});

/**
 * @swagger
 * /resources/educational-type/{educationalType}/count:
 *   get:
 *     summary: Count resources by educational type
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: educationalType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countResourcesByEducationalTypeHandler = asyncHandler(async (req, res) => {
  const { educationalType } = req.params;
  const result = await countResourcesByEducationalType(educationalType, req.user || null);
  return successResponse(res, "Resource count retrieved successfully", { count: result });
});

/**
 * @swagger
 * /resources/format/{format}/count:
 *   get:
 *     summary: Count resources by format
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countResourcesByFormatHandler = asyncHandler(async (req, res) => {
  const { format } = req.params;
  const result = await countResourcesByFormat(format, req.user || null);
  return successResponse(res, "Resource count retrieved successfully", { count: result });
});

/**
 * @swagger
 * /resources/creator/{creatorId}/count:
 *   get:
 *     summary: Count resources by creator
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countResourcesByCreatorHandler = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;
  const result = await countResourcesByCreator(creatorId, req.user || null);
  return successResponse(res, "Resource count retrieved successfully", { count: result });
});

/**
 * @swagger
 * /resources/with-ratings:
 *   get:
 *     summary: Get all resources with ratings
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of resources with ratings
 */
export const listResourcesWithRatings = asyncHandler(async (req, res) => {
  const result = await getResourcesWithRatings(req.user || null);
  return successResponse(res, "Resources with ratings retrieved successfully", result);
});

/**
 * @swagger
 * /resources/{id}/statistics:
 *   get:
 *     summary: Get resource statistics
 *     tags: [Resources]
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
 *         description: Resource statistics
 */
export const getResourceStatisticsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getResourceStatistics(id);
  return successResponse(res, "Resource statistics retrieved successfully", result);
});

/**
 * @swagger
 * /resources/statuses:
 *   get:
 *     summary: Get all resource statuses
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of resource statuses
 */
export const listResourceStatuses = asyncHandler(async (req, res) => {
  const result = await getResourceStatuses();
  return successResponse(res, "Resource statuses retrieved successfully", result);
});

/**
 * @swagger
 * /resources/educational-types:
 *   get:
 *     summary: Get all educational types
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of educational types
 */
export const listResourceEducationalTypes = asyncHandler(async (req, res) => {
  const result = await getResourceEducationalTypes();
  return successResponse(res, "Educational types retrieved successfully", result);
});

/**
 * @swagger
 * /resources/formats:
 *   get:
 *     summary: Get all resource formats
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of resource formats
 */
export const listResourceFormats = asyncHandler(async (req, res) => {
  const result = await getResourceFormats();
  return successResponse(res, "Resource formats retrieved successfully", result);
});

/**
 * @swagger
 * /resources/{id}/download:
 *   post:
 *     summary: Record a resource download
 *     tags: [Resources]
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
 *         description: Download recorded
 */
export const downloadResourceHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  const result = await recordResourceDownload(userId, id);
  
  return successResponse(res, result.message || "Download recorded", result);
});

