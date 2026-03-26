BEGIN;

DO $$
DECLARE
  v_semester_id bigint;
  v_user_id uuid;
  v_resource_type_id int;
  v_module_id bigint;
  v_res_notes_id bigint;
  v_res_course_id bigint;
  v_res_exam_id bigint;
  v_res_draft_id bigint;
BEGIN
  SELECT id INTO v_semester_id
  FROM public.semesters
  ORDER BY id ASC
  LIMIT 1;

  IF v_semester_id IS NULL THEN
    RAISE EXCEPTION 'Seed failed: no semester found. Create at least one semester before running this seed.';
  END IF;

  INSERT INTO public.users (full_name, email, password_hash, is_active)
  VALUES (
    'Discover API Test Teacher',
    'discover.api.teacher@mus.local',
    '$2b$10$musdiscoverapitesthashplaceholder123456789012345678901234567890',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    is_active = true
  RETURNING id INTO v_user_id;

  INSERT INTO public.resource_types (name, slug, icon_key, allowed_formats)
  VALUES (
    'Discover Test Type',
    'discover-test-type',
    'science',
    ARRAY['pdf', 'docx', 'pptx']::text[]
  )
  ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    icon_key = EXCLUDED.icon_key,
    allowed_formats = EXCLUDED.allowed_formats
  RETURNING id INTO v_resource_type_id;

  INSERT INTO public.modules (semester_id, code, title, description)
  VALUES (
    v_semester_id,
    'DISC-API-01',
    'Discover API Filtering Module',
    'Seed module to test discover filtering by module and educational type'
  )
  ON CONFLICT (semester_id, title) DO UPDATE
  SET
    code = EXCLUDED.code,
    description = EXCLUDED.description
  RETURNING id INTO v_module_id;

  DELETE FROM public.resource_module_map
  WHERE module_id = v_module_id
    AND resource_id IN (
      SELECT id
      FROM public.resources
      WHERE created_by = v_user_id
        AND title IN (
          'DISC TEST - Notes Resource',
          'DISC TEST - Course Resource',
          'DISC TEST - Exam Resource',
          'DISC TEST - Draft Resource (Hidden)'
        )
    );

  DELETE FROM public.resources
  WHERE created_by = v_user_id
    AND title IN (
      'DISC TEST - Notes Resource',
      'DISC TEST - Course Resource',
      'DISC TEST - Exam Resource',
      'DISC TEST - Draft Resource (Hidden)'
    );

  INSERT INTO public.resources (
    title,
    description,
    status,
    language,
    license,
    created_by,
    educational_type,
    format,
    resource_type_id,
    metadata
  )
  VALUES (
    'DISC TEST - Notes Resource',
    'Published resource used to test educational_type=notes',
    'published'::public.resource_status,
    'fr',
    'CC BY-SA 4.0',
    v_user_id,
    'notes'::public.resource_educational_type,
    NULL,
    v_resource_type_id,
    '{"seed":"discover-module-type","kind":"notes"}'::jsonb
  )
  RETURNING id INTO v_res_notes_id;

  INSERT INTO public.resources (
    title,
    description,
    status,
    language,
    license,
    created_by,
    educational_type,
    format,
    resource_type_id,
    metadata
  )
  VALUES (
    'DISC TEST - Course Resource',
    'Published resource used to test educational_type=course',
    'published'::public.resource_status,
    'fr',
    'CC BY-SA 4.0',
    v_user_id,
    'course'::public.resource_educational_type,
    NULL,
    v_resource_type_id,
    '{"seed":"discover-module-type","kind":"course"}'::jsonb
  )
  RETURNING id INTO v_res_course_id;

  INSERT INTO public.resources (
    title,
    description,
    status,
    language,
    license,
    created_by,
    educational_type,
    format,
    resource_type_id,
    metadata
  )
  VALUES (
    'DISC TEST - Exam Resource',
    'Published resource used to test educational_type=exam',
    'published'::public.resource_status,
    'fr',
    'CC BY-SA 4.0',
    v_user_id,
    'exam'::public.resource_educational_type,
    NULL,
    v_resource_type_id,
    '{"seed":"discover-module-type","kind":"exam"}'::jsonb
  )
  RETURNING id INTO v_res_exam_id;

  INSERT INTO public.resources (
    title,
    description,
    status,
    language,
    license,
    created_by,
    educational_type,
    format,
    resource_type_id,
    metadata
  )
  VALUES (
    'DISC TEST - Draft Resource (Hidden)',
    'Draft resource should not appear for non-admin discover users',
    'draft'::public.resource_status,
    'fr',
    'CC BY-SA 4.0',
    v_user_id,
    'notes'::public.resource_educational_type,
    NULL,
    v_resource_type_id,
    '{"seed":"discover-module-type","kind":"draft-hidden"}'::jsonb
  )
  RETURNING id INTO v_res_draft_id;

  INSERT INTO public.resource_module_map (module_id, resource_id, chapter, exam_related)
  VALUES
    (v_module_id, v_res_notes_id, 'Chapter 1', false),
    (v_module_id, v_res_course_id, 'Chapter 2', false),
    (v_module_id, v_res_exam_id, 'Final Revision', true),
    (v_module_id, v_res_draft_id, 'Draft Section', false)
  ON CONFLICT (module_id, resource_id) DO UPDATE
  SET
    chapter = EXCLUDED.chapter,
    exam_related = EXCLUDED.exam_related;
END;
$$;

COMMIT;
