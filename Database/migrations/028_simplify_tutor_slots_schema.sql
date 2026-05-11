-- ============================================================================
-- 028_simplify_tutor_slots_schema.sql
-- Simplify tutor slots by using direct Date, Time, Duration, and Price columns
-- ============================================================================

BEGIN;

-- 1. Add new columns as nullable initially
ALTER TABLE public.teacher_availability_slots
  ADD COLUMN IF NOT EXISTS available_date DATE,
  ADD COLUMN IF NOT EXISTS available_time TIME,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0.00;

-- 2. Migrate existing slot data (if any)
UPDATE public.teacher_availability_slots
SET
  available_date = (start_at AT TIME ZONE timezone)::date,
  available_time = (start_at AT TIME ZONE timezone)::time,
  duration_minutes = COALESCE(ROUND(EXTRACT(EPOCH FROM (end_at - start_at))/60)::integer, 60),
  price = 25.00 * (COALESCE(EXTRACT(EPOCH FROM (end_at - start_at))/3600.00, 1.00));

-- 3. Set columns as NOT NULL and add constraints
ALTER TABLE public.teacher_availability_slots
  ALTER COLUMN available_date SET NOT NULL,
  ALTER COLUMN available_time SET NOT NULL,
  ALTER COLUMN duration_minutes SET NOT NULL,
  ALTER COLUMN price SET NOT NULL;

ALTER TABLE public.teacher_availability_slots
  DROP CONSTRAINT IF EXISTS teacher_slots_duration_check,
  DROP CONSTRAINT IF EXISTS teacher_slots_price_check;

ALTER TABLE public.teacher_availability_slots
  ADD CONSTRAINT teacher_slots_duration_check CHECK (duration_minutes > 0),
  ADD CONSTRAINT teacher_slots_price_check CHECK (price >= 0);

-- 4. Create trigger function to auto-update start_at and end_at from simplified columns
CREATE OR REPLACE FUNCTION public.trg_fn_teacher_slots_sync_timestamps()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Compute UTC start_at from local date and time in the slot's timezone
  NEW.start_at := (NEW.available_date + NEW.available_time) AT TIME ZONE NEW.timezone;
  -- Compute end_at
  NEW.end_at := NEW.start_at + (NEW.duration_minutes * INTERVAL '1 minute');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;

-- 5. Attach trigger
DROP TRIGGER IF EXISTS trg_teacher_slots_sync_timestamps ON public.teacher_availability_slots;
CREATE TRIGGER trg_teacher_slots_sync_timestamps
BEFORE INSERT OR UPDATE ON public.teacher_availability_slots
FOR EACH ROW
EXECUTE FUNCTION public.trg_fn_teacher_slots_sync_timestamps();

-- 5.5 Drop functions before re-creation to allow return type changes
DROP FUNCTION IF EXISTS public.sp_teacher_slot_create(UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT);
DROP FUNCTION IF EXISTS public.sp_teacher_slot_create(UUID, DATE, TIME, INTEGER, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.sp_teacher_slot_update(BIGINT, UUID, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.sp_teacher_slot_update(BIGINT, UUID, DATE, TIME, INTEGER, NUMERIC, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.sp_teacher_slot_get_by_teacher(UUID, BOOLEAN);
DROP FUNCTION IF EXISTS public.sp_teacher_slot_get_bookable(UUID, TIMESTAMPTZ, INTEGER, INTEGER);

-- 6. Re-create sp_teacher_slot_create
CREATE OR REPLACE FUNCTION public.sp_teacher_slot_create(
  p_teacher_id UUID,
  p_available_date DATE,
  p_available_time TIME,
  p_duration_minutes INTEGER,
  p_price NUMERIC,
  p_timezone TEXT DEFAULT 'Africa/Casablanca'
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  available_date DATE,
  available_time TIME,
  duration_minutes INTEGER,
  price NUMERIC,
  timezone TEXT,
  is_active BOOLEAN,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
DECLARE
  v_start_at TIMESTAMPTZ;
  v_end_at TIMESTAMPTZ;
BEGIN
  IF p_available_date IS NULL OR p_available_time IS NULL THEN
    RAISE EXCEPTION 'available_date and available_time are required';
  END IF;

  IF p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'duration_minutes must be greater than 0';
  END IF;

  IF p_price IS NULL OR p_price < 0 THEN
    RAISE EXCEPTION 'price must be a non-negative number';
  END IF;

  -- The BEFORE INSERT trigger will overwrite start_at/end_at but we set them here for the RETURNING clause in plpgsql
  v_start_at := (p_available_date + p_available_time) AT TIME ZONE COALESCE(NULLIF(btrim(p_timezone), ''), 'Africa/Casablanca');
  v_end_at := v_start_at + (p_duration_minutes * INTERVAL '1 minute');

  RETURN QUERY
  INSERT INTO public.teacher_availability_slots (
    teacher_id, 
    available_date, 
    available_time, 
    duration_minutes, 
    price, 
    timezone, 
    start_at, 
    end_at
  )
  VALUES (
    p_teacher_id, 
    p_available_date, 
    p_available_time, 
    p_duration_minutes, 
    p_price, 
    COALESCE(NULLIF(btrim(p_timezone), ''), 'Africa/Casablanca'),
    v_start_at,
    v_end_at
  )
  RETURNING
    teacher_availability_slots.id,
    teacher_availability_slots.teacher_id,
    teacher_availability_slots.available_date,
    teacher_availability_slots.available_time,
    teacher_availability_slots.duration_minutes,
    teacher_availability_slots.price,
    teacher_availability_slots.timezone,
    teacher_availability_slots.is_active,
    teacher_availability_slots.start_at,
    teacher_availability_slots.end_at,
    teacher_availability_slots.created_at,
    teacher_availability_slots.updated_at;
END;
$function$;

-- 7. Re-create sp_teacher_slot_update
CREATE OR REPLACE FUNCTION public.sp_teacher_slot_update(
  p_slot_id BIGINT,
  p_teacher_id UUID,
  p_available_date DATE,
  p_available_time TIME,
  p_duration_minutes INTEGER,
  p_price NUMERIC,
  p_timezone TEXT,
  p_is_active BOOLEAN
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  available_date DATE,
  available_time TIME,
  duration_minutes INTEGER,
  price NUMERIC,
  timezone TEXT,
  is_active BOOLEAN,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  UPDATE public.teacher_availability_slots s
  SET
    available_date = COALESCE(p_available_date, s.available_date),
    available_time = COALESCE(p_available_time, s.available_time),
    duration_minutes = COALESCE(p_duration_minutes, s.duration_minutes),
    price = COALESCE(p_price, s.price),
    timezone = COALESCE(NULLIF(btrim(p_timezone), ''), s.timezone),
    is_active = COALESCE(p_is_active, s.is_active)
  WHERE s.id = p_slot_id
    AND s.teacher_id = p_teacher_id
  RETURNING 
    s.id, 
    s.teacher_id, 
    s.available_date, 
    s.available_time, 
    s.duration_minutes, 
    s.price, 
    s.timezone, 
    s.is_active, 
    s.start_at, 
    s.end_at, 
    s.created_at, 
    s.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found for teacher';
  END IF;
END;
$function$;

-- 8. Re-create sp_teacher_slot_get_by_teacher
CREATE OR REPLACE FUNCTION public.sp_teacher_slot_get_by_teacher(
  p_teacher_id UUID,
  p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  available_date DATE,
  available_time TIME,
  duration_minutes INTEGER,
  price NUMERIC,
  timezone TEXT,
  is_active BOOLEAN,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_booked BOOLEAN
)
LANGUAGE sql
AS $function$
  SELECT
    s.id,
    s.teacher_id,
    s.available_date,
    s.available_time,
    s.duration_minutes,
    s.price,
    s.timezone,
    s.is_active,
    s.start_at,
    s.end_at,
    s.created_at,
    s.updated_at,
    EXISTS (
      SELECT 1
      FROM public.teacher_session_bookings b
      WHERE b.slot_id = s.id
        AND b.status = 'confirmed'
    ) AS is_booked
  FROM public.teacher_availability_slots s
  WHERE s.teacher_id = p_teacher_id
    AND (p_include_inactive = TRUE OR s.is_active = TRUE)
  ORDER BY s.available_date ASC, s.available_time ASC;
$function$;

-- 9. Re-create sp_teacher_slot_get_bookable
CREATE OR REPLACE FUNCTION public.sp_teacher_slot_get_bookable(
  p_teacher_id UUID DEFAULT NULL,
  p_start_from TIMESTAMPTZ DEFAULT NOW(),
  p_limit_value INTEGER DEFAULT 50,
  p_offset_value INTEGER DEFAULT 0
)
RETURNS TABLE(
  id BIGINT,
  teacher_id UUID,
  teacher_name TEXT,
  available_date DATE,
  available_time TIME,
  duration_minutes INTEGER,
  price NUMERIC,
  timezone TEXT,
  is_active BOOLEAN,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ
)
LANGUAGE sql
AS $function$
  SELECT
    s.id,
    s.teacher_id,
    u.full_name AS teacher_name,
    s.available_date,
    s.available_time,
    s.duration_minutes,
    s.price,
    s.timezone,
    s.is_active,
    s.start_at,
    s.end_at
  FROM public.teacher_availability_slots s
  INNER JOIN public.users u ON u.id = s.teacher_id
  WHERE s.is_active = TRUE
    AND s.start_at >= COALESCE(p_start_from, NOW())
    AND (p_teacher_id IS NULL OR s.teacher_id = p_teacher_id)
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      INNER JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = s.teacher_id
        AND lower(r.name) = 'teacher'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.teacher_session_bookings b
      WHERE b.slot_id = s.id
        AND b.status = 'confirmed'
    )
  ORDER BY s.available_date ASC, s.available_time ASC
  LIMIT GREATEST(COALESCE(p_limit_value, 50), 1)
  OFFSET GREATEST(COALESCE(p_offset_value, 0), 0);
$function$;

COMMIT;
