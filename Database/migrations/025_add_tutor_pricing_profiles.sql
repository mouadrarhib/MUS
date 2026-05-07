-- 025_add_tutor_pricing_profiles.sql
-- Tutor pricing profiles for teacher/contributor tutoring sessions

CREATE TABLE IF NOT EXISTS public.tutor_pricing_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  base_rate_per_hour numeric(10,2) NOT NULL DEFAULT 25.00,
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tutor_pricing_profiles_base_rate_non_negative CHECK (base_rate_per_hour >= 0),
  CONSTRAINT tutor_pricing_profiles_currency_len CHECK (length(trim(currency)) BETWEEN 3 AND 8)
);

CREATE INDEX IF NOT EXISTS idx_tutor_pricing_profiles_active
  ON public.tutor_pricing_profiles (is_active);

CREATE TRIGGER trg_tutor_pricing_profiles_set_updated_at
BEFORE UPDATE ON public.tutor_pricing_profiles
FOR EACH ROW
EXECUTE FUNCTION public.sp_teacher_session_set_updated_at();
