import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import { getCurrentUserId } from "../middleware/auth.js";
import { addResourceToModule } from "./resourceModuleMapService.js";
import AppError from "../helpers/appError.js";
import {
  buildObjectKey,
  getDownloadUrl,
  getPublicObjectUrl,
  getR2BucketName,
  getUploadUrl,
  headObject,
  isR2Configured,
  putObjectBuffer,
  deleteObject,
} from "./storage/r2Service.js";
import { createResourceRejection } from "./resourceRejectionService.js";
import { userHasPremiumAccess } from "./membershipService.js";

const allowedTransitions = {
  draft: ["pending"],
  pending: ["published", "rejected", "draft"],
  rejected: ["pending"],
  published: ["archived", "rejected"],
  archived: ["published"],
};

const isAdmin = (roles = []) => roles.includes("admin");
const isTeacher = (roles = []) => roles.includes("teacher");
const normalizeStatus = (status) => String(status || "").toLowerCase();
const isPublished = (resource) => normalizeStatus(resource?.status) === "published";
const filterPublishedOnly = (resources = []) => resources.filter((resource) => isPublished(resource));
const parseCountRow = (row = null) => Number(row ? Object.values(row)[0] : 0) || 0;
const normalizeAccessTier = (value) => (String(value || "free").toLowerCase() === "premium" ? "premium" : "free");

const getPublishedResourcesWithModuleContext = async (educationalType = null) => {
  const [results] = await sequelize.query(
    `
    SELECT
      r.id,
      r.title,
      r.description,
      r.status::text AS status,
      r.url,
      r.language,
      r.license,
      r.created_by,
      u.full_name AS creator_name,
      r.created_at,
      r.updated_at,
      r.educational_type::text AS educational_type,
      r.format::text AS format,
      r.resource_type_id,
      module_ctx.module_id,
      module_ctx.module_code,
      module_ctx.module_title
    FROM public.resources r
    LEFT JOIN public.users u ON u.id = r.created_by
    LEFT JOIN LATERAL (
      SELECT
        m.id AS module_id,
        m.code AS module_code,
        m.title AS module_title
      FROM public.resource_module_map rmm
      INNER JOIN public.modules m ON m.id = rmm.module_id
      WHERE rmm.resource_id = r.id
      ORDER BY rmm.created_at DESC NULLS LAST, m.id ASC
      LIMIT 1
    ) module_ctx ON TRUE
    WHERE r.status = 'published'::resource_status
      AND (:educational_type::text IS NULL OR r.educational_type::text = :educational_type::text)
    ORDER BY r.created_at DESC
    `,
    {
      replacements: {
        educational_type: educationalType,
      },
    }
  );

  return results;
};

const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

const extractObjectKeyFromResource = (resource) => {
  if (!resource) return null;

  if (resource.object_key) {
    return String(resource.object_key).trim();
  }

  const metadata = parseMetadata(resource.metadata);
  const metadataKey = metadata?.storage?.object_key || metadata?.object_key;
  if (metadataKey) {
    return String(metadataKey).trim();
  }

  if (typeof resource.url === "string" && resource.url.startsWith("r2://")) {
    const bucket = getR2BucketName();
    const prefix = bucket ? `r2://${bucket}/` : "r2://";
    if (resource.url.startsWith(prefix)) {
      return resource.url.slice(prefix.length);
    }

    const genericMatch = resource.url.match(/^r2:\/\/[^/]+\/(.+)$/i);
    if (genericMatch?.[1]) {
      return genericMatch[1];
    }
  }

  return null;
};

const mergeStorageMetadata = ({ existingMetadata, objectKey, mimeType, sizeBytes, originalFilename, publicUrl }) => ({
  ...parseMetadata(existingMetadata),
  storage: {
    provider: "cloudflare-r2",
    bucket: getR2BucketName(),
    object_key: objectKey,
    mime_type: mimeType || null,
    size_bytes: Number.isFinite(sizeBytes) ? Number(sizeBytes) : null,
    original_filename: originalFilename || null,
    public_url: publicUrl || null,
    uploaded_at: new Date().toISOString(),
  },
});

const getResourceAccessTier = async (resourceId) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT COALESCE(access_tier, 'free')::text AS access_tier FROM public.resources WHERE id = :id LIMIT 1`,
      {
        replacements: { id: Number(resourceId) },
      }
    );
    return normalizeAccessTier(rows?.[0]?.access_tier);
  } catch {
    return "free";
  }
};

const setResourceAccessTier = async (resourceId, accessTier) => {
  try {
    await sequelize.query(
      `UPDATE public.resources SET access_tier = :access_tier WHERE id = :id`,
      {
        replacements: {
          id: Number(resourceId),
          access_tier: normalizeAccessTier(accessTier),
        },
      }
    );
  } catch {
    // Column may not exist before migration is applied.
  }
};

const assertCanDownloadResource = async (resource, actor = null) => {
  const accessTier = await getResourceAccessTier(resource.id);
  if (accessTier !== "premium") {
    return;
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (admin || owner) {
    return;
  }

  const canDownloadPremium = actor?.id ? await userHasPremiumAccess(actor.id) : false;
  if (!canDownloadPremium) {
    throw new AppError("Premium membership required to download this resource", 403);
  }
};

const persistStorageColumns = async ({
  resourceId,
  objectKey,
  mimeType,
  sizeBytes,
  originalFilename,
  publicUrl,
}) => {
  try {
    await sequelize.query(
      `
      UPDATE public.resources
      SET
        storage_provider = :storage_provider,
        bucket = :bucket,
        object_key = :object_key,
        mime_type = :mime_type,
        size_bytes = :size_bytes,
        original_filename = :original_filename,
        is_public = :is_public,
        upload_status = 'uploaded'
      WHERE id = :id
      `,
      {
        replacements: {
          id: resourceId,
          storage_provider: "cloudflare-r2",
          bucket: getR2BucketName(),
          object_key: objectKey,
          mime_type: mimeType || null,
          size_bytes: Number.isFinite(sizeBytes) ? Number(sizeBytes) : null,
          original_filename: originalFilename || null,
          is_public: Boolean(publicUrl),
        },
      }
    );
  } catch {
    // Columns are optional until migration is applied.
  }
};

const resolveCreationStatus = (requestedStatus, roles = []) => {
  void requestedStatus;
  void roles;
  return "pending";
};

export const createResource = async (
  title,
  description,
  status,
  url,
  language,
  license,
  createdBy,
  educationalType,
  format,
  resourceTypeId,
  metadata,
  accessTier,
  actor = null
) => {
  const userId = createdBy || getCurrentUserId() || null;
  const statusToCreate = resolveCreationStatus(status, actor?.roles || []);
  const admin = isAdmin(actor?.roles || []);
  const requestedAccessTier = normalizeAccessTier(accessTier);

  if (!admin && requestedAccessTier === "premium") {
    throw new AppError("Only admin can create premium resources", 403);
  }

  const [results] = await sequelize.query(SQL.RESOURCE.CREATE, {
    replacements: {
      title,
      description: description ?? null,
      status: statusToCreate,
      url: url ?? null,
      language: language ?? null,
      license: license ?? null,
      created_by: userId,
      educational_type: educationalType ?? null,
      format: format ?? null,
      resource_type_id: resourceTypeId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  const created = Array.isArray(results) ? results[0] : results;
  if (created?.id) {
    await setResourceAccessTier(created.id, admin ? requestedAccessTier : "free");
    return {
      ...created,
      access_tier: admin ? requestedAccessTier : "free",
    };
  }

  return results;
};

export const getAllResources = async (actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_ALL);
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const getResourceById = async (id) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_ID, {
    replacements: { id },
  });

  if (!results.length) return null;

  const item = results[0];
  const accessTier = item.access_tier || (await getResourceAccessTier(id));
  return {
    ...item,
    access_tier: normalizeAccessTier(accessTier),
  };
};

export const getResourcesByStatus = async (status, actor = null) => {
  const requestedStatus = normalizeStatus(status);
  const admin = isAdmin(actor?.roles || []);
  if (!admin && requestedStatus !== "published") {
    return [];
  }

  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_STATUS, {
    replacements: { status: requestedStatus },
  });
  return results;
};

export const getResourcesByEducationalType = async (educationalType, actor = null) => {
  if (!isAdmin(actor?.roles || [])) {
    return getPublishedResourcesWithModuleContext(educationalType);
  }

  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_EDUCATIONAL_TYPE, {
    replacements: { educational_type: educationalType },
  });
  return results;
};

export const getResourcesByFormat = async (format, actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_FORMAT, {
    replacements: { format },
  });
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const getResourcesByResourceType = async (resourceTypeId, actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_RESOURCE_TYPE, {
    replacements: { resource_type_id: resourceTypeId },
  });
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const getResourcesByCreator = async (createdBy, actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_CREATOR, {
    replacements: { created_by: createdBy },
  });
  const admin = isAdmin(actor?.roles || []);
  const self = actor?.id && actor.id === createdBy;
  return admin || self ? results : filterPublishedOnly(results);
};

export const getResourcesByConnectedUser = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }
  return getResourcesByCreator(userId, { id: userId, roles: [] });
};

export const getMyResourceAnalytics = async (userId) => {
  const [rows] = await sequelize.query(
    `
    WITH my_resources AS (
      SELECT id, status, created_at
      FROM public.resources
      WHERE created_by = :user_id
    ),
    resource_counts AS (
      SELECT
        COUNT(*)::BIGINT AS total_resources,
        COUNT(*) FILTER (WHERE status = 'published')::BIGINT AS published_resources,
        COUNT(*) FILTER (WHERE status = 'draft')::BIGINT AS draft_resources,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_resources,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT AS rejected_resources,
        COUNT(*) FILTER (WHERE status = 'archived')::BIGINT AS archived_resources,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::BIGINT AS resources_last_7_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::BIGINT AS resources_last_30_days
      FROM my_resources
    ),
    favorites_received AS (
      SELECT
        COUNT(*)::BIGINT AS total_favorites_received,
        COUNT(*) FILTER (WHERE f.created_at >= NOW() - INTERVAL '7 days')::BIGINT AS favorites_last_7_days,
        COUNT(*) FILTER (WHERE f.created_at >= NOW() - INTERVAL '30 days')::BIGINT AS favorites_last_30_days
      FROM public.favorites f
      INNER JOIN my_resources mr ON mr.id = f.resource_id
    ),
    downloads_received AS (
      SELECT
        COUNT(*)::BIGINT AS total_downloads_received,
        COUNT(*) FILTER (WHERE rd.downloaded_at >= NOW() - INTERVAL '7 days')::BIGINT AS downloads_last_7_days,
        COUNT(*) FILTER (WHERE rd.downloaded_at >= NOW() - INTERVAL '30 days')::BIGINT AS downloads_last_30_days
      FROM public.resource_downloads rd
      INNER JOIN my_resources mr ON mr.id = rd.resource_id
    ),
    ratings_received AS (
      SELECT
        COUNT(*)::BIGINT AS total_ratings_received,
        COALESCE(AVG(rt.score), 0)::NUMERIC(4,2) AS avg_rating_received
      FROM public.ratings rt
      INNER JOIN my_resources mr ON mr.id = rt.resource_id
    )
    SELECT
      rc.total_resources,
      rc.published_resources,
      rc.draft_resources,
      rc.pending_resources,
      rc.rejected_resources,
      rc.archived_resources,
      rc.resources_last_7_days,
      rc.resources_last_30_days,
      fr.total_favorites_received,
      fr.favorites_last_7_days,
      fr.favorites_last_30_days,
      dr.total_downloads_received,
      dr.downloads_last_7_days,
      dr.downloads_last_30_days,
      rr.total_ratings_received,
      rr.avg_rating_received
    FROM resource_counts rc
    CROSS JOIN favorites_received fr
    CROSS JOIN downloads_received dr
    CROSS JOIN ratings_received rr
    `,
    {
      replacements: { user_id: userId },
    }
  );

  return rows?.[0] || {
    total_resources: 0,
    published_resources: 0,
    draft_resources: 0,
    pending_resources: 0,
    rejected_resources: 0,
    archived_resources: 0,
    resources_last_7_days: 0,
    resources_last_30_days: 0,
    total_favorites_received: 0,
    favorites_last_7_days: 0,
    favorites_last_30_days: 0,
    total_downloads_received: 0,
    downloads_last_7_days: 0,
    downloads_last_30_days: 0,
    total_ratings_received: 0,
    avg_rating_received: 0,
  };
};

export const getResourcesByLanguage = async (language, actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_LANGUAGE, {
    replacements: { language },
  });
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const updateResource = async (
  id,
  title,
  description,
  status,
  url,
  language,
  license,
  educationalType,
  format,
  resourceTypeId,
  metadata,
  accessTier,
  actor = null
) => {
  const resource = await getResourceById(id);
  if (!resource) {
    throw new AppError("Ressource introuvable", 404);
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (!admin && !owner) {
    throw new AppError("Acces refuse", 403);
  }

  if (!admin && !["draft", "rejected"].includes(normalizeStatus(resource.status))) {
    throw new AppError("Vous ne pouvez modifier que les ressources en brouillon ou rejetees", 403);
  }

  if (!admin && typeof accessTier !== "undefined") {
    const requestedTier = normalizeAccessTier(accessTier);
    const currentTier = await getResourceAccessTier(id);
    if (requestedTier !== currentTier) {
      throw new AppError("Only admin can change resource access tier", 403);
    }
  }

  const [results] = await sequelize.query(SQL.RESOURCE.UPDATE, {
    replacements: {
      id,
      title: title ?? null,
      description: description ?? null,
      status: admin ? status : null,
      url: url ?? null,
      language: language ?? null,
      license: license ?? null,
      educational_type: educationalType ?? null,
      format: format ?? null,
      resource_type_id: resourceTypeId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  if (admin && typeof accessTier !== "undefined") {
    await setResourceAccessTier(id, accessTier);
  }

  const updated = Array.isArray(results) ? results[0] : results;
  if (updated) {
    return {
      ...updated,
      access_tier: await getResourceAccessTier(id),
    };
  }

  return results;
};

export const updateResourceMetadata = async (id, metadata) => {
  const [results] = await sequelize.query(SQL.RESOURCE.UPDATE_METADATA, {
    replacements: {
      id,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
  return results;
};

export const updateResourceStatus = async (id, status, actor = null) => {
  const resource = await getResourceById(id);
  if (!resource) {
    throw new AppError("Ressource introuvable", 404);
  }

  const currentStatus = normalizeStatus(resource.status);
  const requestedStatus = normalizeStatus(status);
  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(requestedStatus)) {
    throw new AppError(`Transition de statut invalide : ${currentStatus} -> ${requestedStatus}`, 403);
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (!admin) {
    if (!owner) {
      throw new AppError("Acces refuse", 403);
    }

    const ownerAllowed = new Set(["draft", "pending", "rejected"]);
    if (!ownerAllowed.has(requestedStatus)) {
      throw new AppError("Seul un administrateur peut definir ce statut", 403);
    }
  }

  const [results] = await sequelize.query(SQL.RESOURCE.UPDATE_STATUS, {
    replacements: { id, status: requestedStatus },
  });
  return results;
};

export const publishResource = async (id, actor = null) => updateResourceStatus(id, "published", actor);
export const archiveResource = async (id, actor = null) => updateResourceStatus(id, "archived", actor);

export const deleteResource = async (id, actor = null) => {
  const resource = await getResourceById(id);
  if (!resource) {
    throw new AppError("Ressource introuvable", 404);
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (!admin && !owner) {
    throw new AppError("Acces refuse", 403);
  }

  if (!admin && normalizeStatus(resource.status) !== "draft") {
    throw new AppError("Vous ne pouvez supprimer que les ressources en brouillon", 403);
  }

  const objectKey = extractObjectKeyFromResource(resource);
  if (objectKey && isR2Configured()) {
    try {
      await deleteObject(objectKey);
      console.log(`[ResourceUpload] Deleted cloud file for resource ${id}, key=${objectKey}`);
    } catch (error) {
      console.error(`[ResourceUpload] Failed deleting cloud file for resource ${id}, key=${objectKey}`);
      throw new AppError("Failed to delete file from cloud storage", 502);
    }
  }

  await sequelize.query(SQL.RESOURCE.DELETE, {
    replacements: { id },
  });
};

export const rejectResourceAndDelete = async (id, reason, actor = null) => {
  const normalizedReason = String(reason || "").trim();
  if (normalizedReason.length < 5) {
    throw new AppError("Rejection reason must be at least 5 characters", 422);
  }

  const resource = await getResourceById(id);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  await deleteResource(id, actor);

  const rejection = await createResourceRejection({
    resourceIdOriginal: resource.id,
    uploaderId: resource.created_by,
    rejectedBy: actor?.id || null,
    reason: normalizedReason,
    resourceTitle: resource.title,
    resourceUrl: resource.url || null,
    resourceFormat: resource.format || null,
    resourceEducationalType: resource.educational_type || null,
    resourceSnapshot: resource,
  });

  return rejection;
};

export const searchResources = async (searchTerm, actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.SEARCH, {
    replacements: { search_term: searchTerm },
  });
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const advancedSearchResources = async (
  searchTerm,
  status,
  educationalType,
  format,
  language,
  resourceTypeId,
  actor = null
) => {
  const admin = isAdmin(actor?.roles || []);
  if (!admin && status && normalizeStatus(status) !== "published") {
    return [];
  }

  const [results] = await sequelize.query(SQL.RESOURCE.ADVANCED_SEARCH, {
    replacements: {
      search_term: searchTerm,
      status: admin ? status : "published",
      educational_type: educationalType,
      format,
      language,
      resource_type_id: resourceTypeId,
    },
  });
  return admin ? results : filterPublishedOnly(results);
};

export const searchResourcesByMetadata = async (metadataKey, metadataValue, actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.SEARCH_BY_METADATA, {
    replacements: { metadata_key: metadataKey, metadata_value: metadataValue },
  });
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const getPublishedResources = async () => {
  return getPublishedResourcesWithModuleContext();
};

export const countResourcesByStatus = async (status, actor = null) => {
  const requestedStatus = normalizeStatus(status);
  const admin = isAdmin(actor?.roles || []);
  if (!admin && requestedStatus !== "published") {
    return 0;
  }

  const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_STATUS, {
    replacements: { status: requestedStatus },
  });
  return parseCountRow(results[0]);
};

export const countResourcesByEducationalType = async (educationalType, actor = null) => {
  const admin = isAdmin(actor?.roles || []);
  if (admin) {
    const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_EDUCATIONAL_TYPE, {
      replacements: { educational_type: educationalType },
    });
    return parseCountRow(results[0]);
  }

  const [results] = await sequelize.query(
    `
    SELECT COUNT(*)::bigint AS count
    FROM public.resources
    WHERE educational_type = :educational_type
      AND status = 'published'::resource_status
    `,
    {
      replacements: { educational_type: educationalType },
    }
  );
  return parseCountRow(results[0]);
};

export const countResourcesByFormat = async (format, actor = null) => {
  const admin = isAdmin(actor?.roles || []);
  if (admin) {
    const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_FORMAT, {
      replacements: { format },
    });
    return parseCountRow(results[0]);
  }

  const [results] = await sequelize.query(
    `
    SELECT COUNT(*)::bigint AS count
    FROM public.resources
    WHERE format = :format
      AND status = 'published'::resource_status
    `,
    {
      replacements: { format },
    }
  );
  return parseCountRow(results[0]);
};

export const countResourcesByCreator = async (createdBy, actor = null) => {
  const admin = isAdmin(actor?.roles || []);
  const self = actor?.id && actor.id === createdBy;

  if (admin || self) {
    const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_CREATOR, {
      replacements: { created_by: createdBy },
    });
    return parseCountRow(results[0]);
  }

  const [results] = await sequelize.query(
    `
    SELECT COUNT(*)::bigint AS count
    FROM public.resources
    WHERE created_by = :created_by
      AND status = 'published'::resource_status
    `,
    {
      replacements: { created_by: createdBy },
    }
  );
  return parseCountRow(results[0]);
};

export const getResourcesWithRatings = async (actor = null) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_WITH_RATINGS);
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
};

export const getResourceStatistics = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_STATISTICS, {
    replacements: { resource_id: resourceId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getResourceStatuses = async () => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_STATUSES);
  return results;
};

export const getResourceEducationalTypes = async () => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_EDUCATIONAL_TYPES);
  return results;
};

export const getResourceFormats = async () => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_FORMATS);
  return results;
};

export const getMyResources = async (userId) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_CREATOR, {
    replacements: { created_by: userId },
  });
  return results;
};

export const getAllPublishedStudentResources = async () => {
  const [results] = await sequelize.query(`
    SELECT DISTINCT
      r.*,
      u.full_name AS creator_name,
      u.id AS creator_id,
      COALESCE(AVG(rat.score), 0)::NUMERIC(3,2) AS avg_rating,
      COUNT(rat.user_id) AS total_ratings,
      COUNT(DISTINCT f.user_id) AS total_favorites
    FROM resources r
    INNER JOIN users u ON r.created_by = u.id
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles ro ON ur.role_id = ro.id
    LEFT JOIN ratings rat ON r.id = rat.resource_id
    LEFT JOIN favorites f ON r.id = f.resource_id
    WHERE r.status = 'published'
      AND ro.name = 'student'
    GROUP BY r.id, u.full_name, u.id
    ORDER BY r.created_at DESC
  `);
  return results;
};

export const canModifyResource = async (resourceId, userId, admin = false) => {
  if (admin) return true;

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Ressource introuvable", 404);
  }
  if (resource.created_by !== userId) {
    throw new AppError("Vous n'avez pas la permission de modifier cette ressource", 403);
  }
  return true;
};

export const createResourceWithModules = async (resourceData, moduleIds = []) => {
  const resource = await createResource(
    resourceData.title,
    resourceData.description,
    resourceData.status,
    resourceData.url,
    resourceData.language,
    resourceData.license,
    resourceData.created_by,
    resourceData.educational_type,
    resourceData.format,
    resourceData.resource_type_id,
    resourceData.metadata,
    resourceData.access_tier,
    resourceData.actor || null
  );

  if (moduleIds?.length) {
    for (const moduleId of moduleIds) {
      try {
        await addResourceToModule(
          resource.id,
          moduleId,
          resourceData.chapter,
          resourceData.difficulty,
          resourceData.exam_related
        );
      } catch (_error) {
        // best effort
      }
    }
  }

  return resource;
};

const assertCanModifyResourceSource = (resource, actor = null) => {
  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;

  if (!admin && !owner) {
    throw new AppError("Access denied", 403);
  }

  if (!admin && !["draft", "pending", "rejected"].includes(normalizeStatus(resource.status))) {
    throw new AppError("You can only modify file/source on draft, pending, or rejected resources", 403);
  }
};

export const recordResourceDownload = async (userId, resourceId, actor = null) => {
  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  await assertCanDownloadResource(resource, actor || { id: userId, roles: [] });

  const [results] = await sequelize.query(
    `SELECT * FROM public.sp_resource_record_download(:user_id, :resource_id)`,
    {
      replacements: { user_id: userId, resource_id: resourceId },
    }
  );
  return results[0];
};

export const createResourceUploadUrl = async ({ userId, filename, mimeType }) => {
  if (!isR2Configured()) {
    throw new AppError("R2 storage is not configured", 500);
  }

  const objectKey = buildObjectKey({ userId, filename, prefix: "pending" });
  const { uploadUrl, expiresIn } = await getUploadUrl({ objectKey, mimeType });
  console.log(`[ResourceUpload] Generated generic upload URL for user ${userId}, key=${objectKey}`);

  return {
    object_key: objectKey,
    upload_url: uploadUrl,
    expires_in: expiresIn,
    bucket: getR2BucketName(),
  };
};

export const createResourceUploadUrlById = async ({ resourceId, filename, mimeType, actor }) => {
  if (!isR2Configured()) {
    throw new AppError("R2 storage is not configured", 500);
  }

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  assertCanModifyResourceSource(resource, actor);

  const objectKey = buildObjectKey({
    userId: resource.created_by,
    filename,
    prefix: `resources/${resourceId}`,
  });

  const { uploadUrl, expiresIn } = await getUploadUrl({ objectKey, mimeType });
  console.log(`[ResourceUpload] Generated upload URL for resource ${resourceId}, key=${objectKey}`);
  return {
    object_key: objectKey,
    upload_url: uploadUrl,
    expires_in: expiresIn,
    bucket: getR2BucketName(),
    resource_id: Number(resourceId),
  };
};

export const createResourceFromUploadedObject = async ({
  objectKey,
  title,
  description,
  status,
  language,
  license,
  educationalType,
  format,
  resourceTypeId,
  metadata,
  accessTier,
  actor,
}) => {
  if (!isR2Configured()) {
    throw new AppError("R2 storage is not configured", 500);
  }

  if (!objectKey) {
    throw new AppError("Object key is required", 400);
  }

  let head;
  try {
    head = await headObject(objectKey);
  } catch {
    console.error(`[ResourceUpload] Confirm upload failed. Object not found: ${objectKey}`);
    throw new AppError("Uploaded object not found in storage", 404);
  }

  const publicUrl = getPublicObjectUrl(objectKey);
  const mergedMetadata = mergeStorageMetadata({
    existingMetadata: metadata,
    objectKey,
    mimeType: head?.ContentType || null,
    sizeBytes: head?.ContentLength || null,
    originalFilename: String(objectKey).split("/").pop() || null,
    publicUrl,
  });

  const resolvedUrl = publicUrl || `r2://${getR2BucketName()}/${objectKey}`;

  const created = await createResource(
    title,
    description,
    status,
    resolvedUrl,
    language,
    license,
    actor?.id,
    educationalType,
    format,
    resourceTypeId,
    mergedMetadata,
    accessTier,
    actor
  );

  await persistStorageColumns({
    resourceId: created?.id,
    objectKey,
    mimeType: head?.ContentType || null,
    sizeBytes: head?.ContentLength || null,
    originalFilename: String(objectKey).split("/").pop() || null,
    publicUrl,
  });

  console.log(`[ResourceUpload] Resource ${created?.id} created from uploaded object key=${objectKey}`);

  return created;
};

export const attachUploadedObjectToResource = async ({ resourceId, objectKey, actor }) => {
  if (!isR2Configured()) {
    throw new AppError("R2 storage is not configured", 500);
  }

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  assertCanModifyResourceSource(resource, actor);

  let head;
  try {
    head = await headObject(objectKey);
  } catch {
    console.error(`[ResourceUpload] Attach file failed. Object not found: ${objectKey}`);
    throw new AppError("Uploaded object not found in storage", 404);
  }

  const publicUrl = getPublicObjectUrl(objectKey);
  const mergedMetadata = mergeStorageMetadata({
    existingMetadata: resource.metadata,
    objectKey,
    mimeType: head?.ContentType || null,
    sizeBytes: head?.ContentLength || null,
    originalFilename: String(objectKey).split("/").pop() || null,
    publicUrl,
  });

  const resolvedUrl = publicUrl || `r2://${getR2BucketName()}/${objectKey}`;

  try {
    await sequelize.query(
      `
      UPDATE public.resources
      SET
        url = :url,
        metadata = :metadata::jsonb,
        updated_at = NOW(),
        storage_provider = :storage_provider,
        bucket = :bucket,
        object_key = :object_key,
        mime_type = :mime_type,
        size_bytes = :size_bytes,
        original_filename = :original_filename,
        is_public = :is_public,
        upload_status = 'uploaded'
      WHERE id = :id
      `,
      {
        replacements: {
          id: Number(resourceId),
          url: resolvedUrl,
          metadata: JSON.stringify(mergedMetadata),
          storage_provider: "cloudflare-r2",
          bucket: getR2BucketName(),
          object_key: objectKey,
          mime_type: head?.ContentType || null,
          size_bytes: Number.isFinite(head?.ContentLength) ? Number(head.ContentLength) : null,
          original_filename: String(objectKey).split("/").pop() || null,
          is_public: Boolean(publicUrl),
        },
      }
    );
  } catch {
    await sequelize.query(
      `
      UPDATE public.resources
      SET
        url = :url,
        metadata = :metadata::jsonb,
        updated_at = NOW()
      WHERE id = :id
      `,
      {
        replacements: {
          id: Number(resourceId),
          url: resolvedUrl,
          metadata: JSON.stringify(mergedMetadata),
        },
      }
    );
  }

  console.log(`[ResourceUpload] Attached object key=${objectKey} to resource ${resourceId}`);

  return getResourceById(resourceId);
};

export const attachExternalUrlToResource = async ({ resourceId, url, actor }) => {
  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  assertCanModifyResourceSource(resource, actor);

  const existingMetadata = parseMetadata(resource.metadata);
  const mergedMetadata = {
    ...existingMetadata,
    storage: {
      ...(existingMetadata.storage || {}),
      provider: "external-url",
      object_key: null,
      bucket: null,
      mime_type: null,
      size_bytes: null,
      original_filename: null,
      public_url: url,
      uploaded_at: new Date().toISOString(),
    },
  };

  try {
    await sequelize.query(
      `
      UPDATE public.resources
      SET
        url = :url,
        metadata = :metadata::jsonb,
        updated_at = NOW(),
        storage_provider = NULL,
        bucket = NULL,
        object_key = NULL,
        mime_type = NULL,
        size_bytes = NULL,
        original_filename = NULL,
        is_public = TRUE,
        upload_status = NULL
      WHERE id = :id
      `,
      {
        replacements: {
          id: Number(resourceId),
          url,
          metadata: JSON.stringify(mergedMetadata),
        },
      }
    );
  } catch {
    await sequelize.query(
      `
      UPDATE public.resources
      SET
        url = :url,
        metadata = :metadata::jsonb,
        updated_at = NOW()
      WHERE id = :id
      `,
      {
        replacements: {
          id: Number(resourceId),
          url,
          metadata: JSON.stringify(mergedMetadata),
        },
      }
    );
  }

  console.log(`[ResourceUpload] Attached external URL to resource ${resourceId}: ${url}`);

  return getResourceById(resourceId);
};

export const uploadFileDirectlyToResource = async ({ resourceId, fileBuffer, originalName, mimeType, actor }) => {
  if (!isR2Configured()) {
    throw new AppError("R2 storage is not configured", 500);
  }

  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  assertCanModifyResourceSource(resource, actor);

  const objectKey = buildObjectKey({
    userId: resource.created_by,
    filename: originalName || "upload.bin",
    prefix: `resources/${resourceId}`,
  });

  await putObjectBuffer({
    objectKey,
    body: fileBuffer,
    mimeType,
  });

  console.log(`[ResourceUpload] Uploaded via backend proxy for resource ${resourceId}, key=${objectKey}`);
  return attachUploadedObjectToResource({ resourceId, objectKey, actor });
};

export const getResourceFileUrl = async (resourceId, options = {}, actor = null) => {
  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  await assertCanDownloadResource(resource, actor);

  const objectKey = extractObjectKeyFromResource(resource);
  if (objectKey && !isR2Configured()) {
    throw new AppError("Storage service is unavailable", 503);
  }

  if (!objectKey) {
    if (typeof resource.url === "string" && resource.url.startsWith("r2://")) {
      throw new AppError("Resource file reference is invalid", 500);
    }

    return {
      download_url: resource.url || null,
      source: "resource_url",
      expires_in: null,
    };
  }

  const fileName = parseMetadata(resource.metadata)?.storage?.original_filename || resource.title || "resource";
  const { downloadUrl, expiresIn } = await getDownloadUrl({
    objectKey,
    filename: fileName,
    forceDownload: options?.forceDownload === true,
  });

  return {
    download_url: downloadUrl,
    source: "r2_signed",
    expires_in: expiresIn,
  };
};
