import AppError from "../helpers/appError.js";
import { User, Role, UserRole, sequelize } from "../models/index.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { SQL } from "../snippets/index.js";
import crypto from "crypto";

const DEFAULT_ROLE = "student";

const sanitizeUser = (userInstance) => {
  if (!userInstance) return null;
  const data =
    typeof userInstance.get === "function"
      ? userInstance.get({ plain: true })
      : { ...userInstance };
  const { password_hash, ...rest } = data;
  return rest;
};

const getRolesForUser = async (userId, transaction) => {
  const roles = await Role.findAll({
    include: [
      {
        model: User,
        where: { id: userId },
        attributes: [],
        through: { attributes: [] },
      },
    ],
    attributes: ["name"],
    transaction,
  });
  return roles.map((role) => role.name);
};

const ensureStudentRole = async (transaction) => {
  const [role] = await Role.findOrCreate({
    where: { name: "student" },
    defaults: { 
      name: "student",
      description: "Student user with access to create and share educational resources" 
    },
    transaction,
  });
  return role;
};

const getUserByEmail = async (email, transaction) => {
  let routineUser = null;
  try {
    const [rows] = await sequelize.query(SQL.USER.GET_BY_EMAIL, {
      replacements: { email },
      transaction,
    });
    if (rows?.length) {
      routineUser = rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  // Always fetch full record to include password_hash for comparisons.
  const user =
    (routineUser?.id &&
      (await User.findByPk(routineUser.id, { transaction, rejectOnEmpty: false }))) ||
    (await User.findOne({ where: { email }, transaction }));

  if (!user) return null;
  const fullUser = user.get({ plain: true });
  return routineUser ? { ...routineUser, password_hash: fullUser.password_hash } : fullUser;
};

const getUserById = async (id, transaction) => {
  try {
    const [rows] = await sequelize.query(SQL.USER.GET_BY_ID, {
      replacements: { id },
      transaction,
    });
    if (rows?.length) {
      return rows[0];
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const user = await User.findByPk(id, { transaction });
  return user ? user.get({ plain: true }) : null;
};

export const registerUser = async ({ full_name, email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  let routineUser = null;
  try {
    const [rows] = await sequelize.query(SQL.USER.REGISTER, {
      replacements: { full_name, email, password },
    });
    routineUser = rows?.[0] || null;
  } catch (error) {
    if (error.original?.code === "23505") {
      throw new AppError("Email already registered", 409);
    }
    if (error.original?.code === "42883") {
      routineUser = null; // routine missing; fall back
    } else {
      throw error;
    }
  }

  const createdUser = await sequelize.transaction(async (transaction) => {
    let userInstance =
      (routineUser &&
        (await User.findByPk(routineUser.id, {
          transaction,
          rejectOnEmpty: false,
        }))) ||
      null;

    if (!userInstance) {
      userInstance = await User.create(
        { full_name, email, password_hash: await hashPassword(password) },
        { transaction }
      );
    }

    const studentRole = await ensureStudentRole(transaction);
    await UserRole.findOrCreate({
      where: { user_id: userInstance.id, role_id: studentRole.id },
      defaults: { assigned_at: new Date() },
      transaction,
    });

    return routineUser || userInstance.get({ plain: true });
  });

  const roles = await getRolesForUser(createdUser.id);
  const token = generateToken({ sub: createdUser.id, roles });

  return { user: sanitizeUser(createdUser), token };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  let user = null;
  let usedRoutine = false;

  try {
    const [rows] = await sequelize.query(SQL.USER.LOGIN, {
      replacements: { email, password },
    });
    if (rows?.length) {
      user = rows[0];
      usedRoutine = true;
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  if (!user) {
    user = await getUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError("Invalid credentials", 401);
    }
  }

  if (user.is_active === false) {
    throw new AppError("Account is disabled", 403);
  }

  const roles = await getRolesForUser(user.id);
  const token = generateToken({ sub: user.id, roles, authVia: usedRoutine ? "routine" : "fallback" });

  return { user: sanitizeUser(user), token };
};

export const getProfile = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const roles = await getRolesForUser(user.id);
  return { user: { ...sanitizeUser(user), roles } };
};

export const getUserWithRolesById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const roles = await getRolesForUser(user.id);
  return { user: { ...sanitizeUser(user), roles } };
};

export const changeEmail = async (userId, newEmail) => {
  if (!newEmail) throw new AppError("New email is required", 400);

  let updatedUser = null;
  try {
    const [rows] = await sequelize.query(SQL.USER.CHANGE_EMAIL, {
      replacements: { id: userId, new_email: newEmail },
    });
    updatedUser = rows?.[0];
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  if (!updatedUser) {
    const normalizedEmail = newEmail.trim().toLowerCase();
    const emailTaken = await User.findOne({ where: { email: normalizedEmail } });
    if (emailTaken) {
      throw new AppError("Email already in use", 409);
    }
    const [count, rows] = await User.update(
      { email: normalizedEmail },
      { where: { id: userId }, returning: true }
    );
    if (count === 0) {
      throw new AppError("User not found", 404);
    }
    updatedUser = rows?.[0]?.get({ plain: true });
  }

  const roles = await getRolesForUser(updatedUser.id);
  return { user: { ...sanitizeUser(updatedUser), roles } };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  if (!newPassword || newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters", 400);
  }

  try {
    await sequelize.query(SQL.USER.CHANGE_PASSWORD, {
      replacements: { id: userId, old_password: oldPassword, new_password: newPassword },
    });
    return { message: "Password updated" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found", 404);

  const matches = await comparePassword(oldPassword, user.password_hash);
  if (!matches) throw new AppError("Old password is incorrect", 400);

  const password_hash = await hashPassword(newPassword);
  await User.update({ password_hash }, { where: { id: userId } });
  return { message: "Password updated" };
};

export const resetPassword = async (userId, newPassword) => {
  if (!newPassword || newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters", 400);
  }

  try {
    await sequelize.query(SQL.USER.RESET_PASSWORD, {
      replacements: { id: userId, new_password: newPassword },
    });
    return { message: "Password reset" };
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found", 404);

  const password_hash = await hashPassword(newPassword);
  await User.update({ password_hash }, { where: { id: userId } });
  return { message: "Password reset" };
};

/**
 * Check if email exists in the database (public endpoint)
 */
export const checkEmailExists = async (email) => {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await getUserByEmail(email);
  return { exists: !!user, email };
};

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const requestPasswordReset = async (email, context = {}) => {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await getUserByEmail(email);
  if (!user || user.is_active === false) {
    return { requested: true };
  }

  const token = crypto.randomUUID();
  const tokenHash = hashResetToken(token);

  await sequelize.query(
    `
    INSERT INTO public.password_reset_tokens (user_id, token_hash, expires_at, created_ip)
    VALUES (:user_id, :token_hash, NOW() + INTERVAL '1 hour', :created_ip)
    `,
    {
      replacements: {
        user_id: user.id,
        token_hash: tokenHash,
        created_ip: context.ip || null,
      },
    }
  );

  const payload = {
    requested: true,
    expires_in_minutes: 60,
  };

  if (process.env.NODE_ENV !== "production") {
    payload.reset_token = token;
  }

  return payload;
};

export const resetPasswordWithToken = async (token, newPassword) => {
  if (!token) {
    throw new AppError("Reset token is required", 400);
  }

  if (!newPassword || newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters", 400);
  }

  const tokenHash = hashResetToken(token);
  const [rows] = await sequelize.query(
    `
    SELECT id, user_id
    FROM public.password_reset_tokens
    WHERE token_hash = :token_hash
      AND used_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
    `,
    {
      replacements: { token_hash: tokenHash },
    }
  );

  if (!rows?.length) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const resetToken = rows[0];
  await resetPassword(resetToken.user_id, newPassword);

  await sequelize.query(
    `
    UPDATE public.password_reset_tokens
    SET used_at = NOW()
    WHERE id = :id OR (user_id = :user_id AND used_at IS NULL)
    `,
    {
      replacements: { id: resetToken.id, user_id: resetToken.user_id },
    }
  );

  return { message: "Password reset" };
};

export const updateProfile = async (userId, full_name) => {
  if (typeof full_name === "undefined") throw new AppError("Full name is required", 400);

  let updatedUser = null;
  try {
    const [rows] = await sequelize.query(SQL.USER.UPDATE_PROFILE, {
      replacements: { id: userId, full_name },
    });
    updatedUser = rows?.[0];
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  if (!updatedUser) {
    const [count, rows] = await User.update(
      { full_name: full_name?.trim() || null },
      { where: { id: userId }, returning: true }
    );
    if (count === 0) throw new AppError("User not found", 404);
    updatedUser = rows?.[0]?.get({ plain: true });
  }

  const roles = await getRolesForUser(updatedUser.id);
  return { user: { ...sanitizeUser(updatedUser), roles } };
};

export const setActive = async (userId, isActive) => {
  try {
    await sequelize.query(SQL.USER.SET_ACTIVE, {
      replacements: { id: userId, is_active: isActive },
    });
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const [count] = await User.update({ is_active: !!isActive }, { where: { id: userId } });
  if (count === 0) throw new AppError("User not found", 404);

  return { message: "User status updated" };
};

export const deleteUser = async (userId) => {
  try {
    await sequelize.query(SQL.USER.DELETE, { replacements: { id: userId } });
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  const count = await User.destroy({ where: { id: userId } });
  if (count === 0) throw new AppError("User not found", 404);

  return { message: "User deleted" };
};

export const deleteUserById = async (userId) => deleteUser(userId);

export const updateUserById = async (userId, { email, full_name, is_active }) => {
  let updatedUser = null;

  if (email) {
    await changeEmail(userId, email);
  }

  if (typeof full_name !== "undefined") {
    await updateProfile(userId, full_name);
  }

  if (typeof is_active !== "undefined") {
    await setActive(userId, is_active);
  }

  updatedUser = (await getUserWithRolesById(userId)).user;
  return { user: updatedUser };
};
