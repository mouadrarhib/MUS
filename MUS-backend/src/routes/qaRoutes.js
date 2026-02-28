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
  moderateCommentHandler,
  moderateQuestionHandler,
} from "../controllers/qaController.js";

const router = Router();

router.get(
  "/questions",
  optionalAuthMiddleware,
  [
    query("module_id").optional().isInt({ min: 1 }).withMessage("ID de module invalide"),
    query("resource_id").optional().isInt({ min: 1 }).withMessage("ID de ressource invalide"),
    query("status").optional().isIn(["open", "answered", "closed"]).withMessage("Statut invalide"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden doit etre un booleen"),
  ],
  validateRequest,
  listQuestionsHandler
);

router.get(
  "/questions/:questionId",
  optionalAuthMiddleware,
  [
    param("questionId").isInt({ min: 1 }).withMessage("ID de question invalide"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden doit etre un booleen"),
  ],
  validateRequest,
  getQuestionHandler
);

router.get(
  "/questions/:questionId/answers",
  optionalAuthMiddleware,
  [
    param("questionId").isInt({ min: 1 }).withMessage("ID de question invalide"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden doit etre un booleen"),
  ],
  validateRequest,
  listAnswersHandler
);

router.post(
  "/questions",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    body("module_id").isInt({ min: 1 }).withMessage("ID de module invalide"),
    body("resource_id").isInt({ min: 1 }).withMessage("ID de ressource invalide"),
    body("title").isString().trim().isLength({ min: 5, max: 250 }).withMessage("Le titre doit contenir entre 5 et 250 caracteres"),
    body("body").isString().trim().isLength({ min: 10 }).withMessage("Le contenu doit contenir au moins 10 caracteres"),
    body("is_anonymous").optional().isBoolean().withMessage("is_anonymous doit etre un booleen"),
  ],
  validateRequest,
  createQuestionHandler
);

router.post(
  "/questions/:questionId/answers",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    param("questionId").isInt({ min: 1 }).withMessage("ID de question invalide"),
    body("body").isString().trim().isLength({ min: 10 }).withMessage("La reponse doit contenir au moins 10 caracteres"),
    body("explanation").optional({ nullable: true }).isString(),
    body("example").optional({ nullable: true }).isString(),
  ],
  validateRequest,
  createAnswerHandler
);

router.get(
  "/questions/:questionId/comments",
  optionalAuthMiddleware,
  [
    param("questionId").isInt({ min: 1 }).withMessage("ID de question invalide"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden doit etre un booleen"),
  ],
  validateRequest,
  listQuestionCommentsHandler
);

router.get(
  "/answers/:answerId/comments",
  optionalAuthMiddleware,
  [
    param("answerId").isInt({ min: 1 }).withMessage("ID de reponse invalide"),
    query("include_hidden").optional().isBoolean().withMessage("include_hidden doit etre un booleen"),
  ],
  validateRequest,
  listAnswerCommentsHandler
);

router.patch(
  "/questions/:questionId/moderate",
  authMiddleware,
  requireRole("teacher", "admin"),
  [
    param("questionId").isInt({ min: 1 }).withMessage("ID de question invalide"),
    body("moderation_status")
      .isIn(["active", "hidden", "deleted"])
      .withMessage("moderation_status doit etre active, hidden ou deleted"),
    body("reason").optional({ nullable: true }).isString().isLength({ min: 5, max: 1000 }),
  ],
  validateRequest,
  moderateQuestionHandler
);

router.post(
  "/questions/:questionId/comments",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    param("questionId").isInt({ min: 1 }).withMessage("ID de question invalide"),
    body("body").isString().trim().isLength({ min: 2 }).withMessage("Le commentaire doit contenir au moins 2 caracteres"),
  ],
  validateRequest,
  createQuestionCommentHandler
);

router.post(
  "/answers/:answerId/comments",
  authMiddleware,
  requireRole("student", "teacher", "admin"),
  [
    param("answerId").isInt({ min: 1 }).withMessage("ID de reponse invalide"),
    body("body").isString().trim().isLength({ min: 2 }).withMessage("Le commentaire doit contenir au moins 2 caracteres"),
  ],
  validateRequest,
  createAnswerCommentHandler
);

router.patch(
  "/answers/:answerId/accept",
  authMiddleware,
  requireRole("teacher", "admin"),
  [param("answerId").isInt({ min: 1 }).withMessage("ID de reponse invalide")],
  validateRequest,
  acceptAnswerHandler
);

router.patch(
  "/answers/:answerId/moderate",
  authMiddleware,
  requireRole("teacher", "admin"),
  [
    param("answerId").isInt({ min: 1 }).withMessage("ID de reponse invalide"),
    body("moderation_status")
      .isIn(["active", "hidden", "deleted"])
      .withMessage("moderation_status doit etre active, hidden ou deleted"),
    body("reason").optional({ nullable: true }).isString().isLength({ min: 5, max: 1000 }),
  ],
  validateRequest,
  moderateAnswerHandler
);

router.patch(
  "/comments/:commentId/moderate",
  authMiddleware,
  requireRole("teacher", "admin"),
  [
    param("commentId").isInt({ min: 1 }).withMessage("ID de commentaire invalide"),
    body("moderation_status")
      .isIn(["active", "hidden", "deleted"])
      .withMessage("moderation_status doit etre active, hidden ou deleted"),
    body("reason").optional({ nullable: true }).isString().isLength({ min: 5, max: 1000 }),
  ],
  validateRequest,
  moderateCommentHandler
);

export default router;
