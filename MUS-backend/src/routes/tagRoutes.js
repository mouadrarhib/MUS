import { Router } from "express";
import { body, param, query } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.js";
import {
  requireOwnerOrAdmin,
  requirePublishedOrOwnerOrAdmin,
  requireRole,
  requireStudentContributorOrStaff,
} from "../middleware/authorization.js";
import { getResourceById } from "../services/resourceService.js";
import {
  addResourceTagHandler,
  createTagHandler,
  deleteTagHandler,
  getResourceTagsHandler,
  getResourcesTagsMapHandler,
  getTagBySlugHandler,
  getTagHandler,
  listPopularTagsHandler,
  listTagsHandler,
  removeResourceTagHandler,
  replaceResourceTagsHandler,
  updateTagHandler,
} from "../controllers/tagController.js";

const router = Router();

const getResourceOwnerId = async (req) => {
  const resourceId = Number.parseInt(req.params.resourceId, 10);
  if (!Number.isInteger(resourceId) || resourceId < 1) {
    return null;
  }

  const resource = await getResourceById(resourceId);
  return resource?.created_by || null;
};

const getResourceForVisibility = async (req) => {
  const resourceId = Number.parseInt(req.params.resourceId, 10);
  if (!Number.isInteger(resourceId) || resourceId < 1) {
    return null;
  }
  return getResourceById(resourceId);
};

router.get(
  "/tags",
  [
    query("search").optional().isString(),
    query("category").optional().isString(),
    query("is_active").optional().isBoolean(),
    query("limit").optional().isInt({ min: 1, max: 200 }),
  ],
  validateRequest,
  listTagsHandler
);

router.get(
  "/tags/popular",
  [query("limit").optional().isInt({ min: 1, max: 200 })],
  validateRequest,
  listPopularTagsHandler
);

router.get(
  "/tags/resources-map",
  [
    query("resource_ids")
      .isString()
      .notEmpty()
      .withMessage("resource_ids query is required"),
    query("resource_ids")
      .matches(/^\d+(,\d+)*$/)
      .withMessage("resource_ids must be comma-separated integers"),
  ],
  validateRequest,
  getResourcesTagsMapHandler
);

router.get(
  "/tags/slug/:slug",
  [param("slug").isString().notEmpty().withMessage("Tag slug is required")],
  validateRequest,
  getTagBySlugHandler
);

router.get(
  "/tags/:id",
  [param("id").isInt({ min: 1 }).withMessage("Valid tag ID is required")],
  validateRequest,
  getTagHandler
);

router.post(
  "/tags",
  authMiddleware,
  requireRole("admin"),
  [
    body("name").isString().trim().isLength({ min: 2, max: 100 }),
    body("slug").optional().isString().trim().isLength({ min: 2, max: 120 }),
    body("category").optional().isString().trim().isLength({ min: 2, max: 60 }),
    body("description").optional().isString().trim().isLength({ max: 300 }),
  ],
  validateRequest,
  createTagHandler
);

router.patch(
  "/tags/:id",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt({ min: 1 }).withMessage("Valid tag ID is required"),
    body("name").optional().isString().trim().isLength({ min: 2, max: 100 }),
    body("slug").optional().isString().trim().isLength({ min: 2, max: 120 }),
    body("category").optional().isString().trim().isLength({ min: 2, max: 60 }),
    body("description").optional().isString().trim().isLength({ max: 300 }),
    body("is_active").optional().isBoolean(),
  ],
  validateRequest,
  updateTagHandler
);

router.delete(
  "/tags/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt({ min: 1 }).withMessage("Valid tag ID is required")],
  validateRequest,
  deleteTagHandler
);

router.get(
  "/resources/:resourceId/tags",
  optionalAuthMiddleware,
  requirePublishedOrOwnerOrAdmin(getResourceForVisibility),
  [param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required")],
  validateRequest,
  getResourceTagsHandler
);

router.put(
  "/resources/:resourceId/tags",
  authMiddleware,
  requireStudentContributorOrStaff,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    body("tag_ids").isArray().withMessage("tag_ids must be an array"),
    body("tag_ids.*").isInt({ min: 1 }).withMessage("Each tag ID must be a positive integer"),
  ],
  validateRequest,
  replaceResourceTagsHandler
);

router.post(
  "/resources/:resourceId/tags",
  authMiddleware,
  requireStudentContributorOrStaff,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    body("tag_id").isInt({ min: 1 }).withMessage("Valid tag ID is required"),
  ],
  validateRequest,
  addResourceTagHandler
);

router.delete(
  "/resources/:resourceId/tags/:tagId",
  authMiddleware,
  requireStudentContributorOrStaff,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    param("tagId").isInt({ min: 1 }).withMessage("Valid tag ID is required"),
  ],
  validateRequest,
  removeResourceTagHandler
);

export default router;
