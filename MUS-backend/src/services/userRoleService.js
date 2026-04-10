import { User, Role, UserRole, sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";
import {
  getRoleByIdStrict,
  getUserRoleAssignments,
  setUserSingleRole,
  assertCanDeleteUser,
  assertRoleTransitionAllowed,
  normalizeRoleName,
} from "./userRolePolicyService.js";

/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId, roleId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await getRoleByIdStrict(roleId);

  return sequelize.transaction(async (transaction) => {
    const result = await setUserSingleRole({ userId, roleId, transaction });
    return { ...result, message: "User role set successfully" };
  });
};

/**
 * Get roles of a user
 */
export const getUserRoles = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const assignments = await getUserRoleAssignments(userId);
  return assignments.map((assignment) => assignment.role);
};

/**
 * Update user role (replace role)
 */
export const updateUserRole = async (userId, oldRoleId, newRoleId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sequelize.transaction(async (transaction) => {
    const assignments = await getUserRoleAssignments(userId, transaction);
    const currentAssignment = assignments[0] || null;

    if (!currentAssignment) {
      throw new AppError("User does not have a role assigned", 404);
    }

    if (Number(currentAssignment.role_id) !== Number(oldRoleId)) {
      throw new AppError("User does not have this role", 409);
    }

    const nextRole = await getRoleByIdStrict(newRoleId, transaction);
    await assertRoleTransitionAllowed({
      currentRoleName: currentAssignment.role_name,
      nextRoleName: nextRole.name,
      userId,
      transaction,
    });

    const result = await setUserSingleRole({ userId, roleId: newRoleId, transaction });
    return { ...result, message: "User role updated successfully" };
  });
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId, roleId) => {
  return sequelize.transaction(async (transaction) => {
    const assignments = await getUserRoleAssignments(userId, transaction);
    const matchingAssignment = assignments.find((assignment) => Number(assignment.role_id) === Number(roleId));

    if (!matchingAssignment) {
      throw new AppError("User does not have this role", 404);
    }

    if (assignments.length <= 1) {
      throw new AppError("A user must always keep exactly one role", 400);
    }

    if (normalizeRoleName(matchingAssignment.role_name) === "admin") {
      throw new AppError("The unique admin role cannot be removed", 403);
    }

    await UserRole.destroy({
      where: { user_id: userId, role_id: roleId },
      transaction,
    });

    return { message: "Role removed from user successfully" };
  });
};
