import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import { logAudit } from "../services/auditService.js";
import {
  assignConfusionCase,
  createConfusionSignal,
  getConfusionOverview,
  getModuleStaffAssignments,
  getResourceConfusionCount,
  getResourceConfusionRecent,
  getStaffConfusionCases,
  getConfusionCaseDetails,
  listConfusionCaseEvents,
  getStudentConfusionCases,
  updateConfusionCaseStatus,
  upsertModuleStaffAssignment,
} from "../services/resourceConfusionService.js";

/**
 * @swagger
 * tags:
 *   name: Confusion
 *   description: Workflow de signalement de blocage, cas et assignations staff
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateConfusionSignalRequest:
 *       type: object
 *       properties:
 *         module_id:
 *           type: integer
 *           example: 5
 *         note:
 *           type: string
 *           minLength: 3
 *           maxLength: 1000
 *           example: Je bloque sur la demonstration du chapitre 3
 *     AssignConfusionCaseRequest:
 *       type: object
 *       required: [assignee_user_id]
 *       properties:
 *         assignee_user_id:
 *           type: string
 *           format: uuid
 *         reason:
 *           type: string
 *           minLength: 3
 *           maxLength: 1000
 *     UpdateConfusionCaseStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [nouveau, assigne, en_cours, repondu_officiel, resolu]
 *         reason:
 *           type: string
 *           minLength: 3
 *           maxLength: 1000
 *     UpsertModuleStaffAssignmentRequest:
 *       type: object
 *       required: [module_id, user_id, assignment_role]
 *       properties:
 *         module_id:
 *           type: integer
 *           minimum: 1
 *         user_id:
 *           type: string
 *           format: uuid
 *         assignment_role:
 *           type: string
 *           enum: [teacher_referent, admin_referent]
 *         is_primary:
 *           type: boolean
 *         is_active:
 *           type: boolean
 */

/**
 * @swagger
 * /resources/{id}/confusion-signals:
 *   post:
 *     summary: Creer un signal de blocage pour une ressource
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConfusionSignalRequest'
 *     responses:
 *       201:
 *         description: Signal enregistre avec succes
 *       429:
 *         description: Anti-spam actif sur la ressource
 */

export const createConfusionSignalHandler = asyncHandler(async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const moduleId = req.body.module_id ? parseInt(req.body.module_id, 10) : null;
  const { note = null } = req.body;

  const signal = await createConfusionSignal({
    resourceId,
    moduleId,
    userId: req.user.id,
    note,
    actor: req.user,
  });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_SIGNAL_CREATE",
    resourceType: "resource_confusion_signal",
    resourceId,
    newValue: {
      signal_id: signal.signal_id,
      case_id: signal.case?.id,
      module_id: signal.module_id,
    },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Signal enregistre avec succes", signal, 201);
});

/**
 * @swagger
 * /resources/{id}/confusion-signals/count:
 *   get:
 *     summary: Lire les compteurs de blocage d'une ressource
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Compteurs recuperes
 */

export const getResourceConfusionCountHandler = asyncHandler(async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const stats = await getResourceConfusionCount(resourceId);

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_RESOURCE_COUNT_READ",
    resourceType: "resource_confusion_signals",
    resourceId,
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Compteurs de blocage recuperes avec succes", stats);
});

/**
 * @swagger
 * /resources/{id}/confusion-signals/recent:
 *   get:
 *     summary: Lire les signaux recents d'une ressource
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Signaux recents recuperes
 */

export const getResourceConfusionRecentHandler = asyncHandler(async (req, res) => {
  const resourceId = parseInt(req.params.id, 10);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
  const rows = await getResourceConfusionRecent(resourceId, limit);

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_RESOURCE_RECENT_READ",
    resourceType: "resource_confusion_signals",
    resourceId,
    newValue: { limit },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Signaux recents recuperes avec succes", rows);
});

/**
 * @swagger
 * /admin/confusion/overview:
 *   get:
 *     summary: Vue globale admin des blocages
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [resource, module]
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 90
 *     responses:
 *       200:
 *         description: Vue globale recuperee
 */

export const getConfusionOverviewHandler = asyncHandler(async (req, res) => {
  const groupBy = req.query.group_by || "resource";
  const days = req.query.days ? parseInt(req.query.days, 10) : 7;

  const overview = await getConfusionOverview({ groupBy, days });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_OVERVIEW_READ",
    resourceType: "resource_confusion_signals",
    newValue: { group_by: groupBy, days },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Vue globale des blocages recuperee avec succes", {
    group_by: groupBy,
    days,
    rows: overview,
  });
});

/**
 * @swagger
 * /students/me/confusion-cases:
 *   get:
 *     summary: Lister les cas de blocage de l'etudiant courant
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [nouveau, assigne, en_cours, repondu_officiel, resolu]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Cas etudiant recuperes
 */

export const listMyConfusionCasesHandler = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const offset = (page - 1) * limit;

  const rows = await getStudentConfusionCases({
    studentId: req.user.id,
    status,
    limit,
    offset,
  });

  return successResponse(res, "Cas de blocage recuperes avec succes", {
    page,
    limit,
    rows,
  });
});

/**
 * @swagger
 * /confusion/cases:
 *   get:
 *     summary: Lister les cas de blocage cote staff
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [nouveau, assigne, en_cours, repondu_officiel, resolu]
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: assigned_to_me
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Cas staff recuperes
 */

export const listStaffConfusionCasesHandler = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  const moduleId = req.query.module_id ? parseInt(req.query.module_id, 10) : null;
  const assignedToMe = String(req.query.assigned_to_me || "false").toLowerCase() === "true";
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const offset = (page - 1) * limit;

  const rows = await getStaffConfusionCases({
    actor: req.user,
    status,
    moduleId,
    assignedToMe,
    limit,
    offset,
  });

  return successResponse(res, "Cas de blocage staff recuperes avec succes", {
    page,
    limit,
    rows,
  });
});

/**
 * @swagger
 * /confusion/cases/{caseId}/assign:
 *   patch:
 *     summary: Assigner un cas de blocage a un referent
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignConfusionCaseRequest'
 *     responses:
 *       200:
 *         description: Cas assigne
 */

export const assignConfusionCaseHandler = asyncHandler(async (req, res) => {
  const caseId = parseInt(req.params.caseId, 10);
  const { assignee_user_id, reason = null } = req.body;

  const updated = await assignConfusionCase({
    caseId,
    assigneeUserId: assignee_user_id,
    reason,
    actor: req.user,
  });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_CASE_ADMIN_ASSIGN",
    resourceType: "resource_confusion_case",
    resourceId: caseId,
    newValue: { assignee_user_id, reason },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Cas assigne avec succes", updated);
});

/**
 * @swagger
 * /confusion/cases/{caseId}/status:
 *   patch:
 *     summary: Mettre a jour le statut d'un cas de blocage
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConfusionCaseStatusRequest'
 *     responses:
 *       200:
 *         description: Statut du cas mis a jour
 */

export const updateConfusionCaseStatusHandler = asyncHandler(async (req, res) => {
  const caseId = parseInt(req.params.caseId, 10);
  const { status, reason = null } = req.body;

  const updated = await updateConfusionCaseStatus({
    caseId,
    status,
    reason,
    actor: req.user,
  });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_CASE_STATUS_CHANGE",
    resourceType: "resource_confusion_case",
    resourceId: caseId,
    newValue: { status, reason },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Statut du cas mis a jour avec succes", updated);
});

/**
 * @swagger
 * /confusion/module-staff-assignments:
 *   post:
 *     summary: Creer ou mettre a jour une assignation staff sur module
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertModuleStaffAssignmentRequest'
 *     responses:
 *       200:
 *         description: Assignation staff enregistree
 */

export const upsertModuleStaffAssignmentHandler = asyncHandler(async (req, res) => {
  const { module_id, user_id, assignment_role, is_primary = false, is_active = true } = req.body;

  const row = await upsertModuleStaffAssignment({
    moduleId: module_id,
    userId: user_id,
    assignmentRole: assignment_role,
    isPrimary: is_primary,
    isActive: is_active,
  });

  await logAudit({
    userId: req.user.id,
    action: "CONFUSION_MODULE_STAFF_UPSERT",
    resourceType: "module_staff_assignment",
    resourceId: module_id,
    newValue: { user_id, assignment_role, is_primary, is_active },
    ip: req.ip,
    userAgent: req.get("user-agent") || null,
  });

  return successResponse(res, "Referent module enregistre avec succes", row);
});

/**
 * @swagger
 * /confusion/module-staff-assignments/{moduleId}:
 *   get:
 *     summary: Lister les referents d'un module
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Referents du module recuperes
 */

export const getModuleStaffAssignmentsHandler = asyncHandler(async (req, res) => {
  const moduleId = parseInt(req.params.moduleId, 10);
  const rows = await getModuleStaffAssignments(moduleId);
  return successResponse(res, "Referents du module recuperes avec succes", rows);
});

/**
 * @swagger
 * /confusion/cases/{caseId}:
 *   get:
 *     summary: Recuperer le detail d'un cas de blocage
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Detail du cas recupere
 */

export const getConfusionCaseDetailsHandler = asyncHandler(async (req, res) => {
  const caseId = parseInt(req.params.caseId, 10);
  const row = await getConfusionCaseDetails({ caseId, actor: req.user });
  return successResponse(res, "Details du cas recuperes avec succes", row);
});

/**
 * @swagger
 * /confusion/cases/{caseId}/events:
 *   get:
 *     summary: Lister l'historique d'un cas de blocage
 *     tags: [Confusion]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *     responses:
 *       200:
 *         description: Historique du cas recupere
 */

export const listConfusionCaseEventsHandler = asyncHandler(async (req, res) => {
  const caseId = parseInt(req.params.caseId, 10);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
  const rows = await listConfusionCaseEvents({ caseId, actor: req.user, limit });
  return successResponse(res, "Historique du cas recupere avec succes", rows);
});
