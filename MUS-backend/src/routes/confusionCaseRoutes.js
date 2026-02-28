import { Router } from "express";
import { body, param, query } from "express-validator";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";
import {
  assignConfusionCaseHandler,
  getConfusionCaseDetailsHandler,
  getModuleStaffAssignmentsHandler,
  listConfusionCaseEventsHandler,
  listMyConfusionCasesHandler,
  listStaffConfusionCasesHandler,
  updateConfusionCaseStatusHandler,
  upsertModuleStaffAssignmentHandler,
} from "../controllers/resourceConfusionController.js";

const router = Router();

router.get(
  "/students/me/confusion-cases",
  requireRole("student"),
  [
    query("status")
      .optional()
      .isIn(["nouveau", "assigne", "en_cours", "repondu_officiel", "resolu"])
      .withMessage("status invalide"),
    query("page").optional().isInt({ min: 1 }).withMessage("page invalide"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit doit etre entre 1 et 100"),
  ],
  validateRequest,
  listMyConfusionCasesHandler
);

router.get(
  "/confusion/cases",
  requireRole("teacher", "admin"),
  [
    query("status")
      .optional()
      .isIn(["nouveau", "assigne", "en_cours", "repondu_officiel", "resolu"])
      .withMessage("status invalide"),
    query("module_id").optional().isInt({ min: 1 }).withMessage("ID de module invalide"),
    query("assigned_to_me").optional().isBoolean().withMessage("assigned_to_me doit etre un booleen"),
    query("page").optional().isInt({ min: 1 }).withMessage("page invalide"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit doit etre entre 1 et 100"),
  ],
  validateRequest,
  listStaffConfusionCasesHandler
);

router.patch(
  "/confusion/cases/:caseId/assign",
  requireRole("admin"),
  [
    param("caseId").isInt({ min: 1 }).withMessage("ID de cas invalide"),
    body("assignee_user_id").isUUID().withMessage("assignee_user_id invalide"),
    body("reason").optional({ nullable: true }).isString().isLength({ min: 3, max: 1000 }),
  ],
  validateRequest,
  assignConfusionCaseHandler
);

router.patch(
  "/confusion/cases/:caseId/status",
  requireRole("teacher", "admin"),
  [
    param("caseId").isInt({ min: 1 }).withMessage("ID de cas invalide"),
    body("status")
      .isIn(["nouveau", "assigne", "en_cours", "repondu_officiel", "resolu"])
      .withMessage("status invalide"),
    body("reason").optional({ nullable: true }).isString().isLength({ min: 3, max: 1000 }),
  ],
  validateRequest,
  updateConfusionCaseStatusHandler
);

router.get(
  "/confusion/cases/:caseId",
  requireRole("student", "teacher", "admin"),
  [param("caseId").isInt({ min: 1 }).withMessage("ID de cas invalide")],
  validateRequest,
  getConfusionCaseDetailsHandler
);

router.get(
  "/confusion/cases/:caseId/events",
  requireRole("student", "teacher", "admin"),
  [
    param("caseId").isInt({ min: 1 }).withMessage("ID de cas invalide"),
    query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("limit doit etre entre 1 et 200"),
  ],
  validateRequest,
  listConfusionCaseEventsHandler
);

router.post(
  "/confusion/module-staff-assignments",
  requireRole("admin"),
  [
    body("module_id").isInt({ min: 1 }).withMessage("ID de module invalide"),
    body("user_id").isUUID().withMessage("ID utilisateur invalide"),
    body("assignment_role")
      .isIn(["teacher_referent", "admin_referent"])
      .withMessage("assignment_role invalide"),
    body("is_primary").optional().isBoolean().withMessage("is_primary doit etre un booleen"),
    body("is_active").optional().isBoolean().withMessage("is_active doit etre un booleen"),
  ],
  validateRequest,
  upsertModuleStaffAssignmentHandler
);

router.get(
  "/confusion/module-staff-assignments/:moduleId",
  requireRole("admin"),
  [param("moduleId").isInt({ min: 1 }).withMessage("ID de module invalide")],
  validateRequest,
  getModuleStaffAssignmentsHandler
);

export default router;
