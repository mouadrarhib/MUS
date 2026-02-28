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

export const getModuleStaffAssignmentsHandler = asyncHandler(async (req, res) => {
  const moduleId = parseInt(req.params.moduleId, 10);
  const rows = await getModuleStaffAssignments(moduleId);
  return successResponse(res, "Referents du module recuperes avec succes", rows);
});

export const getConfusionCaseDetailsHandler = asyncHandler(async (req, res) => {
  const caseId = parseInt(req.params.caseId, 10);
  const row = await getConfusionCaseDetails({ caseId, actor: req.user });
  return successResponse(res, "Details du cas recuperes avec succes", row);
});

export const listConfusionCaseEventsHandler = asyncHandler(async (req, res) => {
  const caseId = parseInt(req.params.caseId, 10);
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
  const rows = await listConfusionCaseEvents({ caseId, actor: req.user, limit });
  return successResponse(res, "Historique du cas recupere avec succes", rows);
});
