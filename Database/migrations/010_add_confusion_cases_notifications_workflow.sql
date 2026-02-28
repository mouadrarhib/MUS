-- ============================================================================
-- 010_add_confusion_cases_notifications_workflow.sql
-- Adds confusion case workflow, module referents and in-app notifications.
-- ============================================================================

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confusion_case_status') THEN
    CREATE TYPE public.confusion_case_status AS ENUM
      ('nouveau', 'assigne', 'en_cours', 'repondu_officiel', 'resolu');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confusion_case_priority') THEN
    CREATE TYPE public.confusion_case_priority AS ENUM ('basse', 'normale', 'haute', 'critique');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.module_staff_assignments (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assignment_role TEXT NOT NULL CHECK (assignment_role IN ('teacher_referent', 'admin_referent')),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, user_id, assignment_role)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_module_staff_primary_active
  ON public.module_staff_assignments(module_id, assignment_role)
  WHERE is_primary = TRUE AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_module_staff_module_role_active
  ON public.module_staff_assignments(module_id, assignment_role, is_active);

CREATE TABLE IF NOT EXISTS public.resource_confusion_cases (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  module_id BIGINT NOT NULL REFERENCES public.modules(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status public.confusion_case_status NOT NULL DEFAULT 'nouveau',
  priority public.confusion_case_priority NOT NULL DEFAULT 'normale',
  assigned_to_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_by_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  official_answer_id BIGINT NULL REFERENCES public.qa_answers(id) ON DELETE SET NULL,
  first_signal_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_signal_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_confusion_case_open
  ON public.resource_confusion_cases(student_id, resource_id, module_id)
  WHERE status <> 'resolu'::public.confusion_case_status;

CREATE INDEX IF NOT EXISTS idx_confusion_cases_module_status_updated
  ON public.resource_confusion_cases(module_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_confusion_cases_assignee_status_updated
  ON public.resource_confusion_cases(assigned_to_user_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_confusion_cases_student_updated
  ON public.resource_confusion_cases(student_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.resource_confusion_case_events (
  id BIGSERIAL PRIMARY KEY,
  case_id BIGINT NOT NULL REFERENCES public.resource_confusion_cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'case_created',
      'signal_attached',
      'auto_assigned',
      'admin_assigned',
      'status_changed',
      'official_answer_linked',
      'resolved',
      'reopened'
    )
  ),
  actor_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  payload JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confusion_case_events_case_created
  ON public.resource_confusion_case_events(case_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread_created
  ON public.user_notifications(recipient_user_id, is_read, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_confusion_case_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_confusion_cases_set_updated_at ON public.resource_confusion_cases;
CREATE TRIGGER trg_confusion_cases_set_updated_at
BEFORE UPDATE ON public.resource_confusion_cases
FOR EACH ROW
EXECUTE FUNCTION public.set_confusion_case_updated_at();

-- Procedures (kept in sync with Database/procedures/confusion_workflow.sql)

CREATE OR REPLACE FUNCTION public.sp_confusion_pick_assignee(
  p_module_id BIGINT
)
RETURNS TABLE(
  assignee_user_id UUID,
  assignment_source TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT msa.user_id, 1 AS priority, 'teacher_primary'::text AS source
    FROM public.module_staff_assignments msa
    WHERE msa.module_id = p_module_id
      AND msa.assignment_role = 'teacher_referent'
      AND msa.is_active = TRUE
      AND msa.is_primary = TRUE
    UNION ALL
    SELECT msa.user_id, 2 AS priority, 'teacher_referent'::text AS source
    FROM public.module_staff_assignments msa
    WHERE msa.module_id = p_module_id
      AND msa.assignment_role = 'teacher_referent'
      AND msa.is_active = TRUE
    UNION ALL
    SELECT msa.user_id, 3 AS priority, 'admin_primary'::text AS source
    FROM public.module_staff_assignments msa
    WHERE msa.module_id = p_module_id
      AND msa.assignment_role = 'admin_referent'
      AND msa.is_active = TRUE
      AND msa.is_primary = TRUE
    UNION ALL
    SELECT msa.user_id, 4 AS priority, 'admin_referent'::text AS source
    FROM public.module_staff_assignments msa
    WHERE msa.module_id = p_module_id
      AND msa.assignment_role = 'admin_referent'
      AND msa.is_active = TRUE
    UNION ALL
    SELECT u.id AS user_id, 5 AS priority, 'admin_pool'::text AS source
    FROM public.users u
    INNER JOIN public.user_roles ur ON ur.user_id = u.id
    INNER JOIN public.roles r ON r.id = ur.role_id
    WHERE u.is_active = TRUE
      AND r.name = 'admin'
  )
  SELECT c.user_id, c.source
  FROM candidates c
  ORDER BY c.priority ASC, c.user_id ASC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_signal_create_and_assign(
  p_resource_id BIGINT,
  p_module_id BIGINT,
  p_user_id UUID,
  p_note TEXT DEFAULT NULL,
  p_anti_spam_minutes INT DEFAULT 120
)
RETURNS TABLE(
  signal_id BIGINT,
  resource_id BIGINT,
  module_id BIGINT,
  user_id UUID,
  note TEXT,
  signal_created_at TIMESTAMPTZ,
  case_id BIGINT,
  case_status TEXT,
  assigned_to_user_id UUID,
  assignment_source TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_case_id BIGINT;
  v_case_status public.confusion_case_status;
  v_assignee UUID;
  v_source TEXT;
  v_signal_id BIGINT;
  v_signal_created_at TIMESTAMPTZ;
  v_existing_case BOOLEAN := FALSE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.resource_module_map rmm
    WHERE rmm.resource_id = p_resource_id
      AND rmm.module_id = p_module_id
  ) THEN
    RAISE EXCEPTION 'La ressource doit etre liee au module selectionne';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.resource_confusion_signals rcs
    WHERE rcs.user_id = p_user_id
      AND rcs.resource_id = p_resource_id
      AND rcs.created_at >= NOW() - make_interval(mins => p_anti_spam_minutes)
  ) THEN
    RAISE EXCEPTION 'Vous avez deja envoye un signal recemment pour cette ressource. Reessayez dans 2 heures.';
  END IF;

  INSERT INTO public.resource_confusion_signals(resource_id, user_id, note)
  VALUES (p_resource_id, p_user_id, NULLIF(TRIM(p_note), ''))
  RETURNING id, created_at INTO v_signal_id, v_signal_created_at;

  SELECT c.id, c.status
  INTO v_case_id, v_case_status
  FROM public.resource_confusion_cases c
  WHERE c.student_id = p_user_id
    AND c.resource_id = p_resource_id
    AND c.module_id = p_module_id
    AND c.status <> 'resolu'::public.confusion_case_status
  ORDER BY c.updated_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_case_id IS NULL THEN
    INSERT INTO public.resource_confusion_cases(resource_id, module_id, student_id, status, first_signal_at, last_signal_at)
    VALUES (p_resource_id, p_module_id, p_user_id, 'nouveau'::public.confusion_case_status, NOW(), NOW())
    RETURNING id, status INTO v_case_id, v_case_status;

    INSERT INTO public.resource_confusion_case_events(case_id, event_type, actor_user_id, payload)
    VALUES (v_case_id, 'case_created', p_user_id, jsonb_build_object('signal_id', v_signal_id));
  ELSE
    v_existing_case := TRUE;
    UPDATE public.resource_confusion_cases
    SET last_signal_at = NOW(), updated_at = NOW()
    WHERE id = v_case_id;

    INSERT INTO public.resource_confusion_case_events(case_id, event_type, actor_user_id, payload)
    VALUES (v_case_id, 'signal_attached', p_user_id, jsonb_build_object('signal_id', v_signal_id));
  END IF;

  SELECT c.assigned_to_user_id INTO v_assignee
  FROM public.resource_confusion_cases c
  WHERE c.id = v_case_id;

  IF v_assignee IS NULL THEN
    SELECT p.assignee_user_id, p.assignment_source
    INTO v_assignee, v_source
    FROM public.sp_confusion_pick_assignee(p_module_id) p
    LIMIT 1;

    IF v_assignee IS NOT NULL THEN
      UPDATE public.resource_confusion_cases
      SET assigned_to_user_id = v_assignee,
          assigned_by_user_id = NULL,
          status = CASE WHEN status = 'nouveau'::public.confusion_case_status THEN 'assigne'::public.confusion_case_status ELSE status END,
          updated_at = NOW()
      WHERE id = v_case_id;

      INSERT INTO public.resource_confusion_case_events(case_id, event_type, actor_user_id, payload)
      VALUES (v_case_id, 'auto_assigned', NULL, jsonb_build_object('assigned_to_user_id', v_assignee, 'source', v_source));

      SELECT c.status INTO v_case_status
      FROM public.resource_confusion_cases c
      WHERE c.id = v_case_id;
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    v_signal_id,
    p_resource_id,
    p_module_id,
    p_user_id,
    NULLIF(TRIM(p_note), ''),
    v_signal_created_at,
    v_case_id,
    v_case_status::text,
    v_assignee,
    COALESCE(v_source, CASE WHEN v_existing_case THEN 'already_assigned' ELSE NULL END);
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_case_get_by_id(p_case_id BIGINT)
RETURNS TABLE(
  id BIGINT,
  resource_id BIGINT,
  resource_title TEXT,
  module_id BIGINT,
  module_code TEXT,
  module_title TEXT,
  student_id UUID,
  student_name TEXT,
  status TEXT,
  priority TEXT,
  assigned_to_user_id UUID,
  assigned_to_name TEXT,
  official_answer_id BIGINT,
  first_signal_at TIMESTAMPTZ,
  last_signal_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.resource_id, r.title, c.module_id, m.code, m.title, c.student_id, su.full_name,
         c.status::text, c.priority::text, c.assigned_to_user_id, au.full_name, c.official_answer_id,
         c.first_signal_at, c.last_signal_at, c.resolved_at, c.created_at, c.updated_at
  FROM public.resource_confusion_cases c
  INNER JOIN public.resources r ON r.id = c.resource_id
  INNER JOIN public.modules m ON m.id = c.module_id
  INNER JOIN public.users su ON su.id = c.student_id
  LEFT JOIN public.users au ON au.id = c.assigned_to_user_id
  WHERE c.id = p_case_id
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_cases_get_for_student(
  p_student_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit_value INT DEFAULT 20,
  p_offset_value INT DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  resource_id BIGINT,
  resource_title TEXT,
  module_id BIGINT,
  module_code TEXT,
  module_title TEXT,
  status TEXT,
  priority TEXT,
  assigned_to_user_id UUID,
  assigned_to_name TEXT,
  official_answer_id BIGINT,
  first_signal_at TIMESTAMPTZ,
  last_signal_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.resource_id, r.title, c.module_id, m.code, m.title,
         c.status::text, c.priority::text, c.assigned_to_user_id, au.full_name,
         c.official_answer_id, c.first_signal_at, c.last_signal_at, c.resolved_at, c.created_at, c.updated_at
  FROM public.resource_confusion_cases c
  INNER JOIN public.resources r ON r.id = c.resource_id
  INNER JOIN public.modules m ON m.id = c.module_id
  LEFT JOIN public.users au ON au.id = c.assigned_to_user_id
  WHERE c.student_id = p_student_id
    AND (p_status IS NULL OR c.status::text = p_status)
  ORDER BY c.updated_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 20), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_cases_get_for_staff(
  p_actor_user_id UUID,
  p_is_admin BOOLEAN,
  p_status TEXT DEFAULT NULL,
  p_module_id BIGINT DEFAULT NULL,
  p_assigned_to_me BOOLEAN DEFAULT FALSE,
  p_limit_value INT DEFAULT 20,
  p_offset_value INT DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  resource_id BIGINT,
  resource_title TEXT,
  module_id BIGINT,
  module_code TEXT,
  module_title TEXT,
  student_id UUID,
  student_name TEXT,
  status TEXT,
  priority TEXT,
  assigned_to_user_id UUID,
  assigned_to_name TEXT,
  official_answer_id BIGINT,
  first_signal_at TIMESTAMPTZ,
  last_signal_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.resource_id, r.title, c.module_id, m.code, m.title,
         c.student_id, su.full_name, c.status::text, c.priority::text,
         c.assigned_to_user_id, au.full_name, c.official_answer_id,
         c.first_signal_at, c.last_signal_at, c.resolved_at, c.created_at, c.updated_at
  FROM public.resource_confusion_cases c
  INNER JOIN public.resources r ON r.id = c.resource_id
  INNER JOIN public.modules m ON m.id = c.module_id
  INNER JOIN public.users su ON su.id = c.student_id
  LEFT JOIN public.users au ON au.id = c.assigned_to_user_id
  WHERE (p_status IS NULL OR c.status::text = p_status)
    AND (p_module_id IS NULL OR c.module_id = p_module_id)
    AND (
      p_is_admin = TRUE
      OR c.assigned_to_user_id = p_actor_user_id
      OR EXISTS (
        SELECT 1
        FROM public.module_staff_assignments msa
        WHERE msa.module_id = c.module_id
          AND msa.user_id = p_actor_user_id
          AND msa.assignment_role = 'teacher_referent'
          AND msa.is_active = TRUE
      )
    )
    AND (p_assigned_to_me = FALSE OR c.assigned_to_user_id = p_actor_user_id)
  ORDER BY c.priority DESC, c.updated_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 20), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_case_assign(
  p_case_id BIGINT,
  p_assignee_user_id UUID,
  p_assigned_by_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  status TEXT,
  assigned_to_user_id UUID,
  assigned_by_user_id UUID,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.resource_confusion_cases c
  SET assigned_to_user_id = p_assignee_user_id,
      assigned_by_user_id = p_assigned_by_user_id,
      status = CASE WHEN c.status = 'nouveau'::public.confusion_case_status THEN 'assigne'::public.confusion_case_status ELSE c.status END,
      updated_at = NOW()
  WHERE c.id = p_case_id
  RETURNING c.id, c.status::text, c.assigned_to_user_id, c.assigned_by_user_id, c.updated_at;

  IF FOUND THEN
    INSERT INTO public.resource_confusion_case_events(case_id, event_type, actor_user_id, payload)
    VALUES (p_case_id, 'admin_assigned', p_assigned_by_user_id, jsonb_build_object('assigned_to_user_id', p_assignee_user_id, 'reason', NULLIF(TRIM(p_reason), '')));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_case_update_status(
  p_case_id BIGINT,
  p_status TEXT,
  p_actor_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  status TEXT,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_status public.confusion_case_status;
BEGIN
  v_status := p_status::public.confusion_case_status;

  RETURN QUERY
  UPDATE public.resource_confusion_cases c
  SET status = v_status,
      resolved_at = CASE
        WHEN v_status = 'resolu'::public.confusion_case_status THEN NOW()
        WHEN c.status = 'resolu'::public.confusion_case_status AND v_status <> 'resolu'::public.confusion_case_status THEN NULL
        ELSE c.resolved_at
      END,
      updated_at = NOW()
  WHERE c.id = p_case_id
  RETURNING c.id, c.status::text, c.resolved_at, c.updated_at;

  IF FOUND THEN
    INSERT INTO public.resource_confusion_case_events(case_id, event_type, actor_user_id, payload)
    VALUES (
      p_case_id,
      CASE WHEN v_status = 'resolu'::public.confusion_case_status THEN 'resolved' ELSE 'status_changed' END,
      p_actor_user_id,
      jsonb_build_object('status', p_status, 'reason', NULLIF(TRIM(p_reason), ''))
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_confusion_case_link_official_answer(
  p_question_id BIGINT,
  p_answer_id BIGINT,
  p_actor_user_id UUID
)
RETURNS TABLE(
  case_id BIGINT,
  student_id UUID,
  status TEXT,
  official_answer_id BIGINT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH target_case AS (
    SELECT c.id
    FROM public.resource_confusion_cases c
    INNER JOIN public.qa_questions q
      ON q.id = p_question_id
     AND q.user_id = c.student_id
     AND q.resource_id = c.resource_id
     AND q.module_id = c.module_id
    WHERE c.status <> 'resolu'::public.confusion_case_status
    ORDER BY c.updated_at DESC
    LIMIT 1
  )
  UPDATE public.resource_confusion_cases c
  SET official_answer_id = p_answer_id,
      status = CASE WHEN c.status = 'resolu'::public.confusion_case_status THEN c.status ELSE 'repondu_officiel'::public.confusion_case_status END,
      updated_at = NOW()
  WHERE c.id IN (SELECT id FROM target_case)
  RETURNING c.id, c.student_id, c.status::text, c.official_answer_id, c.updated_at;

  IF FOUND THEN
    INSERT INTO public.resource_confusion_case_events(case_id, event_type, actor_user_id, payload)
    SELECT c.id, 'official_answer_linked', p_actor_user_id, jsonb_build_object('question_id', p_question_id, 'answer_id', p_answer_id)
    FROM public.resource_confusion_cases c
    WHERE c.id IN (
      SELECT c2.id
      FROM public.resource_confusion_cases c2
      INNER JOIN public.qa_questions q
        ON q.id = p_question_id
       AND q.user_id = c2.student_id
       AND q.resource_id = c2.resource_id
       AND q.module_id = c2.module_id
      ORDER BY c2.updated_at DESC
      LIMIT 1
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_create(
  p_recipient_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_payload JSONB DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  recipient_user_id UUID,
  type TEXT,
  title TEXT,
  body TEXT,
  payload JSONB,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.user_notifications(recipient_user_id, type, title, body, payload)
  VALUES (p_recipient_user_id, TRIM(p_type), TRIM(p_title), TRIM(p_body), p_payload)
  RETURNING
    public.user_notifications.id,
    public.user_notifications.recipient_user_id,
    public.user_notifications.type,
    public.user_notifications.title,
    public.user_notifications.body,
    public.user_notifications.payload,
    public.user_notifications.is_read,
    public.user_notifications.read_at,
    public.user_notifications.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_get_for_user(
  p_recipient_user_id UUID,
  p_unread_only BOOLEAN DEFAULT FALSE,
  p_limit_value INT DEFAULT 20,
  p_offset_value INT DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  type TEXT,
  title TEXT,
  body TEXT,
  payload JSONB,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.type, n.title, n.body, n.payload, n.is_read, n.read_at, n.created_at
  FROM public.user_notifications n
  WHERE n.recipient_user_id = p_recipient_user_id
    AND (p_unread_only = FALSE OR n.is_read = FALSE)
  ORDER BY n.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit_value, 20), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_notification_mark_read(
  p_notification_id BIGINT,
  p_recipient_user_id UUID
)
RETURNS TABLE(
  id BIGINT,
  is_read BOOLEAN,
  read_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.user_notifications n
  SET is_read = TRUE,
      read_at = NOW()
  WHERE n.id = p_notification_id
    AND n.recipient_user_id = p_recipient_user_id
  RETURNING n.id, n.is_read, n.read_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_module_staff_assignment_upsert(
  p_module_id BIGINT,
  p_user_id UUID,
  p_assignment_role TEXT,
  p_is_primary BOOLEAN DEFAULT FALSE,
  p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  id BIGINT,
  module_id BIGINT,
  user_id UUID,
  assignment_role TEXT,
  is_primary BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_is_primary THEN
    UPDATE public.module_staff_assignments msa
    SET is_primary = FALSE
    WHERE msa.module_id = p_module_id
      AND msa.assignment_role = p_assignment_role
      AND msa.is_active = TRUE;
  END IF;

  RETURN QUERY
  INSERT INTO public.module_staff_assignments(module_id, user_id, assignment_role, is_primary, is_active)
  VALUES (p_module_id, p_user_id, p_assignment_role, p_is_primary, p_is_active)
  ON CONFLICT ON CONSTRAINT module_staff_assignments_module_id_user_id_assignment_role_key
  DO UPDATE SET is_primary = EXCLUDED.is_primary,
                is_active = EXCLUDED.is_active
  RETURNING
    public.module_staff_assignments.id,
    public.module_staff_assignments.module_id,
    public.module_staff_assignments.user_id,
    public.module_staff_assignments.assignment_role,
    public.module_staff_assignments.is_primary,
    public.module_staff_assignments.is_active,
    public.module_staff_assignments.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.sp_module_staff_assignment_get_by_module(
  p_module_id BIGINT
)
RETURNS TABLE(
  id BIGINT,
  module_id BIGINT,
  user_id UUID,
  user_name TEXT,
  assignment_role TEXT,
  is_primary BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT msa.id, msa.module_id, msa.user_id, u.full_name,
         msa.assignment_role, msa.is_primary, msa.is_active, msa.created_at
  FROM public.module_staff_assignments msa
  INNER JOIN public.users u ON u.id = msa.user_id
  WHERE msa.module_id = p_module_id
  ORDER BY msa.assignment_role ASC, msa.is_primary DESC, msa.created_at ASC;
END;
$$;

COMMIT;
