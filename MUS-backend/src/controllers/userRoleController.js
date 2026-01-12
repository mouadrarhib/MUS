import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  updateUserRole,
} from "../services/userRoleService.js";

/**
 * @swagger
 * tags:
 *   name: UserRoles
 *   description: User role management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRoleAssignRequest:
 *       type: object
 *       required: [userId, roleId]
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         roleId:
 *           type: integer
 *           example: 1
 *
 *     UserRoleUpdateRequest:
 *       type: object
 *       required: [oldRoleId, newRoleId]
 *       properties:
 *         oldRoleId:
 *           type: integer
 *           example: 1
 *         newRoleId:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /user-roles/assign:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRoleAssignRequest'
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
export const assignUserRole = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.body;
  const result = await assignRoleToUser(userId, roleId);
  return successResponse(res, "Role assigned successfully", result);
});

/**
 * @swagger
 * /user-roles/remove:
 *   post:
 *     summary: Remove a role from a user
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRoleAssignRequest'
 *     responses:
 *       200:
 *         description: Role removed successfully
 */
export const removeUserRole = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.body;
  const result = await removeRoleFromUser(userId, roleId);
  return successResponse(res, "Role removed successfully", result);
});

/**
 * @swagger
 * /user-roles/{userId}:
 *   get:
 *     summary: Get roles of a user
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
 */
export const listUserRoles = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getUserRoles(userId);
  return successResponse(res, "User roles retrieved successfully", result);
});

/**
 * @swagger
 * /user-roles/{userId}:
 *   patch:
 *     summary: Update a user role (replace role)
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRoleUpdateRequest'
 *     responses:
 *       200:
 *         description: User role updated successfully
 */
export const updateUserRoleController = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { oldRoleId, newRoleId } = req.body;

  const result = await updateUserRole(userId, oldRoleId, newRoleId);
  return successResponse(res, "User role updated successfully", result);
});
