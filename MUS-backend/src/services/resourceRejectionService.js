import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

export const createResourceRejection = async ({
  resourceIdOriginal,
  uploaderId,
  rejectedBy,
  reason,
  resourceTitle,
  resourceUrl,
  resourceFormat,
  resourceEducationalType,
  resourceSnapshot,
}) => {
  const [results] = await sequelize.query(SQL.RESOURCE_REJECTION.CREATE, {
    replacements: {
      resource_id_original: resourceIdOriginal || null,
      uploader_id: uploaderId,
      rejected_by: rejectedBy,
      reason,
      resource_title: resourceTitle,
      resource_url: resourceUrl || null,
      resource_format: resourceFormat || null,
      resource_educational_type: resourceEducationalType || null,
      resource_snapshot: JSON.stringify(resourceSnapshot || {}),
    },
  });
  return results?.[0] || null;
};

export const getResourceRejectionsByUser = async ({ uploaderId, limitValue = 100 }) => {
  const [results] = await sequelize.query(SQL.RESOURCE_REJECTION.GET_BY_USER, {
    replacements: {
      uploader_id: uploaderId,
      limit_value: Number.isInteger(limitValue) ? limitValue : 100,
    },
  });
  return results;
};

export const getAllResourceRejections = async ({ searchTerm = null, limitValue = 200 } = {}) => {
  const [results] = await sequelize.query(SQL.RESOURCE_REJECTION.GET_ALL, {
    replacements: {
      search_term: searchTerm || null,
      limit_value: Number.isInteger(limitValue) ? limitValue : 200,
    },
  });
  return results;
};

export const getResourceRejectionById = async (id) => {
  const [results] = await sequelize.query(SQL.RESOURCE_REJECTION.GET_BY_ID, {
    replacements: { id },
  });
  return results?.[0] || null;
};
