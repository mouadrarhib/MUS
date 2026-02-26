import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  attachTagToResource,
  createTag,
  deleteTag,
  detachTagFromResource,
  getPopularTags,
  getTagById,
  getTagBySlug,
  getTagsByResource,
  getTagsByResources,
  listTags,
  replaceResourceTags,
  tagExistsBySlug,
  updateTag,
} from "../services/tagService.js";

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tags and resource-tag mapping management
 */

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 */
export const createTagHandler = asyncHandler(async (req, res) => {
  const { name, slug, category, description } = req.body;
  const normalizedSlug = String(slug || name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const exists = await tagExistsBySlug(normalizedSlug);
  if (exists) {
    return res.status(409).json({
      success: false,
      message: `Tag slug "${normalizedSlug}" already exists`,
    });
  }

  const result = await createTag({
    name,
    slug: normalizedSlug,
    category,
    description,
    createdBy: req.user?.id || null,
  });

  return successResponse(res, "Tag created successfully", result, 201);
});

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: List tags
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tags list
 */
export const listTagsHandler = asyncHandler(async (req, res) => {
  const { search, category, is_active, limit } = req.query;
  const parsedIsActive =
    typeof is_active === "string" ? ["true", "1"].includes(is_active.toLowerCase()) : null;

  const result = await listTags({
    searchTerm: search || null,
    category: category || null,
    isActive: typeof is_active === "undefined" ? null : parsedIsActive,
    limit: limit ? Number.parseInt(limit, 10) : 100,
  });
  return successResponse(res, "Tags retrieved successfully", result);
});

export const getTagHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getTagById(id);
  if (!result) {
    return res.status(404).json({ success: false, message: "Tag not found" });
  }
  return successResponse(res, "Tag retrieved successfully", result);
});

export const getTagBySlugHandler = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const result = await getTagBySlug(slug);
  if (!result) {
    return res.status(404).json({ success: false, message: "Tag not found" });
  }
  return successResponse(res, "Tag retrieved successfully", result);
});

export const updateTagHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, category, description, is_active } = req.body;
  const normalizedSlug = slug
    ? String(slug)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
    : null;

  if (normalizedSlug) {
    const exists = await tagExistsBySlug(normalizedSlug, id);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: `Tag slug "${normalizedSlug}" already exists`,
      });
    }
  }

  const result = await updateTag({
    id,
    name,
    slug: normalizedSlug,
    category,
    description,
    isActive: typeof is_active === "boolean" ? is_active : null,
  });

  return successResponse(res, "Tag updated successfully", result);
});

export const deleteTagHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteTag(id);
  return successResponse(res, "Tag deleted successfully");
});

export const listPopularTagsHandler = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const result = await getPopularTags(limit ? Number.parseInt(limit, 10) : 20);
  return successResponse(res, "Popular tags retrieved successfully", result);
});

export const getResourceTagsHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const result = await getTagsByResource(resourceId);
  return successResponse(res, "Resource tags retrieved successfully", result);
});

/**
 * @swagger
 * /tags/resources-map:
 *   get:
 *     summary: Get tags map for multiple resources
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: resource_ids
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated resource IDs (e.g. 1,2,3)
 *     responses:
 *       200:
 *         description: Resource tags map
 */
export const getResourcesTagsMapHandler = asyncHandler(async (req, res) => {
  const raw = String(req.query?.resource_ids || "").trim();
  const ids = raw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter(Number.isFinite);

  const rows = await getTagsByResources(ids);
  const map = {};

  for (const id of ids) {
    map[id] = [];
  }

  for (const row of rows) {
    const key = Number(row.resource_id);
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }

  return successResponse(res, "Resource tags map retrieved successfully", map);
});

export const replaceResourceTagsHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { tag_ids } = req.body;
  const result = await replaceResourceTags({
    resourceId,
    tagIds: tag_ids || [],
  });
  return successResponse(res, "Resource tags updated successfully", result);
});

export const addResourceTagHandler = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { tag_id } = req.body;
  const result = await attachTagToResource({ resourceId, tagId: tag_id });
  return successResponse(res, "Tag attached to resource successfully", result, 201);
});

export const removeResourceTagHandler = asyncHandler(async (req, res) => {
  const { resourceId, tagId } = req.params;
  await detachTagFromResource({ resourceId, tagId });
  return successResponse(res, "Tag detached from resource successfully");
});
