import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";

const isAdmin = (roles = []) => roles.includes("admin");
const isTeacher = (roles = []) => roles.includes("teacher");
const isStudent = (roles = []) => roles.includes("student");
const TWO_HOURS = "2 hours";
const STUDENT_QUESTION_LIMIT = 5;
const STUDENT_ANSWER_LIMIT = 5;

const canModerate = (roles = []) => isTeacher(roles) || isAdmin(roles);
const canViewHidden = ({ actor = null, includeHidden = false }) =>
  Boolean(includeHidden && canModerate(actor?.roles || []));

const toBadges = (answer) => {
  const badges = [];
  if (answer.is_official) badges.push("officiale");
  if (!answer.is_official) badges.push("peer");
  if (answer.is_accepted) badges.push("acceptee");
  return badges;
};

const assertStudentQuota = async ({ userId, roles = [], type }) => {
  if (!isStudent(roles) || isTeacher(roles) || isAdmin(roles)) return;

  const table = type === "question" ? "public.qa_questions" : "public.qa_answers";
  const limit = type === "question" ? STUDENT_QUESTION_LIMIT : STUDENT_ANSWER_LIMIT;

  const [countRows] = await sequelize.query(
    `
    SELECT COUNT(*)::int AS count
    FROM ${table}
    WHERE user_id = :user_id
      AND created_at >= NOW() - INTERVAL '${TWO_HOURS}'
    `,
    { replacements: { user_id: userId } }
  );

  const currentCount = countRows[0]?.count || 0;
  if (currentCount < limit) return;

  const [retryRows] = await sequelize.query(
    `
    SELECT (MIN(created_at) + INTERVAL '${TWO_HOURS}') AS retry_at
    FROM ${table}
    WHERE user_id = :user_id
      AND created_at >= NOW() - INTERVAL '${TWO_HOURS}'
    `,
    { replacements: { user_id: userId } }
  );

  const retryAt = retryRows[0]?.retry_at;
  const message =
    type === "question"
      ? `Vous avez atteint la limite de ${limit} questions en 2h. Reessayez apres ${retryAt || "bientot"}.`
      : `Vous avez atteint la limite de ${limit} reponses en 2h. Reessayez apres ${retryAt || "bientot"}.`;

  throw new AppError(message, 429);
};

const questionProjection = (actor = null) => {
  const admin = isAdmin(actor?.roles || []);
  const viewerId = actor?.id || null;

  return `
    q.id,
    q.module_id,
    q.resource_id,
    q.title,
    q.body,
    q.is_anonymous,
    q.status::text AS status,
    q.created_at,
    q.updated_at,
    CASE
      WHEN q.is_anonymous = TRUE AND :viewer_id IS DISTINCT FROM q.user_id AND :is_admin = FALSE THEN NULL
      ELSE q.user_id
    END AS user_id,
    CASE
      WHEN q.is_anonymous = TRUE AND :viewer_id IS DISTINCT FROM q.user_id AND :is_admin = FALSE THEN 'Anonyme'
      ELSE u.full_name
    END AS user_name
  `;
};

const questionReplacements = (actor = null) => ({
  viewer_id: actor?.id || null,
  is_admin: isAdmin(actor?.roles || []),
});

const ensureResourceLinkedToModule = async ({ resourceId, moduleId }) => {
  const [rows] = await sequelize.query(
    `
    SELECT r.id
    FROM public.resources r
    INNER JOIN public.resource_module_map rmm ON rmm.resource_id = r.id
    WHERE r.id = :resource_id
      AND rmm.module_id = :module_id
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
};

export const createQuestion = async ({ userId, moduleId, resourceId, title, body, isAnonymous = false }) => {
  await ensureResourceLinkedToModule({ resourceId, moduleId });

  const [rows] = await sequelize.query(
    `
    INSERT INTO public.qa_questions (module_id, resource_id, user_id, title, body, is_anonymous)
    VALUES (:module_id, :resource_id, :user_id, :title, :body, :is_anonymous)
    RETURNING id, module_id, resource_id, user_id, title, body, is_anonymous, status::text AS status, created_at, updated_at
    `,
    {
      replacements: {
        module_id: moduleId,
        resource_id: resourceId,
        user_id: userId,
        title: title.trim(),
        body: body.trim(),
        is_anonymous: Boolean(isAnonymous),
      },
    }
  );

  return rows[0];
};

export const createQuestionWithRoles = async ({ userId, roles = [], moduleId, resourceId, title, body, isAnonymous = false }) => {
  await assertStudentQuota({ userId, roles, type: "question" });
  return createQuestion({ userId, moduleId, resourceId, title, body, isAnonymous });
};

export const listQuestions = async (
  actor = null,
  { moduleId = null, resourceId = null, status = null, includeHidden = false } = {}
) => {
  const allowHidden = includeHidden && canModerate(actor?.roles || []);
  const [rows] = await sequelize.query(
    `
    SELECT ${questionProjection(actor)}
    FROM public.qa_questions q
    INNER JOIN public.users u ON u.id = q.user_id
    WHERE (:module_id::bigint IS NULL OR q.module_id = :module_id)
      AND (:resource_id::bigint IS NULL OR q.resource_id = :resource_id)
      AND (:status::text IS NULL OR q.status::text = :status)
      AND (:allow_hidden = TRUE OR q.moderation_status = 'active'::qa_moderation_status)
    ORDER BY q.created_at DESC
    `,
    {
      replacements: {
        ...questionReplacements(actor),
        module_id: moduleId,
        resource_id: resourceId,
        status,
        allow_hidden: allowHidden,
      },
    }
  );

  return rows;
};

export const getQuestionById = async (questionId, actor = null, includeHidden = false) => {
  const allowHidden = includeHidden && canModerate(actor?.roles || []);
  const [rows] = await sequelize.query(
    `
    SELECT ${questionProjection(actor)}
    FROM public.qa_questions q
    INNER JOIN public.users u ON u.id = q.user_id
    WHERE q.id = :question_id
      AND (:allow_hidden = TRUE OR q.moderation_status = 'active'::qa_moderation_status)
    LIMIT 1
    `,
    {
      replacements: {
        ...questionReplacements(actor),
        question_id: questionId,
        allow_hidden: allowHidden,
      },
    }
  );

  return rows[0] || null;
};

const ensureQuestionExists = async (questionId, { allowHidden = false } = {}) => {
  const [rows] = await sequelize.query(
    `
    SELECT id, module_id, status::text AS status, moderation_status::text AS moderation_status
    FROM public.qa_questions
    WHERE id = :question_id
      AND (:allow_hidden = TRUE OR moderation_status = 'active'::qa_moderation_status)
    LIMIT 1
    `,
    {
      replacements: {
        question_id: questionId,
        allow_hidden: allowHidden,
      },
    }
  );
  if (!rows.length) {
    throw new AppError("Question introuvable", 404);
  }
  return rows[0];
};

const ensureAnswerExists = async (answerId, { allowHidden = false } = {}) => {
  const [rows] = await sequelize.query(
    `
    SELECT id, question_id, moderation_status::text AS moderation_status
    FROM public.qa_answers
    WHERE id = :answer_id
      AND (:allow_hidden = TRUE OR moderation_status = 'active'::qa_moderation_status)
    LIMIT 1
    `,
    {
      replacements: {
        answer_id: answerId,
        allow_hidden: allowHidden,
      },
    }
  );

  if (!rows.length) {
    throw new AppError("Reponse introuvable", 404);
  }

  return rows[0];
};

export const createAnswer = async ({ questionId, userId, roles = [], body, explanation = null, example = null }) => {
  const question = await ensureQuestionExists(questionId, { allowHidden: false });

  if (question.status === "closed") {
    throw new AppError("La question est fermee", 409);
  }

  await assertStudentQuota({ userId, roles, type: "answer" });

  const official = isTeacher(roles);
  if (official) {
    if (!explanation || explanation.trim().length < 50) {
      throw new AppError("Une reponse officielle exige une explication d'au moins 50 caracteres", 400);
    }
    if (!example || example.trim().length < 10) {
      throw new AppError("Une reponse officielle exige un exemple concret", 400);
    }
  }

  const [rows] = await sequelize.query(
    `
    INSERT INTO public.qa_answers (question_id, user_id, body, explanation, example, is_official)
    VALUES (:question_id, :user_id, :body, :explanation, :example, :is_official)
    RETURNING id, question_id, user_id, body, explanation, example, is_official, is_accepted, accepted_by, accepted_at, created_at, updated_at
    `,
    {
      replacements: {
        question_id: questionId,
        user_id: userId,
        body: body.trim(),
        explanation: explanation?.trim() || null,
        example: example?.trim() || null,
        is_official: official,
      },
    }
  );

  await sequelize.query(
    `
    UPDATE public.qa_questions
    SET status = CASE WHEN status = 'open'::qa_question_status THEN 'answered'::qa_question_status ELSE status END
    WHERE id = :question_id
    `,
    { replacements: { question_id: questionId } }
  );

  return rows[0];
};

export const listAnswersByQuestion = async (questionId, actor = null, includeHidden = false) => {
  const allowHidden = canViewHidden({ actor, includeHidden });
  await ensureQuestionExists(questionId, { allowHidden });

  const [rows] = await sequelize.query(
    `
    SELECT
      a.id,
      a.question_id,
      a.user_id,
      u.full_name AS user_name,
      a.body,
      a.explanation,
      a.example,
      a.is_official,
      a.is_accepted,
      a.moderation_status::text AS moderation_status,
      a.accepted_by,
      a.accepted_at,
      a.created_at,
      a.updated_at
    FROM public.qa_answers a
    INNER JOIN public.users u ON u.id = a.user_id
    WHERE a.question_id = :question_id
      AND (:allow_hidden = TRUE OR a.moderation_status = 'active'::qa_moderation_status)
    ORDER BY a.is_accepted DESC, a.is_official DESC, a.created_at ASC
    `,
    { replacements: { question_id: questionId, allow_hidden: allowHidden } }
  );

  return rows.map((row) => ({
    ...row,
    badges: toBadges(row),
  }));
};

const canAcceptAnswer = async ({ actor, questionId }) => {
  if (!actor?.id) return false;
  if (isAdmin(actor.roles || [])) return true;
  if (!isTeacher(actor.roles || [])) return false;
  return true;
};

export const acceptAnswer = async ({ answerId, actor }) => {
  const [rows] = await sequelize.query(
    `
    SELECT a.id, a.question_id, q.status::text AS question_status
    FROM public.qa_answers a
    INNER JOIN public.qa_questions q ON q.id = a.question_id
    WHERE a.id = :answer_id
    LIMIT 1
    `,
    { replacements: { answer_id: answerId } }
  );

  if (!rows.length) {
    throw new AppError("Reponse introuvable", 404);
  }

  const answer = rows[0];
  const allowed = await canAcceptAnswer({ actor, questionId: answer.question_id });
  if (!allowed) {
    throw new AppError("Acces refuse", 403);
  }

  await sequelize.query(
    `
    UPDATE public.qa_answers
    SET is_accepted = FALSE, accepted_by = NULL, accepted_at = NULL
    WHERE question_id = :question_id
      AND moderation_status = 'active'::qa_moderation_status
    `,
    { replacements: { question_id: answer.question_id } }
  );

  const [updatedRows] = await sequelize.query(
    `
    UPDATE public.qa_answers
    SET is_accepted = TRUE, accepted_by = :accepted_by, accepted_at = NOW()
    WHERE id = :answer_id
      AND moderation_status = 'active'::qa_moderation_status
    RETURNING id, question_id, user_id, is_official, is_accepted, accepted_by, accepted_at, updated_at
    `,
    {
      replacements: {
        answer_id: answerId,
        accepted_by: actor.id,
      },
    }
  );

  await sequelize.query(
    `UPDATE public.qa_questions SET status = 'answered'::qa_question_status WHERE id = :question_id`,
    { replacements: { question_id: answer.question_id } }
  );

  return updatedRows[0];
};

const validateModerationPayload = ({ status, reason }) => {
  if (!["active", "hidden", "deleted"].includes(status)) {
    throw new AppError("Statut de moderation invalide", 400);
  }

  if (status !== "active" && (!reason || reason.trim().length < 5)) {
    throw new AppError("Une raison de moderation est requise (au moins 5 caracteres)", 400);
  }
};

export const moderateQuestion = async ({ questionId, actor, status, reason }) => {
  if (!canModerate(actor?.roles || [])) {
    throw new AppError("Acces refuse", 403);
  }

  validateModerationPayload({ status, reason });

  const [rows] = await sequelize.query(
    `
    UPDATE public.qa_questions
    SET
      moderation_status = :status::qa_moderation_status,
      moderated_by = :moderated_by,
      moderated_at = CASE WHEN :status = 'active' THEN NULL ELSE NOW() END,
      moderation_reason = CASE WHEN :status = 'active' THEN NULL ELSE :reason END,
      status = CASE WHEN :status = 'active' THEN status ELSE 'closed'::qa_question_status END
    WHERE id = :question_id
    RETURNING id, moderation_status::text AS moderation_status, moderated_by, moderated_at, moderation_reason, status::text AS status
    `,
    {
      replacements: {
        question_id: questionId,
        status,
        reason: reason?.trim() || null,
        moderated_by: actor.id,
      },
    }
  );

  if (!rows.length) {
    throw new AppError("Question introuvable", 404);
  }

  return rows[0];
};

export const moderateAnswer = async ({ answerId, actor, status, reason }) => {
  if (!canModerate(actor?.roles || [])) {
    throw new AppError("Acces refuse", 403);
  }

  validateModerationPayload({ status, reason });

  const [rows] = await sequelize.query(
    `
    UPDATE public.qa_answers
    SET
      moderation_status = :status::qa_moderation_status,
      moderated_by = :moderated_by,
      moderated_at = CASE WHEN :status = 'active' THEN NULL ELSE NOW() END,
      moderation_reason = CASE WHEN :status = 'active' THEN NULL ELSE :reason END,
      is_accepted = CASE WHEN :status = 'active' THEN is_accepted ELSE FALSE END,
      accepted_by = CASE WHEN :status = 'active' THEN accepted_by ELSE NULL END,
      accepted_at = CASE WHEN :status = 'active' THEN accepted_at ELSE NULL END
    WHERE id = :answer_id
    RETURNING id, question_id, moderation_status::text AS moderation_status, moderation_reason, moderated_by, moderated_at, is_accepted
    `,
    {
      replacements: {
        answer_id: answerId,
        status,
        reason: reason?.trim() || null,
        moderated_by: actor.id,
      },
    }
  );

  if (!rows.length) {
    throw new AppError("Reponse introuvable", 404);
  }

  return rows[0];
};

export const moderateComment = async ({ commentId, actor, status, reason }) => {
  if (!canModerate(actor?.roles || [])) {
    throw new AppError("Acces refuse", 403);
  }

  validateModerationPayload({ status, reason });

  const [rows] = await sequelize.query(
    `
    UPDATE public.qa_comments
    SET
      moderation_status = :status::qa_moderation_status,
      moderated_by = :moderated_by,
      moderated_at = CASE WHEN :status = 'active' THEN NULL ELSE NOW() END,
      moderation_reason = CASE WHEN :status = 'active' THEN NULL ELSE :reason END
    WHERE id = :comment_id
    RETURNING id, question_id, answer_id, moderation_status::text AS moderation_status, moderated_by, moderated_at, moderation_reason
    `,
    {
      replacements: {
        comment_id: commentId,
        status,
        reason: reason?.trim() || null,
        moderated_by: actor.id,
      },
    }
  );

  if (!rows.length) {
    throw new AppError("Commentaire introuvable", 404);
  }

  return rows[0];
};

export const createCommentOnQuestion = async ({ questionId, userId, body }) => {
  const question = await ensureQuestionExists(questionId, { allowHidden: false });
  if (question.status === "closed") {
    throw new AppError("La question est fermee", 409);
  }

  const [rows] = await sequelize.query(
    `
    INSERT INTO public.qa_comments (question_id, user_id, body)
    VALUES (:question_id, :user_id, :body)
    RETURNING id, question_id, answer_id, user_id, body, moderation_status::text AS moderation_status, created_at, updated_at
    `,
    {
      replacements: {
        question_id: questionId,
        user_id: userId,
        body: body.trim(),
      },
    }
  );

  return rows[0];
};

export const createCommentOnAnswer = async ({ answerId, userId, body }) => {
  await ensureAnswerExists(answerId, { allowHidden: false });

  const [rows] = await sequelize.query(
    `
    INSERT INTO public.qa_comments (answer_id, user_id, body)
    VALUES (:answer_id, :user_id, :body)
    RETURNING id, question_id, answer_id, user_id, body, moderation_status::text AS moderation_status, created_at, updated_at
    `,
    {
      replacements: {
        answer_id: answerId,
        user_id: userId,
        body: body.trim(),
      },
    }
  );

  return rows[0];
};

export const listCommentsByQuestion = async (questionId, actor = null, includeHidden = false) => {
  const allowHidden = canViewHidden({ actor, includeHidden });
  await ensureQuestionExists(questionId, { allowHidden });

  const [rows] = await sequelize.query(
    `
    SELECT
      c.id,
      c.question_id,
      c.answer_id,
      c.user_id,
      u.full_name AS user_name,
      c.body,
      c.created_at,
      c.updated_at
    FROM public.qa_comments c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.question_id = :question_id
      AND (:allow_hidden = TRUE OR c.moderation_status = 'active'::qa_moderation_status)
    ORDER BY c.created_at ASC
    `,
    { replacements: { question_id: questionId, allow_hidden: allowHidden } }
  );

  return rows;
};

export const listCommentsByAnswer = async (answerId, actor = null, includeHidden = false) => {
  const allowHidden = canViewHidden({ actor, includeHidden });
  await ensureAnswerExists(answerId, { allowHidden });

  const [rows] = await sequelize.query(
    `
    SELECT
      c.id,
      c.question_id,
      c.answer_id,
      c.user_id,
      u.full_name AS user_name,
      c.body,
      c.created_at,
      c.updated_at
    FROM public.qa_comments c
    INNER JOIN public.users u ON u.id = c.user_id
    WHERE c.answer_id = :answer_id
      AND (:allow_hidden = TRUE OR c.moderation_status = 'active'::qa_moderation_status)
    ORDER BY c.created_at ASC
    `,
    { replacements: { answer_id: answerId, allow_hidden: allowHidden } }
  );

  return rows;
};
