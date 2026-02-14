import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createRole,
  getRoleById,
  getAllRoles,
  updateRoleById,
  deleteRoleById,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
} from "../services/roleService.js";

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     RoleRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: admin
 *         description:
 *           type: string
 *           example: Administrator role
 *     AssignRoleRequest:
 *      type: object
 *      required: [userId, roleId]
 *      properties:
 *          userId:
 *              type: string
 *              format: uuid
 *          roleId:
 *              type: integer
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleRequest'
 *     responses:
 *       201:
 *         description: Role created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
export const addRole = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const result = await createRole({ name, description });
  return successResponse(res, "Role created successfully", result, 201);
});

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
export const listRoles = asyncHandler(async (req, res) => {
  const result = await getAllRoles();
  return successResponse(res, "Roles retrieved successfully", result);
});

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
export const getRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getRoleById(id);
  return successResponse(res, "Role retrieved successfully", result);
});

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleRequest'
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const result = await updateRoleById(id, { name, description });
  return successResponse(res, "Role updated successfully", result);
});

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role deleted
 */
export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await deleteRoleById(id);
  return successResponse(res, "Role deleted successfully", result);
});

/**
 * @swagger
 * /roles/assign:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRoleRequest'
 *     responses:
 *       200:
 *         description: Role assigned
 */
export const assignRole = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.body;
  const result = await assignRoleToUser(userId, roleId);
  return successResponse(res, "Role assigned successfully", result);
});

/**
 * @swagger
 * /roles/remove:
 *   post:
 *     summary: Remove a role from a user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRoleRequest'
 *     responses:
 *       200:
 *         description: Role removed
 */
export const removeRole = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.body;
  const result = await removeRoleFromUser(userId, roleId);
  return successResponse(res, "Role removed successfully", result);
});

/**
 * @swagger
 * /users/{id}/roles:
 *   get:
 *     summary: Get roles for a user
 *     tags: [Roles]
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
 *         description: User roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
export const listUserRoles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getUserRoles(id);
  return successResponse(res, "User roles retrieved successfully", result);
});
