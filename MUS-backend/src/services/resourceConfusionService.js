import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import AppError from "../helpers/appError.js";
import { getResourceById } from "./resourceService.js";
import { createNotificationsBulk } from "./notificationService.js";

const isAdmin = (roles = []) => roles.includes("admin");
const isTeacher = (roles = []) => roles.includes("teacher");

export const toConfusionBadges = (status, officialAnswerId = null) => {
  const badges = ["signal_recu"];
  if (["assigne", "en_cours", "repondu_officiel", "resolu"].includes(status)) {
    badges.push("pris_en_charge");
  }
  if (officialAnswerId || ["repondu_officiel", "resolu"].includes(status)) {
    badges.push("reponse_officielle");
  }
  if (status === "resolu") {
    badges.push("resolu");
  }
  return badges;
};

const resolveModuleIdForSignal = async ({ resourceId, moduleId = null }) => {
  if (moduleId) {
    const [rows] = await sequelize.query(
      `
      SELECT 1
      FROM public.resource_module_map
      WHERE resource_id = :resource_id
        AND module_id = :module_id
      LIMIT 1
      `,
      {
        replacements: {
          resource_id: resourceId,
          module_id: moduleId,
        },
      }
    );

    if (!rows.length) {
      throw new AppError("La ressource doit etre liee au module selectionne", 400);
    }

    return moduleId;
  }

  const [rows] = await sequelize.query(
    `
    SELECT module_id
    FROM public.resource_module_map
    WHERE resource_id = :resource_id
    ORDER BY module_id ASC
    LIMIT 2
    `,
    {
      replacements: { resource_id: resourceId },
    }
  );

  if (!rows.length) {
    throw new AppError("Cette ressource n'est liee a aucun module", 400);
  }

  return rows[0].module_id;
};

const getAdminUserIds = async () => {
  const [rows] = await sequelize.query(
    `
    SELECT DISTINCT u.id
    FROM public.users u
    INNER JOIN public.user_roles ur ON ur.user_id = u.id
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE u.is_active = TRUE
      AND r.name = 'admin'
    `
  );

  return rows.map((row) => row.id);
};

const getCaseByIdInternal = async (caseId) => {
  const [rows] = await sequelize.query(SQL.CONFUSION.GET_CASE_BY_ID, {
    replacements: { case_id: caseId },
  });
  return rows[0] || null;
};

const ensureCaseAccessForTeacher = async ({ actorUserId, caseId }) => {
  const [rows] = await sequelize.query(
    `
    SELECT c.id
    FROM public.resource_confusion_cases c
    WHERE c.id = :case_id
      AND (
        c.assigned_to_user_id = :actor_user_id
        OR EXISTS (
          SELECT 1
          FROM public.module_staff_assignments msa
          WHERE msa.module_id = c.module_id
            AND msa.user_id = :actor_user_id
            AND msa.assignment_role = 'teacher_referent'
            AND msa.is_active = TRUE
        )
      )
    LIMIT 1
    `,
    {
      replacements: {
        case_id: caseId,
        actor_user_id: actorUserId,
      },
    }
  );

  return rows.length > 0;
};

const ensureCaseReadableByActor = async ({ actor, caseId }) => {
  const roles = actor?.roles || [];
  const admin = isAdmin(roles);
  const teacher = isTeacher(roles);
  const student = roles.includes("student");

  const caseRow = await getCaseByIdInternal(caseId);
  if (!caseRow) {
    throw new AppError("Cas de blocage introuvable", 404);
  }

  if (admin) return caseRow;

  if (student && caseRow.student_id === actor.id) {
    return caseRow;
  }

  if (teacher) {
    const hasAccess = await ensureCaseAccessForTeacher({ actorUserId: actor.id, caseId });
    if (hasAccess) return caseRow;
  }

  throw new AppError("Acces refuse", 403);
};

const notifyCaseCreation = async ({ caseId, moduleId, resourceId, studentId, assignedToUserId }) => {
  const notifications = [];

  if (assignedToUserId) {
    notifications.push({
      recipientUserId: assignedToUserId,
      type: "CONFUSION_CASE_ASSIGNED",
      title: "Nouveau cas de blocage assigne",
      body: "Un etudiant a signale un blocage sur une ressource de votre module.",
      payload: { case_id: caseId, module_id: moduleId, resource_id: resourceId },
    });
  }

  const adminUserIds = await getAdminUserIds();
  for (const adminId of adminUserIds) {
    notifications.push({
      recipientUserId: adminId,
      type: "CONFUSION_CASE_CREATED",
      title: "Nouveau signal de blocage",
      body: "Un nouveau signal etudiant a ete recu et pris en charge.",
      payload: { case_id: caseId, module_id: moduleId, resource_id: resourceId, student_id: studentId },
    });
  }

  await createNotificationsBulk(notifications);
};

export const createConfusionSignal = async ({ resourceId, moduleId = null, userId, note = null, actor = null }) => {
  const resource = await getResourceById(resourceId);
  if (!resource) {
    throw new AppError("Ressource introuvable", 404);
  }

  const roles = actor?.roles || [];
  if (!roles.includes("student") && !isAdmin(roles) && !isTeacher(roles)) {
    throw new AppError("Acces refuse", 403);
  }

  const resolvedModuleId = await resolveModuleIdForSignal({ resourceId, moduleId });

  let rows;
  try {
    [rows] = await sequelize.query(SQL.CONFUSION.CREATE_SIGNAL_AND_ASSIGN, {
      replacements: {
        resource_id: resourceId,
        module_id: resolvedModuleId,
        user_id: userId,
        note: note?.trim() || null,
        anti_spam_minutes: 120,
      },
    });
  } catch (error) {
    if (String(error.message || "").includes("deja envoye un signal")) {
      throw new AppError("Vous avez deja envoye un signal recemment pour cette ressource. Reessayez dans 2 heures.", 429);
    }
    throw error;
  }

  const created = rows[0];
  if (!created) {
    throw new AppError("Echec de creation du signal", 500);
  }

  await notifyCaseCreation({
    caseId: created.case_id,
    moduleId: created.module_id,
    resourceId: created.resource_id,
    studentId: created.user_id,
    assignedToUserId: created.assigned_to_user_id,
  });

  const caseSnapshot = await getCaseByIdInternal(created.case_id);

  return {
    signal_id: created.signal_id,
    resource_id: created.resource_id,
    module_id: created.module_id,
    user_id: created.user_id,
    note: created.note,
    created_at: created.signal_created_at,
    case: {
      id: created.case_id,
      status: created.case_status,
      assigned_to_user_id: created.assigned_to_user_id,
      assignment_source: created.assignment_source,
      badges: toConfusionBadges(created.case_status, caseSnapshot?.official_answer_id || null),
      next_action: "Votre demande est transmise au referent du module.",
    },
  };
};

export const getResourceConfusionCount = async (resourceId) => {
  const [rows] = await sequelize.query(
    `
    SELECT COUNT(*)::bigint AS total_signals,
           COUNT(DISTINCT user_id)::bigint AS unique_users,
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::bigint AS signals_24h
    FROM public.resource_confusion_signals
    WHERE resource_id = :resource_id
    `,
    {
      replacements: { resource_id: resourceId },
    }
  );

  return rows[0] || { total_signals: 0, unique_users: 0, signals_24h: 0 };
};

export const getResourceConfusionRecent = async (resourceId, limit = 20) => {
  const [rows] = await sequelize.query(
    `
    SELECT
      rcs.id,
      rcs.resource_id,
      rcs.user_id,
      u.full_name AS user_name,
      rcs.note,
      rcs.created_at
    FROM public.resource_confusion_signals rcs
    INNER JOIN public.users u ON u.id = rcs.user_id
    WHERE rcs.resource_id = :resource_id
    ORDER BY rcs.created_at DESC
    LIMIT :limit
    `,
    {
      replacements: {
        resource_id: resourceId,
        limit,
      },
    }
  );

  return rows;
};

export const getConfusionOverview = async ({ groupBy = "resource", days = 7 } = {}) => {
  if (!["resource", "module"].includes(groupBy)) {
    throw new AppError("group_by invalide", 400);
  }

  const intervalDays = Number.isInteger(days) && days > 0 && days <= 90 ? days : 7;

  if (groupBy === "resource") {
    const [rows] = await sequelize.query(
      `
      SELECT
        r.id AS resource_id,
        r.title AS resource_title,
        COUNT(rcs.id)::bigint AS signals_count,
        COUNT(DISTINCT rcs.user_id)::bigint AS unique_users,
        MAX(rcs.created_at) AS last_signal_at
      FROM public.resource_confusion_signals rcs
      INNER JOIN public.resources r ON r.id = rcs.resource_id
      WHERE rcs.created_at >= NOW() - (:days::text || ' days')::interval
      GROUP BY r.id, r.title
      ORDER BY signals_count DESC, last_signal_at DESC
      `,
      {
        replacements: { days: intervalDays },
      }
    );

    return rows;
  }

  const [rows] = await sequelize.query(
    `
    SELECT
      m.id AS module_id,
      m.code AS module_code,
      m.title AS module_title,
      COUNT(rcs.id)::bigint AS signals_count,
      COUNT(DISTINCT rcs.user_id)::bigint AS unique_users,
      MAX(rcs.created_at) AS last_signal_at
    FROM public.resource_confusion_signals rcs
    INNER JOIN public.resource_module_map rmm ON rmm.resource_id = rcs.resource_id
    INNER JOIN public.modules m ON m.id = rmm.module_id
    WHERE rcs.created_at >= NOW() - (:days::text || ' days')::interval
    GROUP BY m.id, m.code, m.title
    ORDER BY signals_count DESC, last_signal_at DESC
    `,
    {
      replacements: { days: intervalDays },
    }
  );

  return rows;
};

export const getStudentConfusionCases = async ({ studentId, status = null, limit = 20, offset = 0 }) => {
  const [rows] = await sequelize.query(SQL.CONFUSION.GET_CASES_FOR_STUDENT, {
    replacements: {
      student_id: studentId,
      status,
      limit_value: limit,
      offset_value: offset,
    },
  });

  return rows.map((row) => ({
    ...row,
    badges: toConfusionBadges(row.status, row.official_answer_id),
  }));
};

export const getStaffConfusionCases = async ({ actor, status = null, moduleId = null, assignedToMe = false, limit = 20, offset = 0 }) => {
  const admin = isAdmin(actor?.roles || []);
  const teacher = isTeacher(actor?.roles || []);

  if (!admin && !teacher) {
    throw new AppError("Acces refuse", 403);
  }

  const [rows] = await sequelize.query(SQL.CONFUSION.GET_CASES_FOR_STAFF, {
    replacements: {
      actor_user_id: actor.id,
      is_admin: admin,
      status,
      module_id: moduleId,
      assigned_to_me: Boolean(assignedToMe),
      limit_value: limit,
      offset_value: offset,
    },
  });

  return rows.map((row) => ({
    ...row,
    badges: toConfusionBadges(row.status, row.official_answer_id),
  }));
};

export const assignConfusionCase = async ({ caseId, assigneeUserId, reason = null, actor }) => {
  if (!isAdmin(actor?.roles || [])) {
    throw new AppError("Acces refuse", 403);
  }

  const current = await getCaseByIdInternal(caseId);
  if (!current) {
    throw new AppError("Cas de blocage introuvable", 404);
  }

  const [roleRows] = await sequelize.query(
    `
    SELECT DISTINCT r.name
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = :user_id
    `,
    { replacements: { user_id: assigneeUserId } }
  );

  const roles = roleRows.map((row) => row.name);
  const validRole = roles.includes("teacher") || roles.includes("admin");
  if (!validRole) {
    throw new AppError("Le destinataire doit etre teacher ou admin", 400);
  }

  const [rows] = await sequelize.query(SQL.CONFUSION.ASSIGN_CASE, {
    replacements: {
      case_id: caseId,
      assignee_user_id: assigneeUserId,
      assigned_by_user_id: actor.id,
      reason: reason?.trim() || null,
    },
  });

  if (!rows.length) {
    throw new AppError("Cas de blocage introuvable", 404);
  }

  await createNotificationsBulk([
    {
      recipientUserId: assigneeUserId,
      type: "CONFUSION_CASE_ASSIGNED",
      title: "Cas de blocage assigne",
      body: "Un administrateur vous a assigne un cas de blocage etudiant.",
      payload: { case_id: caseId, module_id: current.module_id, resource_id: current.resource_id },
    },
    {
      recipientUserId: current.student_id,
      type: "CONFUSION_CASE_UPDATED",
      title: "Votre signal est pris en charge",
      body: "Votre signal a ete assigne a un referent pedagogique.",
      payload: { case_id: caseId, status: rows[0].status },
    },
  ]);

  const updated = await getCaseByIdInternal(caseId);
  return {
    ...updated,
    badges: toConfusionBadges(updated.status, updated.official_answer_id),
  };
};

export const updateConfusionCaseStatus = async ({ caseId, status, reason = null, actor }) => {
  const roles = actor?.roles || [];
  const admin = isAdmin(roles);
  const teacher = isTeacher(roles);

  if (!admin && !teacher) {
    throw new AppError("Acces refuse", 403);
  }

  const current = await getCaseByIdInternal(caseId);
  if (!current) {
    throw new AppError("Cas de blocage introuvable", 404);
  }

  if (!admin) {
    const hasAccess = await ensureCaseAccessForTeacher({ actorUserId: actor.id, caseId });
    if (!hasAccess) {
      throw new AppError("Acces refuse", 403);
    }
  }

  const allowedTransitions = {
    nouveau: ["assigne", "en_cours"],
    assigne: ["en_cours", "repondu_officiel", "resolu"],
    en_cours: ["repondu_officiel", "resolu"],
    repondu_officiel: ["en_cours", "resolu"],
    resolu: ["en_cours"],
  };

  if (!allowedTransitions[current.status]?.includes(status)) {
    throw new AppError(`Transition de statut invalide : ${current.status} -> ${status}`, 400);
  }

  if (status === "resolu" && !admin && current.assigned_to_user_id && current.assigned_to_user_id !== actor.id) {
    throw new AppError("Seul le referent assigne ou un administrateur peut cloturer ce cas", 403);
  }

  const [rows] = await sequelize.query(SQL.CONFUSION.UPDATE_CASE_STATUS, {
    replacements: {
      case_id: caseId,
      status,
      actor_user_id: actor.id,
      reason: reason?.trim() || null,
    },
  });

  if (!rows.length) {
    throw new AppError("Cas de blocage introuvable", 404);
  }

  const notifications = [
    {
      recipientUserId: current.student_id,
      type: "CONFUSION_CASE_UPDATED",
      title: status === "resolu" ? "Votre cas est resolu" : "Mise a jour de votre cas",
      body:
        status === "resolu"
          ? "Votre signal de blocage a ete marque comme resolu."
          : `Le statut de votre signal est maintenant: ${status}.`,
      payload: { case_id: caseId, status },
    },
  ];

  if (current.assigned_to_user_id && current.assigned_to_user_id !== actor.id) {
    notifications.push({
      recipientUserId: current.assigned_to_user_id,
      type: "CONFUSION_CASE_UPDATED",
      title: "Mise a jour d'un cas assigne",
      body: `Le statut du cas #${caseId} est passe a ${status}.`,
      payload: { case_id: caseId, status },
    });
  }

  await createNotificationsBulk(notifications);

  const updated = await getCaseByIdInternal(caseId);
  return {
    ...updated,
    badges: toConfusionBadges(updated.status, updated.official_answer_id),
  };
};

export const linkOfficialAnswerToConfusionCase = async ({ questionId, answerId, actor }) => {
  const [rows] = await sequelize.query(SQL.CONFUSION.LINK_OFFICIAL_ANSWER, {
    replacements: {
      question_id: questionId,
      answer_id: answerId,
      actor_user_id: actor.id,
    },
  });

  const linked = rows[0] || null;
  if (!linked) {
    return null;
  }

  const adminIds = await getAdminUserIds();
  const notifications = [
    {
      recipientUserId: linked.student_id,
      type: "CONFUSION_OFFICIAL_ANSWER_POSTED",
      title: "Nouvelle reponse officielle disponible",
      body: "Un enseignant a publie une reponse officielle a votre blocage.",
      payload: {
        case_id: linked.case_id,
        question_id: questionId,
        answer_id: answerId,
        status: linked.status,
      },
    },
  ];

  for (const adminId of adminIds) {
    notifications.push({
      recipientUserId: adminId,
      type: "CONFUSION_CASE_UPDATED",
      title: "Case mise a jour avec reponse officielle",
      body: "Une reponse officielle vient d'etre liee a un cas de blocage.",
      payload: {
        case_id: linked.case_id,
        question_id: questionId,
        answer_id: answerId,
        status: linked.status,
      },
    });
  }

  await createNotificationsBulk(notifications);
  return linked;
};

export const upsertModuleStaffAssignment = async ({ moduleId, userId, assignmentRole, isPrimary = false, isActive = true }) => {
  if (!["teacher_referent", "admin_referent"].includes(assignmentRole)) {
    throw new AppError("assignment_role invalide", 400);
  }

  const [roleRows] = await sequelize.query(
    `
    SELECT DISTINCT r.name
    FROM public.user_roles ur
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = :user_id
    `,
    { replacements: { user_id: userId } }
  );

  const roles = roleRows.map((row) => row.name);
  if (assignmentRole === "teacher_referent" && !roles.includes("teacher")) {
    throw new AppError("L'utilisateur doit avoir le role teacher", 400);
  }
  if (assignmentRole === "admin_referent" && !roles.includes("admin")) {
    throw new AppError("L'utilisateur doit avoir le role admin", 400);
  }

  const [rows] = await sequelize.query(SQL.CONFUSION.UPSERT_MODULE_STAFF, {
    replacements: {
      module_id: moduleId,
      user_id: userId,
      assignment_role: assignmentRole,
      is_primary: Boolean(isPrimary),
      is_active: Boolean(isActive),
    },
  });

  return rows[0] || null;
};

export const getModuleStaffAssignments = async (moduleId) => {
  const [rows] = await sequelize.query(SQL.CONFUSION.GET_MODULE_STAFF, {
    replacements: { module_id: moduleId },
  });

  return rows;
};

export const getConfusionCaseDetails = async ({ caseId, actor }) => {
  const row = await ensureCaseReadableByActor({ actor, caseId });
  return {
    ...row,
    badges: toConfusionBadges(row.status, row.official_answer_id),
  };
};

export const listConfusionCaseEvents = async ({ caseId, actor, limit = 50 }) => {
  await ensureCaseReadableByActor({ actor, caseId });

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const [rows] = await sequelize.query(
    `
    SELECT
      e.id,
      e.case_id,
      e.event_type,
      e.actor_user_id,
      u.full_name AS actor_user_name,
      e.payload,
      e.created_at
    FROM public.resource_confusion_case_events e
    LEFT JOIN public.users u ON u.id = e.actor_user_id
    WHERE e.case_id = :case_id
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT :limit_value
    `,
    {
      replacements: {
        case_id: caseId,
        limit_value: safeLimit,
      },
    }
  );

  return rows;
};
