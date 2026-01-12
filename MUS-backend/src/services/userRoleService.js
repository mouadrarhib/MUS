import { User, Role, UserRole, sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";

/**
 * Assign role to user
 */
export const assignRoleToUser = async (userId, roleId) => {
  try {
    await sequelize.query(SQL.USER_ROLE.ASSIGN, {
      replacements: { user_id: userId, role_id: roleId },
    });

    return { message: "Role assigned to user successfully" };
  } catch (error) {
    // Procedure not found → fallback
    if (error.original?.code !== "42883") {
      // Unique violation (already assigned)
      if (error.original?.code === "23505") {
        throw new AppError("Role already assigned to user", 409);
      }
      throw error;
    }
  }

  // ---------- Fallback (Sequelize) ----------
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  await UserRole.findOrCreate({
    where: { user_id: userId, role_id: roleId },
  });

  return { message: "Role assigned to user successfully" };
};

/**
 * Get roles of a user
 */
export const getUserRoles = async (userId) => {
  try {
    const [rows] = await sequelize.query(SQL.USER_ROLE.GET_BY_USER, {
      replacements: { user_id: userId },
    });
    return rows;
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  // ---------- Fallback ----------
  const user = await User.findByPk(userId, {
    include: [{ model: Role, through: { attributes: [] } }],
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user.Roles;
};

/**
 * Update user role (replace role)
 */
export const updateUserRole = async (userId, oldRoleId, newRoleId) => {
  try {
    await sequelize.query(SQL.USER_ROLE.UPDATE, {
      replacements: {
        user_id: userId,
        old_role_id: oldRoleId,
        new_role_id: newRoleId,
      },
    });

    return { message: "User role updated successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  // ---------- Fallback ----------
  const userRole = await UserRole.findOne({
    where: { user_id: userId, role_id: oldRoleId },
  });

  if (!userRole) {
    throw new AppError("User does not have this role", 404);
  }

  const newRole = await Role.findByPk(newRoleId);
  if (!newRole) {
    throw new AppError("New role not found", 404);
  }

  userRole.role_id = newRoleId;
  await userRole.save();

  return { message: "User role updated successfully" };
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId, roleId) => {
  try {
    await sequelize.query(SQL.USER_ROLE.REMOVE, {
      replacements: { user_id: userId, role_id: roleId },
    });

    return { message: "Role removed from user successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  // ---------- Fallback ----------
  const userRole = await UserRole.findOne({
    where: { user_id: userId, role_id: roleId },
  });

  if (!userRole) {
    throw new AppError("User does not have this role", 404);
  }

  await userRole.destroy();

  return { message: "Role removed from user successfully" };
};
