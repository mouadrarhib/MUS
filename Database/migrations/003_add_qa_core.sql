-- ============================================================================
-- 003_add_qa_core.sql
-- Adds Q&A core tables for questions and answers.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'qa_question_status') THEN
    CREATE TYPE public.qa_question_status AS ENUM ('open', 'answered', 'closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'qa_moderation_status') THEN
    CREATE TYPE public.qa_moderation_status AS ENUM ('active', 'hidden', 'deleted');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.qa_questions (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES public.modules(id) ON DELETE RESTRICT,
  resource_id BIGINT NULL REFERENCES public.resources(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  status public.qa_question_status NOT NULL DEFAULT 'open',
  moderation_status public.qa_moderation_status NOT NULL DEFAULT 'active',
  moderated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ NULL,
  moderation_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT qa_questions_title_length CHECK (char_length(trim(title)) >= 5),
  CONSTRAINT qa_questions_body_length CHECK (char_length(trim(body)) >= 10),
  CONSTRAINT qa_questions_moderation_reason_check CHECK (
    moderation_status = 'active'::qa_moderation_status
    OR moderation_reason IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.qa_answers (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES public.qa_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  explanation TEXT NULL,
  example TEXT NULL,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ NULL,
  moderation_status public.qa_moderation_status NOT NULL DEFAULT 'active',
  moderated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ NULL,
  moderation_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT qa_answers_body_length CHECK (char_length(trim(body)) >= 10),
  CONSTRAINT qa_official_requires_explanation CHECK (
    NOT is_official OR (explanation IS NOT NULL AND char_length(trim(explanation)) >= 50)
  ),
  CONSTRAINT qa_official_requires_example CHECK (
    NOT is_official OR (example IS NOT NULL AND char_length(trim(example)) >= 10)
  ),
  CONSTRAINT qa_answers_moderation_reason_check CHECK (
    moderation_status = 'active'::qa_moderation_status
    OR moderation_reason IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.qa_comments (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NULL REFERENCES public.qa_questions(id) ON DELETE CASCADE,
  answer_id BIGINT NULL REFERENCES public.qa_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  moderation_status public.qa_moderation_status NOT NULL DEFAULT 'active',
  moderated_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMPTZ NULL,
  moderation_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT qa_comments_target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL)
    OR (question_id IS NULL AND answer_id IS NOT NULL)
  ),
  CONSTRAINT qa_comments_body_length CHECK (char_length(trim(body)) >= 2),
  CONSTRAINT qa_comments_moderation_reason_check CHECK (
    moderation_status = 'active'::qa_moderation_status
    OR moderation_reason IS NOT NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_qa_answers_one_accepted_per_question
  ON public.qa_answers(question_id)
  WHERE is_accepted = TRUE;

CREATE INDEX IF NOT EXISTS idx_qa_questions_module_id ON public.qa_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_qa_questions_resource_id ON public.qa_questions(resource_id);
CREATE INDEX IF NOT EXISTS idx_qa_questions_user_id ON public.qa_questions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_questions_status ON public.qa_questions(status);
CREATE INDEX IF NOT EXISTS idx_qa_questions_moderation_status ON public.qa_questions(moderation_status);
CREATE INDEX IF NOT EXISTS idx_qa_questions_created_at ON public.qa_questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_answers_question_id ON public.qa_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_qa_answers_user_id ON public.qa_answers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_answers_is_official ON public.qa_answers(is_official);
CREATE INDEX IF NOT EXISTS idx_qa_answers_moderation_status ON public.qa_answers(moderation_status);
CREATE INDEX IF NOT EXISTS idx_qa_answers_created_at ON public.qa_answers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qa_comments_question_id ON public.qa_comments(question_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_qa_comments_answer_id ON public.qa_comments(answer_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_qa_comments_user_id ON public.qa_comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_comments_moderation_status ON public.qa_comments(moderation_status);

CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qa_questions_set_updated_at ON public.qa_questions;
CREATE TRIGGER trg_qa_questions_set_updated_at
BEFORE UPDATE ON public.qa_questions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_qa_answers_set_updated_at ON public.qa_answers;
CREATE TRIGGER trg_qa_answers_set_updated_at
BEFORE UPDATE ON public.qa_answers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_qa_comments_set_updated_at ON public.qa_comments;
CREATE TRIGGER trg_qa_comments_set_updated_at
BEFORE UPDATE ON public.qa_comments
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_column();
