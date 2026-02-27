import asyncHandler from "../helpers/asyncHandler.js";
import AppError from "../helpers/appError.js";
import { successResponse } from "../helpers/response.js";
import {
  changeEmail,
  changePassword,
  deleteUser,
  deleteUserById,
  getProfile,
  getUserWithRolesById,
  loginUser,
  registerUser,
  resetPassword,
  requestPasswordReset,
  resetPasswordWithToken,
  checkEmailExists,
  setActive,
  updateProfile,
  updateUserById,
} from "../services/authService.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 is_active:
 *                   type: boolean
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *             token:
 *               type: string
 *               description: JWT token
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     RegisterRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: StrongPass123!
 *         full_name:
 *           type: string
 *           example: Jane Doe
 *         institution_id:
 *           type: integer
 *           example: 3
 *         program_id:
 *           type: integer
 *           example: 12
 *         level_id:
 *           type: integer
 *           example: 21
 *         current_semester_id:
 *           type: integer
 *           example: 5
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: StrongPass123!
 *     ChangeEmailRequest:
 *       type: object
 *       required: [new_email]
 *       properties:
 *         new_email:
 *           type: string
 *           format: email
 *           example: new@example.com
 *     ChangePasswordRequest:
 *       type: object
 *       required: [old_password, new_password]
 *       properties:
 *         old_password:
 *           type: string
 *           example: OldPass123!
 *         new_password:
 *           type: string
 *           example: NewPass456!
 *     ResetPasswordRequest:
 *       type: object
 *       required: [new_password]
 *       properties:
 *         new_password:
 *           type: string
 *           example: NewPass456!
 *     UpdateProfileRequest:
 *       type: object
 *       required: [full_name]
 *       properties:
 *         full_name:
 *           type: string
 *           example: Jane Q. Public
 *     SetActiveRequest:
 *       type: object
 *       required: [is_active]
 *       properties:
 *         is_active:
 *           type: boolean
 *           example: true
 *     UpdateUserByIdRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: someone@example.com
 *         full_name:
 *           type: string
 *           example: Jane Admin
 *         is_active:
 *           type: boolean
 *           example: false
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Returns JWT in response body and sets httpOnly cookie `auth_token`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
export const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, institution_id, program_id, level_id, current_semester_id } = req.body;
  const result = await registerUser({
    full_name,
    email,
    password,
    institution_id,
    program_id,
    level_id,
    current_semester_id,
  });
  if (result?.token) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth_token", result.token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }
  return successResponse(res, "User registered successfully", result, 201);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     description: Returns JWT in response body and sets httpOnly cookie `auth_token`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  if (result?.token) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth_token", result.token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }
  return successResponse(res, "Login successful", result);
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
export const me = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  const result = await getProfile(req.user.id);
  return successResponse(res, "Authenticated user", result);
});

/**
 * @swagger
 * /auth/email:
 *   patch:
 *     summary: Change user email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeEmailRequest'
 *     responses:
 *       200:
 *         description: Email updated
 */
export const updateEmail = asyncHandler(async (req, res) => {
  const { new_email } = req.body;
  const result = await changeEmail(req.user.id, new_email);
  return successResponse(res, "Email updated", result);
});

/**
 * @swagger
 * /auth/password:
 *   patch:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { old_password, new_password } = req.body;
  const result = await changePassword(req.user.id, old_password, new_password);
  return successResponse(res, "Password updated", result);
});

/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     summary: Reset password with a new value (requires auth)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    const { token, new_password } = req.body;
    const result = await resetPasswordWithToken(token, new_password);
    return successResponse(res, "Password reset", result);
  }

  const { new_password } = req.body;
  const result = await resetPassword(req.user.id, new_password);
  return successResponse(res, "Password reset", result);
});

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Update profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { full_name } = req.body;
  const result = await updateProfile(req.user.id, full_name);
  return successResponse(res, "Profile updated", result);
});

/**
 * @swagger
 * /auth/active:
 *   patch:
 *     summary: Enable/disable user account
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetActiveRequest'
 *     responses:
 *       200:
 *         description: User status updated
 */
export const toggleActive = asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  const result = await setActive(req.user.id, is_active);
  return successResponse(res, "User status updated", result);
});

/**
 * @swagger
 * /auth/me:
 *   delete:
 *     summary: Delete current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 */
export const removeUser = asyncHandler(async (req, res) => {
  await deleteUser(req.user.id);
  res.clearCookie("auth_token");
  return successResponse(res, "User deleted", {}, 200);
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Clear auth cookie (logout)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  return successResponse(res, "Logged out");
});

/**
 * @swagger
 * /auth/user/{id}:
 *   get:
 *     summary: Get user by id (admin use)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getUserWithRolesById(id);
  return successResponse(res, "User fetched", result);
});

/**
 * @swagger
 * /auth/user/{id}:
 *   patch:
 *     summary: Update user by id (admin use)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserByIdRequest'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, full_name, is_active } = req.body;
  const result = await updateUserById(id, { email, full_name, is_active });
  return successResponse(res, "User updated", result);
});

/**
 * @swagger
 * /auth/user/{id}:
 *   delete:
 *     summary: Delete user by id (admin use)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 */
export const removeUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteUserById(id);
  return successResponse(res, "User deleted", {}, 200);
});

/**
 * @swagger
 * /auth/email/check:
 *   post:
 *     summary: Check if email exists (public endpoint)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                     email:
 *                       type: string
 */
export const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await checkEmailExists(email);
  return successResponse(res, "Email check completed", result);
});

/**
 * @swagger
 * /auth/password/forgot:
 *   post:
 *     summary: Request password reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset token request accepted
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await requestPasswordReset(email, { ip: req.ip });
  return successResponse(res, "If the email exists, a reset token has been generated", result);
});
