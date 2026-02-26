import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

export const createTag = async ({ name, slug, category, description, createdBy }) => {
  const [results] = await sequelize.query(SQL.TAG.CREATE, {
    replacements: {
      name,
      slug,
      category: category || "topic",
      description: description || null,
      created_by: createdBy || null,
    },
  });
  return results?.[0] || null;
};

export const getTagById = async (id) => {
  const [results] = await sequelize.query(SQL.TAG.GET_BY_ID, {
    replacements: { id },
  });
  return results?.[0] || null;
};

export const getTagBySlug = async (slug) => {
  const [results] = await sequelize.query(SQL.TAG.GET_BY_SLUG, {
    replacements: { slug },
  });
  return results?.[0] || null;
};

export const listTags = async ({ searchTerm = null, category = null, isActive = null, limit = 100 } = {}) => {
  const [results] = await sequelize.query(SQL.TAG.GET_ALL, {
    replacements: {
      search_term: searchTerm || null,
      category: category || null,
      is_active: typeof isActive === "boolean" ? isActive : null,
      limit_value: Number.isInteger(limit) ? limit : 100,
    },
  });
  return results;
};

export const updateTag = async ({ id, name, slug, category, description, isActive }) => {
  const [results] = await sequelize.query(SQL.TAG.UPDATE, {
    replacements: {
      id,
      name: name || null,
      slug: slug || null,
      category: category || null,
      description: typeof description === "string" ? description : null,
      is_active: typeof isActive === "boolean" ? isActive : null,
    },
  });
  return results?.[0] || null;
};

export const deleteTag = async (id) => {
  const [results] = await sequelize.query(SQL.TAG.DELETE, {
    replacements: { id },
  });
  return Boolean(results?.[0]?.sp_tag_delete);
};

export const tagExistsBySlug = async (slug, excludeId = null) => {
  const [results] = await sequelize.query(SQL.TAG.EXISTS_BY_SLUG, {
    replacements: {
      slug,
      exclude_id: excludeId || null,
    },
  });
  return Boolean(results?.[0]?.sp_tag_exists_by_slug);
};

export const getTagsByResource = async (resourceId) => {
  const [results] = await sequelize.query(SQL.TAG.GET_BY_RESOURCE, {
    replacements: { resource_id: resourceId },
  });
  return results;
};

export const getTagsByResources = async (resourceIds = []) => {
  const normalized = Array.from(new Set((resourceIds || []).map((v) => Number(v)).filter(Number.isFinite)));
  if (!normalized.length) return [];

  const arrayLiteral = `{${normalized.join(",")}}`;
  const [results] = await sequelize.query(SQL.TAG.GET_BY_RESOURCES, {
    replacements: { resource_ids: arrayLiteral },
  });
  return results;
};

export const attachTagToResource = async ({ resourceId, tagId }) => {
  const [results] = await sequelize.query(SQL.TAG.ATTACH_TO_RESOURCE, {
    replacements: {
      resource_id: resourceId,
      tag_id: tagId,
    },
  });
  return results?.[0] || null;
};

export const detachTagFromResource = async ({ resourceId, tagId }) => {
  const [results] = await sequelize.query(SQL.TAG.DETACH_FROM_RESOURCE, {
    replacements: {
      resource_id: resourceId,
      tag_id: tagId,
    },
  });
  return Boolean(results?.[0]?.sp_tag_detach_from_resource);
};

export const replaceResourceTags = async ({ resourceId, tagIds = [] }) => {
  const normalized = Array.from(new Set((tagIds || []).map((v) => Number(v)).filter(Number.isFinite)));
  const arrayLiteral = `{${normalized.join(",")}}`;
  const [results] = await sequelize.query(SQL.TAG.REPLACE_RESOURCE_TAGS, {
    replacements: {
      resource_id: resourceId,
      tag_ids: arrayLiteral,
    },
  });
  return results;
};

export const getPopularTags = async (limit = 20) => {
  const [results] = await sequelize.query(SQL.TAG.GET_POPULAR, {
    replacements: { limit_value: Number.isInteger(limit) ? limit : 20 },
  });
  return results;
};
