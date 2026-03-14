import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const normalizeTagIds = (tagIds = []) => {
  if (!Array.isArray(tagIds)) return [];
  return Array.from(new Set(tagIds.map((id) => Number(id)).filter(Number.isInteger).filter((id) => id > 0)));
};

export const getUserTagPreferences = async (userId) => {
  const [rows] = await sequelize.query(SQL.USER_TAG_PREFERENCE.GET_BY_USER, {
    replacements: { user_id: userId },
  });
  return rows || [];
};

export const setUserTagPreferences = async (userId, tagIds = []) => {
  const normalized = normalizeTagIds(tagIds);
  const arrayLiteral = `{${normalized.join(",")}}`;

  const [rows] = await sequelize.query(SQL.USER_TAG_PREFERENCE.SET_FOR_USER, {
    replacements: {
      user_id: userId,
      tag_ids: arrayLiteral,
    },
  });

  return rows || [];
};

export const getRecommendationsForUser = async (userId, limit = 24) => {
  const [rows] = await sequelize.query(SQL.RECOMMENDATION.GET_FOR_USER, {
    replacements: {
      user_id: userId,
      limit_value: Math.max(Number(limit) || 24, 1),
    },
  });

  return rows || [];
};

export { normalizeTagIds };
