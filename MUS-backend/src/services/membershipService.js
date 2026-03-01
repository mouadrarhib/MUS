import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import AppError from "../helpers/appError.js";

const normalizeMembership = (row = null) => {
  if (!row) {
    return {
      plan_code: "free",
      plan_name: "Free",
      status: "active",
      is_premium: false,
      starts_at: null,
      ends_at: null,
      source: "system",
      notes: null,
    };
  }

  return {
    membership_id: row.membership_id,
    user_id: row.user_id,
    plan_id: row.plan_id,
    plan_code: row.plan_code || "free",
    plan_name: row.plan_name || "Free",
    status: row.status || "active",
    starts_at: row.starts_at || null,
    ends_at: row.ends_at || null,
    source: row.source || "system",
    notes: row.notes || null,
    is_premium: Boolean(row.is_premium),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
};

export const listActiveMembershipPlans = async () => {
  const [rows] = await sequelize.query(SQL.MEMBERSHIP.GET_ACTIVE_PLANS);
  return Array.isArray(rows) ? rows : [];
};

export const getCurrentMembershipForUser = async (userId) => {
  const [rows] = await sequelize.query(SQL.MEMBERSHIP.GET_CURRENT_BY_USER, {
    replacements: { user_id: userId },
  });

  return normalizeMembership(rows?.[0] || null);
};

export const userHasPremiumAccess = async (userId) => {
  const [rows] = await sequelize.query(SQL.MEMBERSHIP.HAS_PREMIUM_ACCESS, {
    replacements: { user_id: userId },
  });

  const value = rows?.[0]?.has_premium_access;
  return Boolean(value);
};

export const assignMembershipToUser = async ({
  userId,
  planCode,
  startsAt = null,
  endsAt = null,
  source = "admin",
  notes = null,
}) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  if (!planCode) {
    throw new AppError("Plan code is required", 400);
  }

  const [rows] = await sequelize.query(SQL.MEMBERSHIP.ASSIGN, {
    replacements: {
      user_id: userId,
      plan_code: String(planCode).trim().toLowerCase(),
      starts_at: startsAt,
      ends_at: endsAt,
      source: source || "admin",
      notes,
    },
  });

  return normalizeMembership(rows?.[0] || null);
};

export const cancelUserMembership = async ({ userId, notes = null }) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const [rows] = await sequelize.query(SQL.MEMBERSHIP.CANCEL, {
    replacements: {
      user_id: userId,
      notes,
    },
  });

  const cancelled = Boolean(rows?.[0]?.cancelled);
  return {
    cancelled,
    membership: await getCurrentMembershipForUser(userId),
  };
};
