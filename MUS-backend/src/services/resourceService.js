import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import { getCurrentUserId } from "../middleware/auth.js";

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
