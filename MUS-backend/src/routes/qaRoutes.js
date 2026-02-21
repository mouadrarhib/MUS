import { Router } from "express";
import { body, param, query } from "express-validator";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";
import {
  acceptAnswerHandler,
  createAnswerCommentHandler,
  createAnswerHandler,
  createQuestionCommentHandler,
  createQuestionHandler,
  getQuestionHandler,
  listAnswerCommentsHandler,
  listAnswersHandler,
  listQuestionCommentsHandler,
  listQuestionsHandler,
  moderateAnswerHandler,
} from "../controllers/qaController.js";

const router = Router();

router.get(
  "/questions",
  optionalAuthMiddleware,
  [
    query("module_id").optional().isInt({ min: 1 }).withMessage("Valid module ID is required"),
    query("resource_id").optional().isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    query("status").optional().isIn(["open", "answered", "closed"]).withMessage("Invalid status"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden must be boolean"),
  ],
  validateRequest,
  listQuestionsHandler
);

router.get(
  "/questions/:questionId",
  optionalAuthMiddleware,
  [
    param("questionId").isInt({ min: 1 }).withMessage("Valid question ID is required"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden must be boolean"),
  ],
  validateRequest,
  getQuestionHandler
);

router.get(
  "/questions/:questionId/answers",
  optionalAuthMiddleware,
  [param("questionId").isInt({ min: 1 }).withMessage("Valid question ID is required")],
  validateRequest,
  listAnswersHandler
);

router.post(
  "/questions",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    body("module_id").isInt({ min: 1 }).withMessage("Valid module ID is required"),
    body("resource_id").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    body("title").isString().trim().isLength({ min: 5, max: 250 }).withMessage("Title must be 5-250 chars"),
    body("body").isString().trim().isLength({ min: 10 }).withMessage("Body must be at least 10 chars"),
    body("is_anonymous").optional().isBoolean().withMessage("is_anonymous must be boolean"),
  ],
  validateRequest,
  createQuestionHandler
);

router.post(
  "/questions/:questionId/answers",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    param("questionId").isInt({ min: 1 }).withMessage("Valid question ID is required"),
    body("body").isString().trim().isLength({ min: 10 }).withMessage("Body must be at least 10 chars"),
    body("explanation").optional({ nullable: true }).isString(),
    body("example").optional({ nullable: true }).isString(),
  ],
  validateRequest,
  createAnswerHandler
);

router.get(
  "/questions/:questionId/comments",
  optionalAuthMiddleware,
  [param("questionId").isInt({ min: 1 }).withMessage("Valid question ID is required")],
  validateRequest,
  listQuestionCommentsHandler
);

router.get(
  "/answers/:answerId/comments",
  optionalAuthMiddleware,
  [param("answerId").isInt({ min: 1 }).withMessage("Valid answer ID is required")],
  validateRequest,
  listAnswerCommentsHandler
);

router.post(
  "/questions/:questionId/comments",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    param("questionId").isInt({ min: 1 }).withMessage("Valid question ID is required"),
    body("body").isString().trim().isLength({ min: 2 }).withMessage("Comment must be at least 2 chars"),
  ],
  validateRequest,
  createQuestionCommentHandler
);

router.post(
  "/answers/:answerId/comments",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    param("answerId").isInt({ min: 1 }).withMessage("Valid answer ID is required"),
    body("body").isString().trim().isLength({ min: 2 }).withMessage("Comment must be at least 2 chars"),
  ],
  validateRequest,
  createAnswerCommentHandler
);

router.patch(
  "/answers/:answerId/accept",
  authMiddleware,
  requireRole("teacher", "admin"),
  [param("answerId").isInt({ min: 1 }).withMessage("Valid answer ID is required")],
  validateRequest,
  acceptAnswerHandler
);

router.patch(
  "/answers/:answerId/moderate",
  authMiddleware,
  requireRole("teacher", "admin"),
  [
    param("answerId").isInt({ min: 1 }).withMessage("Valid answer ID is required"),
    body("moderation_status")
      .isIn(["active", "hidden", "deleted"])
      .withMessage("moderation_status must be active, hidden or deleted"),
    body("reason").optional({ nullable: true }).isString().isLength({ min: 5, max: 1000 }),
  ],
  validateRequest,
  moderateAnswerHandler
);

export default router;
