import { OAuth2Client } from "google-auth-library";
import AppError from "../helpers/appError.js";
import { User, Role, UserRole, sequelize } from "../models/index.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { SQL } from "../snippets/index.js";
import crypto from "crypto";
import { getCurrentMembershipForUser } from "./membershipService.js";
import { normalizeTagIds, setUserTagPreferences } from "./personalizationService.js";
import { getUserSettingsByUserId } from "./userSettingsService.js";
import {
  buildObjectKey,
  deleteObject,
  getDownloadUrl,
  getPublicObjectUrl,
  isR2Configured,
  putObjectBuffer,
} from "./storage/r2Service.js";
import {
  assertCanChangeUserActiveState,
  assertCanCreateUserWithRole,
  assertCanDeleteUser,
  getRoleByNameStrict,
  getUserSingleRole,
  normalizeRoleName,
  setUserSingleRole,
} from "./userRolePolicyService.js";

const DEFAULT_ROLE = "student";
const DEFAULT_STUDENT_CONTRIBUTION_MODE = "contributor";
const DEFAULT_USER_SETTINGS = {
  theme_mode: "light",
  font_size: "medium",
  language: "en",
  timezone: "Africa/Casablanca",
  date_format: "DD/MM/YYYY",
  email_notifications: true,
  push_notifications: true,
  resource_alerts: true,
  weekly_digest: false,
  show_activity_status: true,
  show_profile: true,
  two_factor_enabled: false,
};

const normalizeContributionMode = (rawMode) => {
  const normalized = String(rawMode || "").trim().toLowerCase();
  if (!normalized) return DEFAULT_STUDENT_CONTRIBUTION_MODE;
  if (normalized === "learner" || normalized === "contributor") {
    return normalized;
  }
  throw new AppError("contribution_mode must be learner or contributor", 400);
};

const sanitizeUser = (userInstance) => {
  if (!userInstance) return null;
  const data =
    typeof userInstance.get === "function"
      ? userInstance.get({ plain: true })
      : { ...userInstance };
  const { password_hash, ...rest } = data;
  return rest;
};

const withMembership = async (userLike) => {
  if (!userLike?.id) return userLike;

  try {
    const membership = await getCurrentMembershipForUser(userLike.id);
    return { ...userLike, membership };
  } catch {
    return {
      ...userLike,
      membership: {
        plan_code: "free",
        plan_name: "Free",
        status: "active",
        is_premium: false,
        starts_at: null,
        ends_at: null,
      },
    };
  }
};

const getStudentContributionMode = async (userId, transaction) => {
  const [rows] = await sequelize.query(
    `
    SELECT contribution_mode
    FROM public.student_profiles
    WHERE user_id = :user_id
    LIMIT 1
    `,
    {
      replacements: { user_id: userId },
      transaction,
    }
  );

  if (!rows?.length) return DEFAULT_STUDENT_CONTRIBUTION_MODE;
  return normalizeContributionMode(rows[0]?.contribution_mode);
};

const buildAuthUserPayload = async (userLike, roles, transaction) => {
  const normalizedUser = await withMembership(sanitizeUser(userLike));
  const isStudent = roles.includes("student");
  const contributionMode = isStudent
    ? await getStudentContributionMode(normalizedUser.id, transaction)
    : null;

  let resolvedAvatarUrl = normalizedUser?.avatar_url || null;
  if (!resolvedAvatarUrl && normalizedUser?.avatar_object_key) {
    resolvedAvatarUrl = getPublicObjectUrl(normalizedUser.avatar_object_key);

    if (!resolvedAvatarUrl && isR2Configured()) {
      try {
        const { downloadUrl } = await getDownloadUrl({
          objectKey: normalizedUser.avatar_object_key,
          forceDownload: false,
        });
        resolvedAvatarUrl = downloadUrl || null;
      } catch {
        resolvedAvatarUrl = null;
      }
    }
  }

  let settings = { ...DEFAULT_USER_SETTINGS };
  try {
    const loadedSettings = await getUserSettingsByUserId(normalizedUser.id);
    if (loadedSettings && typeof loadedSettings === "object") {
      settings = {
        ...DEFAULT_USER_SETTINGS,
        ...loadedSettings,
      };
    }
  } catch {
    settings = { ...DEFAULT_USER_SETTINGS };
  }

  return {
    ...normalizedUser,
    avatar_url: resolvedAvatarUrl,
    settings,
    roles,
    role: roles[0] || null,
    contribution_mode: contributionMode,
    can_contribute: isStudent ? contributionMode === "contributor" : true,
  };
};

const getRolesForUser = async (userId, transaction) => {
  const assignment = await getUserSingleRole(userId, transaction);
  if (!assignment?.role_name) {
    throw new AppError("User has no assigned role", 409);
  }

  return [normalizeRoleName(assignment.role_name)];
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

const ensureAssignableRole = async (roleName, transaction) => {
  const normalizedRoleName = await assertCanCreateUserWithRole(roleName, transaction);
  return getRoleByNameStrict(normalizedRoleName, transaction);
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
  return routineUser
    ? {
      ...routineUser,
      password_hash: fullUser.password_hash,
      avatar_url: fullUser.avatar_url || null,
      avatar_object_key: fullUser.avatar_object_key || null,
      avatar_mime_type: fullUser.avatar_mime_type || null,
      avatar_size_bytes: fullUser.avatar_size_bytes || null,
      avatar_updated_at: fullUser.avatar_updated_at || null,
    }
    : fullUser;
};

const getUserById = async (id, transaction) => {
  const fullUserInstance = await User.findByPk(id, { transaction, rejectOnEmpty: false });
  const fullUser = fullUserInstance ? fullUserInstance.get({ plain: true }) : null;

  try {
    const [rows] = await sequelize.query(SQL.USER.GET_BY_ID, {
      replacements: { id },
      transaction,
    });
    if (rows?.length) {
      return {
        ...rows[0],
        avatar_url: fullUser?.avatar_url || null,
        avatar_object_key: fullUser?.avatar_object_key || null,
        avatar_mime_type: fullUser?.avatar_mime_type || null,
        avatar_size_bytes: fullUser?.avatar_size_bytes || null,
        avatar_updated_at: fullUser?.avatar_updated_at || null,
      };
    }
  } catch (error) {
    if (error.original?.code !== "42883") {
      throw error;
    }
  }

  return fullUser;
};

export const registerUser = async ({
  full_name,
  email,
  password,
  institution_id: rawInstitutionId,
  program_id: rawProgramId,
  level_id: rawLevelId,
  current_semester_id: rawSemesterId,
  contribution_mode: rawContributionMode,
  preferred_tag_ids: rawPreferredTagIds,
  role_name: rawRoleName,
  allow_direct_role = false,
  include_token = true,
}) => {
  const hasAnyAcademicField = [rawInstitutionId, rawProgramId, rawLevelId, rawSemesterId].some(
    (value) => value !== undefined && value !== null && String(value).trim() !== ""
  );

  const institution_id = rawInstitutionId != null ? Number(rawInstitutionId) : null;
  const program_id = rawProgramId != null ? Number(rawProgramId) : null;
  const level_id = rawLevelId != null ? Number(rawLevelId) : null;
  const current_semester_id = rawSemesterId != null ? Number(rawSemesterId) : null;
  const preferredTagIds = normalizeTagIds(rawPreferredTagIds || []);
  const contributionMode = normalizeContributionMode(rawContributionMode);
  const requestedRoleName = normalizeRoleName(rawRoleName || DEFAULT_ROLE);
  const desiredRoleName = allow_direct_role ? requestedRoleName : DEFAULT_ROLE;

  const shouldCreateStudentProfile = hasAnyAcademicField;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (
    shouldCreateStudentProfile &&
    (![institution_id, program_id, level_id, current_semester_id].every((value) => Number.isInteger(value) && value > 0))
  ) {
    throw new AppError(
      "Institution, program, level, and semester are required for student registration",
      400
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  let routineUser = null;
  try {
    const [rows] = await sequelize.query(
      shouldCreateStudentProfile ? SQL.USER.REGISTER_STUDENT : SQL.USER.REGISTER,
      {
        replacements: shouldCreateStudentProfile
          ? {
              full_name,
              email,
              password,
              institution_id,
              program_id,
              level_id,
              current_semester_id,
              contribution_mode: contributionMode,
            }
          : { full_name, email, password },
      }
    );
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
    const validateAcademicSelection = async () => {
      const [[institutionExists]] = await sequelize.query(
        "SELECT EXISTS (SELECT 1 FROM public.institutions WHERE id = :institution_id) AS exists",
        { replacements: { institution_id }, transaction }
      );
      if (!institutionExists?.exists) {
        throw new AppError("Institution not found", 400);
      }

      const [[programExists]] = await sequelize.query(
        "SELECT EXISTS (SELECT 1 FROM public.programs WHERE id = :program_id) AS exists",
        { replacements: { program_id }, transaction }
      );
      if (!programExists?.exists) {
        throw new AppError("Program not found", 400);
      }

      const [[mappingExists]] = await sequelize.query(
        "SELECT EXISTS (SELECT 1 FROM public.institution_programs WHERE institution_id = :institution_id AND program_id = :program_id) AS exists",
        { replacements: { institution_id, program_id }, transaction }
      );
      if (!mappingExists?.exists) {
        throw new AppError("Program is not available for selected institution", 400);
      }

      const [[levelMatchesProgram]] = await sequelize.query(
        "SELECT EXISTS (SELECT 1 FROM public.levels WHERE id = :level_id AND program_id = :program_id) AS exists",
        { replacements: { level_id, program_id }, transaction }
      );
      if (!levelMatchesProgram?.exists) {
        throw new AppError("Level does not belong to selected program", 400);
      }

      const [[semesterMatchesLevel]] = await sequelize.query(
        "SELECT EXISTS (SELECT 1 FROM public.semesters WHERE id = :current_semester_id AND level_id = :level_id) AS exists",
        { replacements: { current_semester_id, level_id }, transaction }
      );
      if (!semesterMatchesLevel?.exists) {
        throw new AppError("Semester does not belong to selected level", 400);
      }
    };

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

      if (shouldCreateStudentProfile) {
        await validateAcademicSelection();
        await sequelize.query(SQL.STUDENT_PROFILE.CREATE, {
          replacements: {
            user_id: userInstance.id,
            institution_id,
            program_id,
            current_semester_id,
            contribution_mode: contributionMode,
          },
          transaction,
        });
      }
    }

    const roleToAssign = desiredRoleName === DEFAULT_ROLE
      ? await ensureStudentRole(transaction)
      : await ensureAssignableRole(desiredRoleName, transaction);

    await setUserSingleRole({
      userId: userInstance.id,
      roleId: roleToAssign.id,
      transaction,
    });

    return routineUser || userInstance.get({ plain: true });
  });

  if (preferredTagIds.length > 0) {
    try {
      await setUserTagPreferences(createdUser.id, preferredTagIds);
    } catch (error) {
      if (!["42883", "42P01"].includes(error?.original?.code)) {
        throw error;
      }

      // Preferences table/procedure may be unavailable before migration is applied.
    }
  }

  const roles = await getRolesForUser(createdUser.id);
  const token = include_token ? generateToken({ sub: createdUser.id, roles }) : null;
  return {
    user: await buildAuthUserPayload(createdUser, roles),
    token,
  };
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

  if (user?.id) {
    const fullUser = await getUserById(user.id);
    if (fullUser) {
      user = { ...user, ...fullUser };
    }
  }

  if (user.is_active === false) {
    throw new AppError("Account is disabled", 403);
  }

  const roles = await getRolesForUser(user.id);
  const token = generateToken({ sub: user.id, roles, authVia: usedRoutine ? "routine" : "fallback" });

  return {
    user: await buildAuthUserPayload(user, roles),
    token,
  };
};

export const getProfile = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const roles = await getRolesForUser(user.id);
  return { user: await buildAuthUserPayload(user, roles) };
};

export const getUserWithRolesById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const roles = await getRolesForUser(user.id);
  return { user: await buildAuthUserPayload(user, roles) };
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
  return { user: await buildAuthUserPayload(updatedUser, roles) };
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

  if (typeof updatedUser?.avatar_url === "undefined") {
    const fullUser = await User.findByPk(updatedUser.id, { rejectOnEmpty: false });
    if (fullUser) {
      const merged = fullUser.get({ plain: true });
      updatedUser = { ...updatedUser, ...merged, password_hash: updatedUser.password_hash || merged.password_hash };
    }
  }

  const roles = await getRolesForUser(updatedUser.id);
  return { user: await buildAuthUserPayload(updatedUser, roles) };
};

export const uploadUserAvatar = async ({ userId, fileBuffer, originalName, mimeType }) => {
  if (!isR2Configured()) {
    throw new AppError("R2 storage is not configured", 500);
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const objectKey = buildObjectKey({
    userId,
    filename: originalName || "avatar.jpg",
    prefix: `users/${userId}/avatar`,
  });

  await putObjectBuffer({
    objectKey,
    body: fileBuffer,
    mimeType: mimeType || "image/jpeg",
  });

  const publicUrl = getPublicObjectUrl(objectKey);

  if (user.avatar_object_key && user.avatar_object_key !== objectKey) {
    try {
      await deleteObject(user.avatar_object_key);
    } catch {
      // best effort cleanup
    }
  }

  await User.update(
    {
      avatar_url: publicUrl || null,
      avatar_object_key: objectKey,
      avatar_mime_type: mimeType || null,
      avatar_size_bytes: Buffer.isBuffer(fileBuffer) ? fileBuffer.length : null,
      avatar_updated_at: new Date(),
    },
    { where: { id: userId } }
  );

  return getProfile(userId);
};

export const removeUserAvatar = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.avatar_object_key) {
    try {
      await deleteObject(user.avatar_object_key);
    } catch {
      // best effort cleanup
    }
  }

  await User.update(
    {
      avatar_url: null,
      avatar_object_key: null,
      avatar_mime_type: null,
      avatar_size_bytes: null,
      avatar_updated_at: null,
    },
    { where: { id: userId } }
  );

  return getProfile(userId);
};

export const setActive = async (userId, isActive) => {
  await assertCanChangeUserActiveState(userId, Boolean(isActive));

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
  await assertCanDeleteUser(userId);

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

export const createUserByAdmin = async (payload) => {
  const result = await registerUser({
    ...payload,
    allow_direct_role: true,
    include_token: false,
  });

  return { user: result.user };
};

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

export const loginOrRegisterWithGoogle = async (accessToken) => {
  if (!accessToken) {
    throw new AppError("Google access token is required", 400);
  }

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) {
    throw new AppError("Invalid Google access token", 401);
  }

  const { sub: googleId, email, name: fullName, picture: googlePicture } = await userInfoRes.json();

  if (!email) {
    throw new AppError("Google account has no email", 400);
  }

  return sequelize.transaction(async (transaction) => {
    // 1. Find by google_id
    let userInstance = await User.findOne({ where: { google_id: googleId }, transaction });
    if (userInstance && !userInstance.avatar_url && googlePicture) {
      await userInstance.update({ avatar_url: googlePicture }, { transaction });
    }

    // 2. Find by email and link google_id + backfill avatar if missing
    if (!userInstance) {
      userInstance = await User.findOne({ where: { email }, transaction });
      if (userInstance) {
        const updates = { google_id: googleId };
        if (!userInstance.avatar_url && googlePicture) {
          updates.avatar_url = googlePicture;
        }
        await userInstance.update(updates, { transaction });
      }
    }

    // 3. Create new user
    if (!userInstance) {
      userInstance = await User.create(
        { full_name: fullName, email, google_id: googleId, password_hash: null, avatar_url: googlePicture || null },
        { transaction }
      );

      const role = await ensureStudentRole(transaction);
      await UserRole.create(
        { user_id: userInstance.id, role_id: role.id },
        { transaction }
      );

      await sequelize.query(
        `INSERT INTO public.student_profiles (user_id, contribution_mode)
         VALUES (:user_id, :contribution_mode)
         ON CONFLICT (user_id) DO NOTHING`,
        {
          replacements: { user_id: userInstance.id, contribution_mode: DEFAULT_STUDENT_CONTRIBUTION_MODE },
          transaction,
        }
      );
    }

    const roles = await getRolesForUser(userInstance.id, transaction);
    const userPayload = await buildAuthUserPayload(userInstance, roles, transaction);
    const token = generateToken({ sub: userInstance.id, roles });

    return { token, user: userPayload };
  });
};
