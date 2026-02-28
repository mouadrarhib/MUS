import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import { logAudit } from "../services/auditService.js";
import {
  acceptAnswer,
  createCommentOnAnswer,
  createCommentOnQuestion,
  createAnswer,
  createQuestionWithRoles,
  getQuestionById,
  listCommentsByAnswer,
  listCommentsByQuestion,
  listAnswersByQuestion,
  listQuestions,
  moderateComment,
  moderateQuestion,
  moderateAnswer,
} from "../services/qaService.js";

/**
 * @swagger
 * tags:
 *   name: QA
 *   description: Questions and answers for modules/resources
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QAQuestionRequest:
 *       type: object
 *       required: [module_id, resource_id, title, body]
 *       properties:
 *         module_id:
 *           type: integer
 *           example: 5
 *         resource_id:
 *           type: integer
 *           example: 42
 *         title:
 *           type: string
 *           minLength: 5
 *         body:
 *           type: string
 *           minLength: 10
 *         is_anonymous:
 *           type: boolean
 *     QAAnswerRequest:
 *       type: object
 *       required: [body]
 *       properties:
 *         body:
 *           type: string
 *           minLength: 10
 *         explanation:
 *           type: string
 *         example:
 *           type: string
 *     QACommentRequest:
 *       type: object
 *       required: [body]
 *       properties:
 *         body:
 *           type: string
 *           minLength: 2
 *     QAModerateAnswerRequest:
 *       type: object
 *       required: [moderation_status]
 *       properties:
 *         moderation_status:
 *           type: string
 *           enum: [active, hidden, deleted]
 *         reason:
 *           type: string
 */

/**
 * @swagger
 * /qa/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QAQuestionRequest'
 *     responses:
 *       201:
 *         description: Question created successfully
 */

export const createQuestionHandler = asyncHandler(async (req, res) => {
  const { module_id, resource_id, title, body, is_anonymous = false } = req.body;

  const question = await createQuestionWithRoles({
    userId: req.user.id,
    roles: req.user.roles || [],
    moduleId: module_id,
    resourceId: resource_id,
    title,
    body,
    isAnonymous: is_anonymous,
  });

  return successResponse(res, "Question creee avec succes", question, 201);
});

/**
 * @swagger
 * /qa/questions:
 *   get:
 *     summary: List questions
 *     tags: [QA]
 *     parameters:
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: resource_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, answered, closed]
 *       - in: query
 *         name: include_hidden
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 */

export const listQuestionsHandler = asyncHandler(async (req, res) => {
  const moduleId = req.query.module_id ? parseInt(req.query.module_id, 10) : null;
  const resourceId = req.query.resource_id ? parseInt(req.query.resource_id, 10) : null;
  const status = req.query.status || null;
  const includeHidden = String(req.query.include_hidden || "false").toLowerCase() === "true";
  const questions = await listQuestions(req.user || null, { moduleId, resourceId, status, includeHidden });
  return successResponse(res, "Questions recuperees avec succes", questions);
});

/**
 * @swagger
 * /qa/questions/{questionId}:
 *   get:
 *     summary: Get question by id
 *     tags: [QA]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: include_hidden
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *       404:
 *         description: Question not found
 */

export const getQuestionHandler = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const includeHidden = String(req.query.include_hidden || "false").toLowerCase() === "true";
  const question = await getQuestionById(questionId, req.user || null, includeHidden);

  if (!question) {
    return res.status(404).json({ success: false, message: "Question introuvable" });
  }

  return successResponse(res, "Question recuperee avec succes", question);
});

/**
 * @swagger
 * /qa/questions/{questionId}/answers:
 *   post:
 *     summary: Add an answer to a question
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QAAnswerRequest'
 *     responses:
 *       201:
 *         description: Answer created successfully
 */

export const createAnswerHandler = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const { body, explanation = null, example = null } = req.body;

  const answer = await createAnswer({
    questionId,
    userId: req.user.id,
    roles: req.user.roles || [],
    body,
    explanation,
    example,
  });

  return successResponse(res, "Reponse creee avec succes", answer, 201);
});

/**
 * @swagger
 * /qa/questions/{questionId}/answers:
 *   get:
 *     summary: List answers for a question
 *     tags: [QA]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: include_hidden
 *         schema:
 *           type: boolean
 *         description: Teacher/Admin only
 *     responses:
 *       200:
 *         description: Answers retrieved successfully
 */

export const listAnswersHandler = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const includeHidden = String(req.query.include_hidden || "false").toLowerCase() === "true";
  const answers = await listAnswersByQuestion(questionId, req.user || null, includeHidden);
  return successResponse(res, "Reponses recuperees avec succes", answers);
});

/**
 * @swagger
 * /qa/questions/{questionId}/moderate:
 *   patch:
 *     summary: Moderate a question (teacher/admin)
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QAModerateAnswerRequest'
 *     responses:
 *       200:
 *         description: Question moderation updated successfully
 */

export const moderateQuestionHandler = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const { moderation_status, reason = null } = req.body;

  const question = await moderateQuestion({
    questionId,
    actor: req.user,
    status: moderation_status,
    reason,
  });

  await logAudit({
    userId: req.user.id,
    action: "QA_MODERATE_QUESTION",
    resourceType: "qa_question",
    resourceId: questionId,
    newValue: { moderation_status, reason },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Moderation de la question mise a jour avec succes", question);
});

/**
 * @swagger
 * /qa/answers/{answerId}/accept:
 *   patch:
 *     summary: Accept an answer (teacher/admin)
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Answer accepted successfully
 */

export const acceptAnswerHandler = asyncHandler(async (req, res) => {
  const answerId = parseInt(req.params.answerId, 10);

  const answer = await acceptAnswer({
    answerId,
    actor: req.user,
  });

  await logAudit({
    userId: req.user.id,
    action: "QA_ACCEPT_ANSWER",
    resourceType: "qa_answer",
    resourceId: answerId,
    newValue: { question_id: answer.question_id, accepted_answer_id: answerId },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Reponse acceptee avec succes", answer);
});

/**
 * @swagger
 * /qa/answers/{answerId}/moderate:
 *   patch:
 *     summary: Moderate an answer (teacher/admin)
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QAModerateAnswerRequest'
 *     responses:
 *       200:
 *         description: Answer moderation updated successfully
 */

export const moderateAnswerHandler = asyncHandler(async (req, res) => {
  const answerId = parseInt(req.params.answerId, 10);
  const { moderation_status, reason = null } = req.body;

  const answer = await moderateAnswer({
    answerId,
    actor: req.user,
    status: moderation_status,
    reason,
  });

  await logAudit({
    userId: req.user.id,
    action: "QA_MODERATE_ANSWER",
    resourceType: "qa_answer",
    resourceId: answerId,
    newValue: { moderation_status, reason },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Moderation de la reponse mise a jour avec succes", answer);
});

/**
 * @swagger
 * /qa/questions/{questionId}/comments:
 *   post:
 *     summary: Add comment on a question
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QACommentRequest'
 *     responses:
 *       201:
 *         description: Comment added successfully
 */

export const createQuestionCommentHandler = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const { body } = req.body;

  const comment = await createCommentOnQuestion({
    questionId,
    userId: req.user.id,
    body,
  });

  return successResponse(res, "Commentaire ajoute avec succes", comment, 201);
});

/**
 * @swagger
 * /qa/answers/{answerId}/comments:
 *   post:
 *     summary: Add comment on an answer
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QACommentRequest'
 *     responses:
 *       201:
 *         description: Comment added successfully
 */

export const createAnswerCommentHandler = asyncHandler(async (req, res) => {
  const answerId = parseInt(req.params.answerId, 10);
  const { body } = req.body;

  const comment = await createCommentOnAnswer({
    answerId,
    userId: req.user.id,
    body,
  });

  return successResponse(res, "Commentaire ajoute avec succes", comment, 201);
});

/**
 * @swagger
 * /qa/questions/{questionId}/comments:
 *   get:
 *     summary: List comments of a question
 *     tags: [QA]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: include_hidden
 *         schema:
 *           type: boolean
 *         description: Teacher/Admin only
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */

export const listQuestionCommentsHandler = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const includeHidden = String(req.query.include_hidden || "false").toLowerCase() === "true";
  const comments = await listCommentsByQuestion(questionId, req.user || null, includeHidden);
  return successResponse(res, "Commentaires recuperes avec succes", comments);
});

/**
 * @swagger
 * /qa/answers/{answerId}/comments:
 *   get:
 *     summary: List comments of an answer
 *     tags: [QA]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: include_hidden
 *         schema:
 *           type: boolean
 *         description: Teacher/Admin only
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */

export const listAnswerCommentsHandler = asyncHandler(async (req, res) => {
  const answerId = parseInt(req.params.answerId, 10);
  const includeHidden = String(req.query.include_hidden || "false").toLowerCase() === "true";
  const comments = await listCommentsByAnswer(answerId, req.user || null, includeHidden);
  return successResponse(res, "Commentaires recuperes avec succes", comments);
});

/**
 * @swagger
 * /qa/comments/{commentId}/moderate:
 *   patch:
 *     summary: Moderate a comment (teacher/admin)
 *     tags: [QA]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QAModerateAnswerRequest'
 *     responses:
 *       200:
 *         description: Comment moderation updated successfully
 */

export const moderateCommentHandler = asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.commentId, 10);
  const { moderation_status, reason = null } = req.body;

  const comment = await moderateComment({
    commentId,
    actor: req.user,
    status: moderation_status,
    reason,
  });

  await logAudit({
    userId: req.user.id,
    action: "QA_MODERATE_COMMENT",
    resourceType: "qa_comment",
    resourceId: commentId,
    newValue: { moderation_status, reason },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Moderation du commentaire mise a jour avec succes", comment);
});
