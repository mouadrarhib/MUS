import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import { getCurrentUserId } from "../middleware/auth.js";
import { addResourceToModule } from "./resourceModuleMapService.js";

const Resource = sequelize.models.Resource;

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
  metadata
) => {
  const userId = createdBy || getCurrentUserId() || null;

  const [results] = await sequelize.query(SQL.RESOURCE.CREATE, {
    replacements: {
      title,
      description,
      status,
      url,
      language,
      license,
      created_by: userId,  // ✅ This maps to :created_by in SQL
      educational_type: educationalType,
      format,
      resource_type_id: resourceTypeId,
      metadata: metadata ? JSON.stringify(metadata) : null,  // ✅ Convert to JSON string if needed
    },
  });
  return results;
};

export const getAllResources = async () => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_ALL);
  return results;
};

export const getResourceById = async (id) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_ID, {
    replacements: { id },
  });
  return results.length > 0 ? results[0] : null;
};

export const getResourcesByStatus = async (status) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_STATUS, {
    replacements: { status },
  });
  return results;
};

export const getResourcesByEducationalType = async (educationalType) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_EDUCATIONAL_TYPE, {
    replacements: { educational_type: educationalType },
  });
  return results;
};

export const getResourcesByFormat = async (format) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_FORMAT, {
    replacements: { format },
  });
  return results;
};

export const getResourcesByResourceType = async (resourceTypeId) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_RESOURCE_TYPE, {
    replacements: { resource_type_id: resourceTypeId },
  });
  return results;
};

export const getResourcesByCreator = async (createdBy) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_CREATOR, {
    replacements: { created_by: createdBy },
  });
  return results;
};

export const getResourcesByConnectedUser = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    return [];
  }
  return getResourcesByCreator(userId);
};

export const getResourcesByLanguage = async (language) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_LANGUAGE, {
    replacements: { language },
  });
  return results;
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
  metadata
) => {
  const [results] = await sequelize.query(SQL.RESOURCE.UPDATE, {
    replacements: {
      id,
      title,
      description,
      status,
      url,
      language,
      license,
      educational_type: educationalType,
      format,
      resource_type_id: resourceTypeId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
  return results;
};

export const updateResourceMetadata = async (id, metadata) => {
  const [results] = await sequelize.query(SQL.RESOURCE.UPDATE_METADATA, {
    replacements: { 
      id, 
      metadata: metadata ? JSON.stringify(metadata) : null 
    },
  });
  return results;
};

export const updateResourceStatus = async (id, status) => {
  const [results] = await sequelize.query(SQL.RESOURCE.UPDATE_STATUS, {
    replacements: { id, status },
  });
  return results;
};

export const publishResource = async (id) => {
  const [results] = await sequelize.query(SQL.RESOURCE.PUBLISH, {
    replacements: { id },
  });
  return results;
};

export const archiveResource = async (id) => {
  const [results] = await sequelize.query(SQL.RESOURCE.ARCHIVE, {
    replacements: { id },
  });
  return results;
};

export const deleteResource = async (id) => {
  await sequelize.query(SQL.RESOURCE.DELETE, {
    replacements: { id },
  });
};

export const searchResources = async (searchTerm) => {
  const [results] = await sequelize.query(SQL.RESOURCE.SEARCH, {
    replacements: { search_term: searchTerm },
  });
  return results;
};

export const advancedSearchResources = async (
  searchTerm,
  status,
  educationalType,
  format,
  language,
  resourceTypeId
) => {
  const [results] = await sequelize.query(SQL.RESOURCE.ADVANCED_SEARCH, {
    replacements: {
      search_term: searchTerm,
      status,
      educational_type: educationalType,
      format,
      language,
      resource_type_id: resourceTypeId,
    },
  });
  return results;
};

export const searchResourcesByMetadata = async (metadataKey, metadataValue) => {
  const [results] = await sequelize.query(SQL.RESOURCE.SEARCH_BY_METADATA, {
    replacements: { metadata_key: metadataKey, metadata_value: metadataValue },
  });
  return results;
};

export const getPublishedResources = async () => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_PUBLISHED);
  return results;
};

export const countResourcesByStatus = async (status) => {
  const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_STATUS, {
    replacements: { status },
  });
  return results.length > 0 ? results[0] : null;
};

export const countResourcesByEducationalType = async (educationalType) => {
  const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_EDUCATIONAL_TYPE, {
    replacements: { educational_type: educationalType },
  });
  return results.length > 0 ? results[0] : null;
};

export const countResourcesByFormat = async (format) => {
  const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_FORMAT, {
    replacements: { format },
  });
  return results.length > 0 ? results[0] : null;
};

export const countResourcesByCreator = async (createdBy) => {
  const [results] = await sequelize.query(SQL.RESOURCE.COUNT_BY_CREATOR, {
    replacements: { created_by: createdBy },
  });
  return results.length > 0 ? results[0] : null;
};

export const getResourcesWithRatings = async () => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_WITH_RATINGS);
  return results;
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

//Récupérer MES resources (student uniquement)
export const getMyResources = async (userId) => {
  const [results] = await sequelize.query(SQL.RESOURCE.GET_BY_CREATOR, {
    replacements: { created_by: userId },
  });
  return results;
};

/**
 * Récupérer toutes les resources PUBLISHED des students
 * (Pour que les students voient les partages des autres)
 */
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

/**
 * Vérifier si l'utilisateur peut modifier la resource
 */
export const canModifyResource = async (resourceId, userId, isAdmin = false) => {
  if (isAdmin) {
    return true; // Admin bypass
  }
  
  const resource = await getResourceById(resourceId);
  
  if (!resource) {
    throw new AppError("Resource not found", 404);
  }
  
  if (resource.created_by !== userId) {
    throw new AppError("You don't have permission to modify this resource", 403);
  }
  
  return true;
};


/**
 * Créer une resource ET l'associer à des modules
 * @param {Object} resourceData - Données de la resource
 * @param {Array<number>} moduleIds - IDs des modules à associer
 */
export const createResourceWithModules = async (resourceData, moduleIds = []) => {
  // 1. Créer la resource
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
  
  // 2. Associer aux modules
  if (moduleIds && moduleIds.length > 0) {
    for (const moduleId of moduleIds) {
      try {
        await addResourceToModule(
          resource.id,
          moduleId,
          resourceData.chapter,
          resourceData.difficulty,
          resourceData.exam_related
        );
      } catch (error) {
        console.error(`Failed to associate resource ${resource.id} with module ${moduleId}:`, error);
      }
    }
  }
  
  return resource;
};
