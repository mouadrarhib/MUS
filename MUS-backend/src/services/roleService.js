import { Role, User, UserRole, sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";
import { SQL } from "../snippets/index.js";

export const createRole = async ({ name, description }) => {
  if (!name) {
    throw new AppError("Role name is required", 400);
  }

  try {
    const [rows] = await sequelize.query(SQL.ROLE.CREATE, {
      replacements: { name, description },
    });
    return rows[0];
  } catch (error) {
    if (error.original?.code === "23505") {
      throw new AppError("Role name already exists", 409);
    }
    if (error.original?.code === "42883") {
      // fallback
    } else {
      throw error;
    }
  }

  const [role, created] = await Role.findOrCreate({
    where: { name },
    defaults: { description },
  });

  if (!created) {
    throw new AppError("Role name already exists", 409);
  }

  return role.get({ plain: true });
};

export const getRoleById = async (id) => {
  try {
    const [rows] = await sequelize.query(SQL.ROLE.GET_BY_ID, {
      replacements: { id },
    });
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  return role.get({ plain: true });
};

export const getAllRoles = async () => {
    try {
        const [rows] = await sequelize.query(SQL.ROLE.GET_ALL);
        return rows;
    } catch (error) {
        if (error.original?.code !== "42883") {
            throw error;
        }
    }
    return Role.findAll({ order: [["name", "ASC"]] });
};

export const updateRoleById = async (id, { name, description }) => {
  try {
    const [rows] = await sequelize.query(SQL.ROLE.UPDATE, {
      replacements: { id, name, description },
    });
    if (rows.length > 0) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (name) {
    role.name = name;
  }
  if (description) {
    role.description = description;
  }

  await role.save();
  return role.get({ plain: true });
};

export const deleteRoleById = async (id) => {
  try {
    await sequelize.query(SQL.ROLE.DELETE, {
      replacements: { id },
    });
    return { message: "Role deleted successfully" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  await role.destroy();
  return { message: "Role deleted successfully" };
};

export const assignRoleToUser = async (userId, roleId) => {
    try {
        const [rows] = await sequelize.query(SQL.ROLE.ASSIGN_TO_USER, {
            replacements: { user_id: userId, role_id: roleId },
        });
        return rows[0];
    } catch (error) {
        if (error.original?.code !== "42883") {
            throw error;
        }
    }

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

export const removeRoleFromUser = async (userId, roleId) => {
    try {
        await sequelize.query(SQL.ROLE.REMOVE_FROM_USER, {
            replacements: { user_id: userId, role_id: roleId },
        });
        return { message: "Role removed from user successfully" };
    } catch (error) {
        if (error.original?.code !== "42883") {
            throw error;
        }
    }

    const userRole = await UserRole.findOne({
        where: { user_id: userId, role_id: roleId },
    });

    if (!userRole) {
        throw new AppError("User does not have this role", 404);
    }

    await userRole.destroy();
    return { message: "Role removed from user successfully" };
};

export const getUserRoles = async (userId) => {
    try {
        const [rows] = await sequelize.query(SQL.ROLE.GET_USER_ROLES, {
            replacements: { user_id: userId },
        });
        return rows;
    } catch (error) {
        if (error.original?.code !== "42883") {
            throw error;
        }
    }
    
    const user = await User.findByPk(userId, {
        include: [{ model: Role, through: { attributes: [] } }],
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return user.Roles;
};
