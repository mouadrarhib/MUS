import AppError from "../helpers/appError.js";
import { Role, UserRole, sequelize } from "../models/index.js";

export const OPERATIONAL_ROLE_NAMES = ["student", "teacher", "admin"];
export const UNIQUE_ADMIN_ROLE = "admin";

export const normalizeRoleName = (value) => String(value || "").trim().toLowerCase();

export const getRoleByNameStrict = async (roleName, transaction) => {
  const normalized = normalizeRoleName(roleName);
  const role = await Role.findOne({ where: { name: normalized }, transaction });
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  return role;
};

export const getRoleByIdStrict = async (roleId, transaction) => {
  const role = await Role.findByPk(roleId, { transaction });
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  return role;
};

export const getUserRoleAssignments = async (userId, transaction) => {
  const [rows] = await sequelize.query(
    `
    SELECT
      ur.user_id,
      ur.role_id,
      ur.assigned_at,
      r.name AS role_name,
      r.description AS role_description
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = :user_id
    ORDER BY ur.assigned_at ASC, ur.role_id ASC
    `,
    {
      replacements: { user_id: userId },
      transaction,
    }
  );

  return rows.map((row) => ({
    user_id: row.user_id,
    role_id: Number(row.role_id),
    assigned_at: row.assigned_at,
    role_name: normalizeRoleName(row.role_name),
    role: {
      id: Number(row.role_id),
      name: normalizeRoleName(row.role_name),
      description: row.role_description,
    },
  }));
};

export const getUserSingleRole = async (userId, transaction) => {
  const assignments = await getUserRoleAssignments(userId, transaction);
  if (assignments.length === 0) {
    return null;
  }

  return assignments[0];
};

export const countUsersByRoleName = async (roleName, { excludeUserId = null, transaction } = {}) => {
  const normalizedRoleName = normalizeRoleName(roleName);

  const [rows] = await sequelize.query(
    `
    SELECT COUNT(DISTINCT ur.user_id)::INT AS count
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE lower(r.name) = :role_name
      AND (:exclude_user_id::uuid IS NULL OR ur.user_id <> :exclude_user_id::uuid)
    `,
    {
      replacements: {
        role_name: normalizedRoleName,
        exclude_user_id: excludeUserId,
      },
      transaction,
    }
  );

  return Number(rows?.[0]?.count || 0);
};

export const ensureRoleAllowedForUser = (roleName) => {
  const normalizedRoleName = normalizeRoleName(roleName);
  if (!OPERATIONAL_ROLE_NAMES.includes(normalizedRoleName)) {
    throw new AppError(`Only these roles are allowed for users: ${OPERATIONAL_ROLE_NAMES.join(", ")}`, 400);
  }
  return normalizedRoleName;
};

export const assertRoleTransitionAllowed = async ({ currentRoleName = null, nextRoleName, userId = null, transaction }) => {
  const current = currentRoleName ? normalizeRoleName(currentRoleName) : null;
  const next = ensureRoleAllowedForUser(nextRoleName);

  if (current === next) {
    return next;
  }

  if (current === UNIQUE_ADMIN_ROLE && next !== UNIQUE_ADMIN_ROLE) {
    throw new AppError("The unique admin cannot be changed to another role", 403);
  }

  if ((current === "student" || current === "teacher") && next === UNIQUE_ADMIN_ROLE) {
    throw new AppError("Student or teacher accounts cannot be promoted to admin", 403);
  }

  if (next === UNIQUE_ADMIN_ROLE) {
    const otherAdminsCount = await countUsersByRoleName(UNIQUE_ADMIN_ROLE, {
      excludeUserId: current === UNIQUE_ADMIN_ROLE ? userId : null,
      transaction,
    });

    if (otherAdminsCount > 0) {
      throw new AppError("Only one admin account can exist in this project", 409);
    }
  }

  return next;
};

export const setUserSingleRole = async ({ userId, roleId, transaction }) => {
  const targetRole = await getRoleByIdStrict(roleId, transaction);
  const targetRoleName = ensureRoleAllowedForUser(targetRole.name);
  const currentAssignments = await getUserRoleAssignments(userId, transaction);
  const currentRoleName = currentAssignments[0]?.role_name || null;

  await assertRoleTransitionAllowed({
    currentRoleName,
    nextRoleName: targetRoleName,
    userId,
    transaction,
  });

  if (currentAssignments.length === 1 && Number(currentAssignments[0].role_id) === Number(roleId)) {
    return {
      message: "User role unchanged",
      role_id: Number(roleId),
      role_name: targetRoleName,
    };
  }

  await UserRole.destroy({
    where: { user_id: userId },
    transaction,
  });

  await UserRole.create(
    {
      user_id: userId,
      role_id: roleId,
      assigned_at: new Date(),
    },
    { transaction }
  );

  return {
    message: "User role updated successfully",
    role_id: Number(roleId),
    role_name: targetRoleName,
  };
};

export const assertCanCreateUserWithRole = async (roleName, transaction) => {
  const normalizedRoleName = ensureRoleAllowedForUser(roleName);
  await assertRoleTransitionAllowed({ currentRoleName: null, nextRoleName: normalizedRoleName, transaction });
  return normalizedRoleName;
};

export const assertCanDeleteUser = async (userId, transaction) => {
  const currentRole = await getUserSingleRole(userId, transaction);
  if (normalizeRoleName(currentRole?.role_name) === UNIQUE_ADMIN_ROLE) {
    const adminsCount = await countUsersByRoleName(UNIQUE_ADMIN_ROLE, { transaction });
    if (adminsCount <= 1) {
      throw new AppError("The unique admin cannot be deleted", 403);
    }
  }
};

export const assertCanChangeUserActiveState = async (userId, nextIsActive, transaction) => {
  const currentRole = await getUserSingleRole(userId, transaction);
  if (normalizeRoleName(currentRole?.role_name) === UNIQUE_ADMIN_ROLE && nextIsActive === false) {
    const adminsCount = await countUsersByRoleName(UNIQUE_ADMIN_ROLE, { transaction });
    if (adminsCount <= 1) {
      throw new AppError("The unique admin cannot be deactivated", 403);
    }
  }
};
