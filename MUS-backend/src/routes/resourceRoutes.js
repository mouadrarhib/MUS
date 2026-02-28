import { Router } from "express";
import { body, param, query } from "express-validator";
import multer from "multer";
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
  rejectResourceHandler,
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
  downloadResourceHandler,
  requestResourceUploadUrlHandler,
  confirmResourceUploadHandler,
  getResourceFileUrlHandler,
  requestResourceUploadUrlByIdHandler,
  attachFileToResourceHandler,
  attachUrlToResourceHandler,
  uploadFileToResourceHandler,
  listMyResourceRejectionsHandler,
  listAllResourceRejectionsHandler,
} from "../controllers/resourceController.js";
import {
  createConfusionSignalHandler,
  getResourceConfusionCountHandler,
  getResourceConfusionRecentHandler,
} from "../controllers/resourceConfusionController.js";

import validateRequest from "./validateRequest.js";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.js";
import {
  requireAuth,
  requireOwnerOrAdmin,
  requirePublishedOrOwnerOrAdmin,
  requireRole,
} from "../middleware/authorization.js";
import { getResourceById } from "../services/resourceService.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 250 * 1024 * 1024 },
});
router.use(optionalAuthMiddleware);

const getResourceOwnerId = async (req) => {
  const resourceId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(resourceId) || resourceId < 1) {
    return null;
  }

  const resource = await getResourceById(resourceId);
  return resource?.created_by || null;
};

const getResourceForVisibility = async (req) => {
  const resourceId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(resourceId) || resourceId < 1) {
    return null;
  }
  return getResourceById(resourceId);
};

router.post(
  "/",
  authMiddleware,
  [
    body("title").isString().withMessage("Le titre est requis"),
    body("description").optional().isString(),
    body("status").optional().isString(),
    body("url").optional().isString(),
    body("language").optional().isString(),
    body("license").optional().isString(),
    body("educational_type").optional().isString(),
    body("format").optional().isString(),
    body("resource_type_id").isInt().withMessage("L'ID du type de ressource est requis"),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  addResource
);

router.post(
  "/upload-url",
  authMiddleware,
  [
    body("filename").optional().isString().notEmpty(),
    query("filename").optional().isString().notEmpty(),
    body("mime_type").optional().isString(),
    query("mime_type").optional().isString(),
    body("size_bytes").optional().isInt({ min: 1 }).withMessage("Valid size is required"),
    query("size_bytes").optional().isInt({ min: 1 }).withMessage("Valid size is required"),
    body().custom((_, { req }) => {
      if (req.body?.filename || req.query?.filename) {
        return true;
      }
      throw new Error("Filename is required (body.filename or query filename)");
    }),
  ],
  validateRequest,
  requestResourceUploadUrlHandler
);

router.post(
  "/confirm-upload",
  authMiddleware,
  [
    body("object_key").isString().notEmpty().withMessage("Object key is required"),
    body("title").isString().notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("status").optional().isString(),
    body("language").optional().isString(),
    body("license").optional().isString(),
    body("educational_type").optional().isString(),
    body("format").optional().isString(),
    body("resource_type_id").isInt().withMessage("Resource type ID is required"),
    body("metadata").optional().isObject(),
  ],
  validateRequest,
  confirmResourceUploadHandler
);

router.post(
  "/:id/upload-url",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("filename").optional().isString().notEmpty(),
    query("filename").optional().isString().notEmpty(),
    body("mime_type").optional().isString(),
    query("mime_type").optional().isString(),
    body("size_bytes").optional().isInt({ min: 1 }).withMessage("Valid size is required"),
    query("size_bytes").optional().isInt({ min: 1 }).withMessage("Valid size is required"),
    body().custom((_, { req }) => {
      if (req.body?.filename || req.query?.filename) {
        return true;
      }
      throw new Error("Filename is required (body.filename or query filename)");
    }),
  ],
  validateRequest,
  requestResourceUploadUrlByIdHandler
);

router.post(
  "/:id/attach-file",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("object_key").isString().notEmpty().withMessage("Object key is required"),
  ],
  validateRequest,
  attachFileToResourceHandler
);

router.patch(
  "/:id/attach-url",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("url").isString().isURL().withMessage("Valid URL is required"),
  ],
  validateRequest,
  attachUrlToResourceHandler
);

router.post(
  "/:id/upload-file",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  upload.single("file"),
  uploadFileToResourceHandler
);

router.get("/", listResources);
router.get("/my-resources", authMiddleware, listMyResources);
router.get(
  "/my-rejections",
  authMiddleware,
  [query("limit").optional().isInt({ min: 1, max: 500 })],
  validateRequest,
  listMyResourceRejectionsHandler
);

router.get(
  "/rejections",
  authMiddleware,
  requireRole("admin"),
  [
    query("search").optional().isString(),
    query("limit").optional().isInt({ min: 1, max: 1000 }),
  ],
  validateRequest,
  listAllResourceRejectionsHandler
);

router.get("/published", listPublishedResources);
router.get("/with-ratings", listResourcesWithRatings);
router.get("/statuses", listResourceStatuses);
router.get("/educational-types", listResourceEducationalTypes);
router.get("/formats", listResourceFormats);

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

router.post(
  "/search-metadata",
  [
    body("metadata_key").isString().withMessage("La cle de metadonnee est requise"),
    body("metadata_value").isString().withMessage("La valeur de metadonnee est requise"),
  ],
  validateRequest,
  searchResourcesByMetadataHandler
);

router.get(
  "/search/:searchTerm",
  [param("searchTerm").isString().withMessage("Le terme de recherche est requis")],
  validateRequest,
  searchResourcesHandler
);

router.get(
  "/status/:status",
  [param("status").isString().withMessage("Le statut est requis")],
  validateRequest,
  listResourcesByStatus
);

router.get(
  "/status/:status/count",
  [param("status").isString().withMessage("Le statut est requis")],
  validateRequest,
  countResourcesByStatusHandler
);

router.get(
  "/educational-type/:educationalType",
  [param("educationalType").isString().withMessage("Le type educatif est requis")],
  validateRequest,
  listResourcesByEducationalType
);

router.get(
  "/educational-type/:educationalType/count",
  [param("educationalType").isString().withMessage("Le type educatif est requis")],
  validateRequest,
  countResourcesByEducationalTypeHandler
);

router.get(
  "/format/:format",
  [param("format").isString().withMessage("Le format est requis")],
  validateRequest,
  listResourcesByFormat
);

router.get(
  "/format/:format/count",
  [param("format").isString().withMessage("Le format est requis")],
  validateRequest,
  countResourcesByFormatHandler
);

router.get(
  "/resource-type/:resourceTypeId",
  [param("resourceTypeId").isInt().withMessage("L'ID du type de ressource est requis")],
  validateRequest,
  listResourcesByResourceType
);

router.get(
  "/creator/:creatorId",
  [param("creatorId").isUUID().withMessage("UUID createur invalide")],
  validateRequest,
  listResourcesByCreator
);

router.get(
  "/creator/:creatorId/count",
  [param("creatorId").isUUID().withMessage("UUID createur invalide")],
  validateRequest,
  countResourcesByCreatorHandler
);

router.get(
  "/language/:language",
  [param("language").isString().withMessage("La langue est requise")],
  validateRequest,
  listResourcesByLanguage
);

router.post(
  "/:id/download",
  authMiddleware,
  [param("id").isInt().withMessage("ID de ressource invalide")],
  validateRequest,
  downloadResourceHandler
);

router.post(
  "/:id/confusion-signals",
  authMiddleware,
  requireRole("student"),
  [
    param("id").isInt().withMessage("ID de ressource invalide"),
    body("note").optional().isString().isLength({ min: 3, max: 1000 }).withMessage("La note doit contenir entre 3 et 1000 caracteres"),
  ],
  validateRequest,
  createConfusionSignalHandler
);

router.get(
  "/:id/file-url",
  [param("id").isInt().withMessage("Valid resource ID is required")],
  validateRequest,
  requirePublishedOrOwnerOrAdmin(getResourceForVisibility),
  getResourceFileUrlHandler
);

router.get(
  "/:id",

  requirePublishedOrOwnerOrAdmin(getResourceForVisibility),
  [param("id").isInt().withMessage("ID de ressource invalide")],
  validateRequest,
  getResource
);

router.patch(
  "/:id",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("id").isInt().withMessage("ID de ressource invalide"),
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

router.delete(
  "/:id",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [param("id").isInt().withMessage("ID de ressource invalide")],
  validateRequest,
  deleteExistingResource
);

router.patch(
  "/:id/metadata",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("id").isInt().withMessage("ID de ressource invalide"),
    body("metadata").isObject().withMessage("Les metadonnees sont requises"),
  ],
  validateRequest,
  updateResourceMetadataHandler
);

router.patch(
  "/:id/status",
  authMiddleware,
  requireAuth,
  [
    param("id").isInt().withMessage("ID de ressource invalide"),
    body("status").isString().withMessage("Le statut est requis"),
  ],
  validateRequest,
  updateResourceStatusHandler
);

router.post(
  "/:id/publish",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt().withMessage("ID de ressource invalide")],
  validateRequest,
  publishResourceHandler
);

router.post(
  "/:id/archive",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt().withMessage("ID de ressource invalide")],
  validateRequest,
  archiveResourceHandler
);

router.post(
  "/:id/reject",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt().withMessage("Valid resource ID is required"),
    body("reason")
      .isString()
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage("Rejection reason is required and must be at least 5 characters"),
  ],
  validateRequest,
  rejectResourceHandler
);

router.get(
  "/:id/statistics",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [param("id").isInt().withMessage("ID de ressource invalide")],
  validateRequest,
  getResourceStatisticsHandler
);

export default router;
