import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  createStudentProfile,
  getAllStudentProfiles,
  getStudentProfileByUserId,
  updateStudentProfile,
  updateStudentInstitution,
  updateStudentProgram,
  updateStudentSemester,
  updateStudentContributionMode,
  deleteStudentProfile,
  studentProfileExists,
  getStudentProfilesByInstitution,
  getStudentProfilesByProgram,
  getStudentProfilesBySemester,
  countStudentProfilesByInstitution,
  countStudentProfilesByProgram,
  countStudentProfilesBySemester,
  getStudentProfileFullDetails,
} from "../services/studentProfileService.js";

/**
 * @swagger
 * tags:
 *   name: Student Profiles
 *   description: Student profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StudentProfile:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *         institution_id:
 *           type: integer
 *         program_id:
 *           type: integer
 *         current_semester_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     StudentProfileRequest:
 *       type: object
 *       required: [user_id, institution_id, program_id, current_semester_id]
 *       properties:
 *         user_id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         institution_id:
 *           type: integer
 *           example: 1
 *         program_id:
 *           type: integer
 *           example: 1
 *         current_semester_id:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /student-profiles:
 *   post:
 *     summary: Create a new student profile
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentProfileRequest'
 *     responses:
 *       201:
 *         description: Student profile created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentProfile'
 */
export const addStudentProfile = asyncHandler(async (req, res) => {
  const { user_id, institution_id, program_id, current_semester_id, contribution_mode } = req.body;
  const result = await createStudentProfile(
    user_id,
    institution_id,
    program_id,
    current_semester_id,
    contribution_mode
  );
  return successResponse(res, "Student profile created successfully", result, 201);
});

/**
 * @swagger
 * /student-profiles:
 *   get:
 *     summary: Get all student profiles
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of student profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentProfile'
 */
export const listStudentProfiles = asyncHandler(async (req, res) => {
  const result = await getAllStudentProfiles();
  return successResponse(res, "Student profiles retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/{userId}:
 *   get:
 *     summary: Get a student profile by user ID
 *     tags: [Student Profiles]
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
 *         description: Student profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentProfile'
 */
export const getStudentProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getStudentProfileByUserId(userId);
  return successResponse(res, "Student profile retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/{userId}:
 *   patch:
 *     summary: Update a student profile by user ID
 *     tags: [Student Profiles]
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
 *             type: object
 *             properties:
 *               institution_id:
 *                 type: integer
 *               program_id:
 *                 type: integer
 *               current_semester_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Student profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentProfile'
 */
export const updateExistingStudentProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { institution_id, program_id, current_semester_id, contribution_mode } = req.body;
  const profileResult = await updateStudentProfile(
    userId,
    institution_id,
    program_id,
    current_semester_id
  );

  let modeResult = null;
  if (typeof contribution_mode !== "undefined") {
    modeResult = await updateStudentContributionMode(userId, contribution_mode);
  }

  return successResponse(res, "Student profile updated successfully", {
    profile: profileResult,
    contribution_mode: modeResult,
  });
});

/**
 * @swagger
 * /student-profiles/{userId}:
 *   delete:
 *     summary: Delete a student profile by user ID
 *     tags: [Student Profiles]
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
 *         description: Student profile deleted
 */
export const deleteExistingStudentProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await deleteStudentProfile(userId);
  return successResponse(res, "Student profile deleted successfully");
});

/**
 * @swagger
 * /student-profiles/{userId}/institution:
 *   patch:
 *     summary: Update student's institution
 *     tags: [Student Profiles]
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
 *             type: object
 *             required: [institution_id]
 *             properties:
 *               institution_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Student institution updated
 */
export const updateStudentInstitutionHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { institution_id } = req.body;
  const result = await updateStudentInstitution(userId, institution_id);
  return successResponse(res, "Student institution updated successfully", result);
});

/**
 * @swagger
 * /student-profiles/{userId}/program:
 *   patch:
 *     summary: Update student's program
 *     tags: [Student Profiles]
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
 *             type: object
 *             required: [program_id]
 *             properties:
 *               program_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Student program updated
 */
export const updateStudentProgramHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { program_id } = req.body;
  const result = await updateStudentProgram(userId, program_id);
  return successResponse(res, "Student program updated successfully", result);
});

/**
 * @swagger
 * /student-profiles/{userId}/semester:
 *   patch:
 *     summary: Update student's current semester
 *     tags: [Student Profiles]
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
 *             type: object
 *             required: [current_semester_id]
 *             properties:
 *               current_semester_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Student semester updated
 */
export const updateStudentSemesterHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { current_semester_id } = req.body;
  const result = await updateStudentSemester(userId, current_semester_id);
  return successResponse(res, "Student semester updated successfully", result);
});

export const updateStudentContributionModeHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { contribution_mode } = req.body;
  const result = await updateStudentContributionMode(userId, contribution_mode);
  return successResponse(res, "Student contribution mode updated successfully", result);
});

/**
 * @swagger
 * /student-profiles/{userId}/exists:
 *   get:
 *     summary: Check if student profile exists for user
 *     tags: [Student Profiles]
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
 *         description: Existence check result
 */
export const studentProfileExistsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await studentProfileExists(userId);
  return successResponse(res, "Student profile existence checked successfully", result);
});

/**
 * @swagger
 * /student-profiles/institution/{institutionId}:
 *   get:
 *     summary: Get all student profiles for a specific institution
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of student profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentProfile'
 */
export const listStudentProfilesByInstitution = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const result = await getStudentProfilesByInstitution(institutionId);
  return successResponse(res, "Student profiles retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/program/{programId}:
 *   get:
 *     summary: Get all student profiles for a specific program
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of student profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentProfile'
 */
export const listStudentProfilesByProgram = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const result = await getStudentProfilesByProgram(programId);
  return successResponse(res, "Student profiles retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/semester/{semesterId}:
 *   get:
 *     summary: Get all student profiles for a specific semester
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of student profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StudentProfile'
 */
export const listStudentProfilesBySemester = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;
  const result = await getStudentProfilesBySemester(semesterId);
  return successResponse(res, "Student profiles retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/institution/{institutionId}/count:
 *   get:
 *     summary: Count student profiles by institution
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student profile count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countStudentProfilesByInstitutionHandler = asyncHandler(async (req, res) => {
  const { institutionId } = req.params;
  const result = await countStudentProfilesByInstitution(institutionId);
  return successResponse(res, "Student profile count retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/program/{programId}/count:
 *   get:
 *     summary: Count student profiles by program
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student profile count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countStudentProfilesByProgramHandler = asyncHandler(async (req, res) => {
  const { programId } = req.params;
  const result = await countStudentProfilesByProgram(programId);
  return successResponse(res, "Student profile count retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/semester/{semesterId}/count:
 *   get:
 *     summary: Count student profiles by semester
 *     tags: [Student Profiles]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: semesterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student profile count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
export const countStudentProfilesBySemesterHandler = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;
  const result = await countStudentProfilesBySemester(semesterId);
  return successResponse(res, "Student profile count retrieved successfully", result);
});

/**
 * @swagger
 * /student-profiles/{userId}/full-details:
 *   get:
 *     summary: Get full details for a student profile
 *     tags: [Student Profiles]
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
 *         description: Full student profile details
 */
export const getStudentProfileFullDetailsHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const result = await getStudentProfileFullDetails(userId);
  return successResponse(res, "Student profile full details retrieved successfully", result);
});
