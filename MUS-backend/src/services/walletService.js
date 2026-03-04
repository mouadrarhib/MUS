import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getWalletSummary = async (userId) => {
  const [rows] = await sequelize.query(SQL.WALLET.GET_SUMMARY, {
    replacements: { user_id: userId },
  });

  const row = rows?.[0] || {};
  return {
    user_id: row.user_id || userId,
    current_points: toNumber(row.current_points),
    total_resources: toNumber(row.total_resources),
    published_resources: toNumber(row.published_resources),
    total_downloads_received: toNumber(row.total_downloads_received),
    total_favorites_received: toNumber(row.total_favorites_received),
    points_from_downloads: toNumber(row.points_from_downloads),
    points_from_favorites: toNumber(row.points_from_favorites),
    total_points_from_engagement: toNumber(row.total_points_from_engagement),
    points_last_7_days: toNumber(row.points_last_7_days),
    points_last_30_days: toNumber(row.points_last_30_days),
    updated_at: row.updated_at || null,
  };
};

export const getWalletTopResources = async (userId, limit = 10) => {
  const [rows] = await sequelize.query(SQL.WALLET.GET_TOP_RESOURCES, {
    replacements: {
      user_id: userId,
      limit_value: Math.max(Number(limit) || 10, 1),
    },
  });

  return (rows || []).map((row) => ({
    resource_id: toNumber(row.resource_id),
    resource_title: row.resource_title || "Untitled resource",
    resource_status: row.resource_status || "unknown",
    created_at: row.created_at || null,
    downloads_count: toNumber(row.downloads_count),
    favorites_count: toNumber(row.favorites_count),
    points_from_downloads: toNumber(row.points_from_downloads),
    points_from_favorites: toNumber(row.points_from_favorites),
    points_total: toNumber(row.points_total),
  }));
};

export const getWalletActivity = async (userId, { limit = 20, offset = 0 } = {}) => {
  const [rows] = await sequelize.query(SQL.WALLET.GET_ACTIVITY, {
    replacements: {
      user_id: userId,
      limit_value: Math.max(Number(limit) || 20, 1),
      offset_value: Math.max(Number(offset) || 0, 0),
    },
  });

  return (rows || []).map((row) => ({
    event_type: row.event_type,
    points_change: toNumber(row.points_change),
    resource_id: toNumber(row.resource_id),
    resource_title: row.resource_title || "Unknown resource",
    actor_user_id: row.actor_user_id || null,
    occurred_at: row.occurred_at || null,
  }));
};
