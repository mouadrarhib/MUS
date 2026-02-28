import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { getResourceById } from "./resourceService.js";

const TWO_HOURS = "2 hours";

export const createConfusionSignal = async ({ resourceId, userId, note = null, actor = null }) => {
  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Ressource introuvable", 404);
  }

  const roles = actor?.roles || [];
  const isAdmin = roles.includes("admin");
  const isOwner = resource.created_by === userId;
  const isPublished = String(resource.status || "").toLowerCase() === "published";

  if (!isAdmin && !isOwner && !isPublished) {
    throw new AppError("Ressource introuvable", 404);
  }

  const [rows] = await sequelize.query(
    `
    SELECT created_at
    FROM public.resource_confusion_signals
    WHERE user_id = :user_id
      AND resource_id = :resource_id
      AND created_at >= NOW() - INTERVAL '${TWO_HOURS}'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    {
      replacements: {
        user_id: userId,
        resource_id: resourceId,
      },
    }
  );

  if (rows.length) {
    throw new AppError("Vous avez deja envoye un signal recemment pour cette ressource. Reessayez dans 2 heures.", 429);
  }

  const [createdRows] = await sequelize.query(
    `
    INSERT INTO public.resource_confusion_signals (resource_id, user_id, note)
    VALUES (:resource_id, :user_id, :note)
    RETURNING id, resource_id, user_id, note, created_at
    `,
    {
      replacements: {
        resource_id: resourceId,
        user_id: userId,
        note: note?.trim() || null,
      },
    }
  );

  return createdRows[0];
};

export const getResourceConfusionCount = async (resourceId) => {
  const [rows] = await sequelize.query(
    `
    SELECT COUNT(*)::bigint AS total_signals,
           COUNT(DISTINCT user_id)::bigint AS unique_users,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::bigint AS signals_24h
    FROM public.resource_confusion_signals
    WHERE resource_id = :resource_id
    `,
    {
      replacements: { resource_id: resourceId },
    }
  );

  return rows[0] || { total_signals: 0, unique_users: 0, signals_24h: 0 };
};

export const getResourceConfusionRecent = async (resourceId, limit = 20) => {
  const [rows] = await sequelize.query(
    `
    SELECT
      rcs.id,
      rcs.resource_id,
      rcs.user_id,
      u.full_name AS user_name,
      rcs.note,
      rcs.created_at
    FROM public.resource_confusion_signals rcs
    INNER JOIN public.users u ON u.id = rcs.user_id
    WHERE rcs.resource_id = :resource_id
    ORDER BY rcs.created_at DESC
    LIMIT :limit
    `,
    {
      replacements: {
        resource_id: resourceId,
        limit,
      },
    }
  );

  return rows;
};

export const getConfusionOverview = async ({ groupBy = "resource", days = 7 } = {}) => {
  if (!["resource", "module"].includes(groupBy)) {
    throw new AppError("group_by invalide", 400);
  }

  const intervalDays = Number.isInteger(days) && days > 0 && days <= 90 ? days : 7;

  if (groupBy === "resource") {
    const [rows] = await sequelize.query(
      `
      SELECT
        r.id AS resource_id,
        r.title AS resource_title,
        COUNT(rcs.id)::bigint AS signals_count,
        COUNT(DISTINCT rcs.user_id)::bigint AS unique_users,
        MAX(rcs.created_at) AS last_signal_at
      FROM public.resource_confusion_signals rcs
      INNER JOIN public.resources r ON r.id = rcs.resource_id
      WHERE rcs.created_at >= NOW() - (:days::text || ' days')::interval
      GROUP BY r.id, r.title
      ORDER BY signals_count DESC, last_signal_at DESC
      `,
      {
        replacements: { days: intervalDays },
      }
    );

    return rows;
  }

  const [rows] = await sequelize.query(
    `
    SELECT
      m.id AS module_id,
      m.code AS module_code,
      m.title AS module_title,
      COUNT(rcs.id)::bigint AS signals_count,
      COUNT(DISTINCT rcs.user_id)::bigint AS unique_users,
      MAX(rcs.created_at) AS last_signal_at
    FROM public.resource_confusion_signals rcs
    INNER JOIN public.resource_module_map rmm ON rmm.resource_id = rcs.resource_id
    INNER JOIN public.modules m ON m.id = rmm.module_id
    WHERE rcs.created_at >= NOW() - (:days::text || ' days')::interval
    GROUP BY m.id, m.code, m.title
    ORDER BY signals_count DESC, last_signal_at DESC
    `,
    {
      replacements: { days: intervalDays },
    }
  );

  return rows;
};
