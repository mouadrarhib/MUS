import { Router } from "express";
import { body, param } from "express-validator";
import {
  addResource,
  listResources,
  listMyResources,
  getResource,
  updateExistingResource,
  deleteExistingResource,
  listResourcesByStatus,
  listResourcesByEducationalType,
  listResourcesByFormat,
  listResourcesByResourceType,
  listResourcesByCreator,
  listResourcesByLanguage,
  updateResourceMetadataHandler,
  updateResourceStatusHandler,
  publishResourceHandler,
  archiveResourceHandler,
  searchResourcesHandler,
  advancedSearchResourcesHandler,
  searchResourcesByMetadataHandler,
  listPublishedResources,
  countResourcesByStatusHandler,
  countResourcesByEducationalTypeHandler,
  countResourcesByFormatHandler,
  countResourcesByCreatorHandler,
  listResourcesWithRatings,
  getResourceStatisticsHandler,
  listResourceStatuses,
  listResourceEducationalTypes,
  listResourceFormats,
} from "../controllers/resourceController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

// Create resource
router.post(
  "/",
  authMiddleware,
  [
    body("title").isString().withMessage("Title is required"),
    body("description").optional().isString(),
    body("status").isString().withMessage("Status is required"),
    body("url").optional().isString(),
    body("language").optional().isString(),
    body("license").optional().isString(),
    body("educational_type").optional().isString(),
    body("format").optional().isString(),
    body("resource_type_id").isInt().withMessage("Resource type ID is required"),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  addResource
);

// Get all resources
router.get("/", listResources);

// Get authenticated user's resources
router.get("/my-resources", listMyResources);

// Get published resources
router.get("/published", listPublishedResources);

// Get resources with ratings
router.get("/with-ratings", listResourcesWithRatings);

// Get enum values
router.get("/statuses", listResourceStatuses);
router.get("/educational-types", listResourceEducationalTypes);
router.get("/formats", listResourceFormats);

// Advanced search
router.post(
  "/advanced-search",
  [
    body("search_term").optional().isString(),
    body("status").optional().isString(),
    body("educational_type").optional().isString(),
    body("format").optional().isString(),
    body("language").optional().isString(),
    body("resource_type_id").optional().isInt(),
  ],
  validateRequest,
  advancedSearchResourcesHandler
);

// Search by metadata
router.post(
  "/search-metadata",
  [
    body("metadata_key").isString().withMessage("Metadata key is required"),
    body("metadata_value").isString().withMessage("Metadata value is required"),
  ],
  validateRequest,
  searchResourcesByMetadataHandler
);

// Search resources
router.get(
  "/search/:searchTerm",
  [param("searchTerm").isString().withMessage("Search term is required")],
  validateRequest,
  searchResourcesHandler
);

// Get resources by status
router.get(
  "/status/:status",
  [param("status").isString().withMessage("Status is required")],
  validateRequest,
  listResourcesByStatus
);

// Count resources by status
router.get(
  "/status/:status/count",
  [param("status").isString().withMessage("Status is required")],
  validateRequest,
  countResourcesByStatusHandler
);

// Get resources by educational type
router.get(
  "/educational-type/:educationalType",
  [param("educationalType").isString().withMessage("Educational type is required")],
  validateRequest,
  listResourcesByEducationalType
);

// Count resources by educational type
router.get(
  "/educational-type/:educationalType/count",
  [param("educationalType").isString().withMessage("Educational type is required")],
  validateRequest,
  countResourcesByEducationalTypeHandler
);

// Get resources by format
router.get(
  "/format/:format",
  [param("format").isString().withMessage("Format is required")],
  validateRequest,
  listResourcesByFormat
);

// Count resources by format
router.get(
  "/format/:format/count",
  [param("format").isString().withMessage("Format is required")],
  validateRequest,
  countResourcesByFormatHandler
);

// Get resources by resource type
router.get(
  "/resource-type/:resourceTypeId",
  [param("resourceTypeId").isInt().withMessage("Resource type ID is required")],
  validateRequest,
  listResourcesByResourceType
);

// Get resources by creator
router.get(
  "/creator/:creatorId",
  [param("creatorId").isUUID().withMessage("Valid creator UUID is required")],
  validateRequest,
  listResourcesByCreator
);

// Count resources by creator
router.get(
  "/creator/:creatorId/count",
  [param("creatorId").isUUID().withMessage("Valid creator UUID is required")],
  validateRequest,
  countResourcesByCreatorHandler
);

// Get resources by language
router.get(
  "/language/:language",
  [param("language").isString().withMessage("Language is required")],
  validateRequest,
  listResourcesByLanguage
);

// Get resource by ID
router.get(
  "/:id",
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  getResource
);

// Update resource
router.patch(
  "/:id",
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("status").optional().isString(),
    body("url").optional().isString(),
    body("language").optional().isString(),
    body("license").optional().isString(),
    body("educational_type").optional().isString(),
    body("format").optional().isString(),
    body("resource_type_id").optional().isInt(),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  updateExistingResource
);

// Delete resource
router.delete(
  "/:id",
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  deleteExistingResource
);

// Update resource metadata
router.patch(
  "/:id/metadata",
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("metadata").isObject().withMessage("Metadata is required"),
  ],
  validateRequest,
  updateResourceMetadataHandler
);

// Update resource status
router.patch(
  "/:id/status",
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("status").isString().withMessage("Status is required"),
  ],
  validateRequest,
  updateResourceStatusHandler
);

// Publish resource
router.post(
  "/:id/publish",
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  publishResourceHandler
);

// Archive resource
router.post(
  "/:id/archive",
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  archiveResourceHandler
);

// Get resource statistics
router.get(
  "/:id/statistics",
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  getResourceStatisticsHandler
);

export default router;
