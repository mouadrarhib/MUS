import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import { getCurrentUserId } from "../middleware/auth.js";
import { addResourceToModule } from "./resourceModuleMapService.js";
import AppError from "../helpers/appError.js";

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

const resolveCreationStatus = (requestedStatus, roles = []) => {
  if (isAdmin(roles)) {
    return requestedStatus || "published";
  }
  if (isTeacher(roles)) {
    return process.env.AUTO_PUBLISH_TEACHER === "true" ? "published" : "pending";
  }
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
  actor = null
) => {
  const userId = createdBy || getCurrentUserId() || null;
  const statusToCreate = resolveCreationStatus(status, actor?.roles || []);

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
  return results.length > 0 ? results[0] : null;
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
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_EDUCATIONAL_TYPE, {
    replacements: { educational_type: educationalType },
  });
  return isAdmin(actor?.roles || []) ? results : filterPublishedOnly(results);
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
  actor = null
) => {
  const resource = await getResourceById(id);
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (!admin && !owner) {
    throw new AppError("Access denied", 403);
  }

  if (!admin && !["draft", "rejected"].includes(normalizeStatus(resource.status))) {
    throw new AppError("You can only edit draft or rejected resources", 403);
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
    throw new AppError("Resource not found", 404);
  }

  const currentStatus = normalizeStatus(resource.status);
  const requestedStatus = normalizeStatus(status);
  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(requestedStatus)) {
    throw new AppError(`Invalid status transition: ${currentStatus} -> ${requestedStatus}`, 403);
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (!admin) {
    if (!owner) {
      throw new AppError("Access denied", 403);
    }

    const ownerAllowed = new Set(["draft", "pending", "rejected"]);
    if (!ownerAllowed.has(requestedStatus)) {
      throw new AppError("Only admin can set this status", 403);
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
    throw new AppError("Resource not found", 404);
  }

  const admin = isAdmin(actor?.roles || []);
  const owner = actor?.id && resource.created_by === actor.id;
  if (!admin && !owner) {
    throw new AppError("Access denied", 403);
  }

  if (!admin && normalizeStatus(resource.status) !== "draft") {
    throw new AppError("You can only delete draft resources", 403);
  }

  await sequelize.query(SQL.RESOURCE.DELETE, {
    replacements: { id },
  });
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
  const [results] = await sequelize.query(SQL.RESOURCE.GET_PUBLISHED);
  return results;
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
    throw new AppError("Resource not found", 404);
  }
  if (resource.created_by !== userId) {
    throw new AppError("You don't have permission to modify this resource", 403);
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
    resourceData.metadata
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

export const recordResourceDownload = async (userId, resourceId) => {
  const [results] = await sequelize.query(
    `SELECT * FROM public.sp_resource_record_download(:user_id, :resource_id)`,
    {
      replacements: { user_id: userId, resource_id: resourceId },
    }
  );
  return results[0];
};

