BEGIN;

INSERT INTO public.tags (name, slug, category, description, created_by, is_active)
VALUES
  (
    'Lecture Notes',
    'lecture-notes',
    'study-material',
    'Structured notes shared by students or teachers to review key module content.',
    NULL,
    TRUE
  ),
  (
    'Past Exams',
    'past-exams',
    'assessment',
    'Previous exam papers and assessment resources used for preparation and revision.',
    NULL,
    TRUE
  ),
  (
    'Solved Exercises',
    'solved-exercises',
    'practice',
    'Worked exercises and corrected problem sets that help students practice efficiently.',
    NULL,
    TRUE
  ),
  (
    'Module Summary',
    'module-summary',
    'revision',
    'Concise summaries that synthesize the most important concepts of a module.',
    NULL,
    TRUE
  ),
  (
    'Lab Reports',
    'lab-reports',
    'practical',
    'Practical work, lab reports, and applied resources linked to coursework and experiments.',
    NULL,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  is_active = TRUE,
  updated_at = NOW();

COMMIT;
