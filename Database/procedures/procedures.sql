-- DROP PROCEDURE public.assign_role_to_user(uuid, int8);

CREATE OR REPLACE PROCEDURE public.assign_role_to_user(IN p_user_id uuid, IN p_role_id bigint)
 LANGUAGE plpgsql
AS $procedure$
BEGIN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (p_user_id, p_role_id);
END;
$procedure$
;

-- DROP FUNCTION public.get_roles_by_user(uuid);

CREATE OR REPLACE FUNCTION public.get_roles_by_user(p_user_id uuid)
 RETURNS TABLE(role_id bigint, assigned_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT ur.role_id, ur.assigned_at
    FROM public.user_roles ur
    WHERE ur.user_id = p_user_id;
END;
$function$
;

-- DROP PROCEDURE public.remove_role_from_user(uuid, int8);

CREATE OR REPLACE PROCEDURE public.remove_role_from_user(IN p_user_id uuid, IN p_role_id bigint)
 LANGUAGE plpgsql
AS $procedure$
BEGIN
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id
      AND role_id = p_role_id;
END;
$procedure$
;

-- DROP FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$
;

-- DROP FUNCTION public.sp_domain_count_programs(int8);

CREATE OR REPLACE FUNCTION public.sp_domain_count_programs(p_domain_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.programs
    WHERE domain_id = p_domain_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_create(text);

CREATE OR REPLACE FUNCTION public.sp_domain_create(p_name text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.domains (name)
    VALUES (p_name)
    RETURNING domains.id, domains.name, domains.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Domain "%" already exists', p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_domain_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.domains
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Domain with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_exists(text);

CREATE OR REPLACE FUNCTION public.sp_domain_exists(p_name text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.domains WHERE name = p_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_get_all();

CREATE OR REPLACE FUNCTION public.sp_domain_get_all()
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    ORDER BY d.name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_domain_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    WHERE d.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_get_by_id_with_programs(int8);

CREATE OR REPLACE FUNCTION public.sp_domain_get_by_id_with_programs(p_id bigint)
 RETURNS TABLE(domain_id bigint, domain_name text, domain_created_at timestamp with time zone, program_id bigint, program_name text, program_created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        d.id AS domain_id,
        d.name AS domain_name,
        d.created_at AS domain_created_at,
        p.id AS program_id,
        p.name AS program_name,
        p.created_at AS program_created_at
    FROM public.domains d
    LEFT JOIN public.programs p ON d.id = p.domain_id
    WHERE d.id = p_id
    ORDER BY p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_get_by_name(text);

CREATE OR REPLACE FUNCTION public.sp_domain_get_by_name(p_name text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    WHERE d.name = p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_get_programs(int8);

CREATE OR REPLACE FUNCTION public.sp_domain_get_programs(p_domain_id bigint)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.created_at
    FROM public.programs p
    WHERE p.domain_id = p_domain_id
    ORDER BY p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_get_with_program_count();

CREATE OR REPLACE FUNCTION public.sp_domain_get_with_program_count()
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone, program_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at, COUNT(p.id) AS program_count
    FROM public.domains d
    LEFT JOIN public.programs p ON d.id = p.domain_id
    GROUP BY d.id, d.name, d.created_at
    ORDER BY d.name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_search(text);

CREATE OR REPLACE FUNCTION public.sp_domain_search(p_search_term text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT d.id, d.name, d.created_at
    FROM public.domains d
    WHERE d.name ILIKE '%' || p_search_term || '%'
    ORDER BY d.name;
END;
$function$
;

-- DROP FUNCTION public.sp_domain_update(int8, text);

CREATE OR REPLACE FUNCTION public.sp_domain_update(p_id bigint, p_name text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.domains
    SET name = p_name
    WHERE domains.id = p_id
    RETURNING domains.id, domains.name, domains.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Domain with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Domain "%" already exists', p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_create(text, int8, text, text);

CREATE OR REPLACE FUNCTION public.sp_institution_create(p_name text, p_institution_type_id bigint, p_country text DEFAULT NULL::text, p_city text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.institutions (name, institution_type_id, country, city)
    VALUES (p_name, p_institution_type_id, p_country, p_city)
    RETURNING institutions.id, institutions.name, institutions.institution_type_id, 
              institutions.country, institutions.city, institutions.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution "%" already exists in %, %', p_name, p_city, p_country;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Institution type ID % does not exist', p_institution_type_id;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.institutions
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Institution with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_get_all();

CREATE OR REPLACE FUNCTION public.sp_institution_get_all()
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    ORDER BY i.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_get_by_country(text);

CREATE OR REPLACE FUNCTION public.sp_institution_get_by_country(p_country text)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.country = p_country
    ORDER BY i.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_get_by_name_location(text, text, text);

CREATE OR REPLACE FUNCTION public.sp_institution_get_by_name_location(p_name text, p_country text DEFAULT NULL::text, p_city text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.name = p_name 
      AND (p_country IS NULL OR i.country = p_country)
      AND (p_city IS NULL OR i.city = p_city);
END;
$function$
;

-- DROP FUNCTION public.sp_institution_get_by_type(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_get_by_type(p_institution_type_id bigint)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.institution_type_id = p_institution_type_id
    ORDER BY i.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_add(int8, int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_add(p_institution_id bigint, p_program_id bigint)
 RETURNS TABLE(institution_id bigint, program_id bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.institution_programs (institution_id, program_id)
    VALUES (p_institution_id, p_program_id)
    ON CONFLICT (institution_id, program_id) DO NOTHING
    RETURNING institution_programs.institution_id, institution_programs.program_id, institution_programs.created_at;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'Program already assigned to this institution';
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid institution_id or program_id';
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_add_bulk(int8, _int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_add_bulk(p_institution_id bigint, p_program_ids bigint[])
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_program_id BIGINT;
    v_count INTEGER := 0;
BEGIN
    FOREACH v_program_id IN ARRAY p_program_ids
    LOOP
        INSERT INTO public.institution_programs (institution_id, program_id)
        VALUES (p_institution_id, v_program_id)
        ON CONFLICT (institution_id, program_id) DO NOTHING;
        
        IF FOUND THEN
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_exists(int8, int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_exists(p_institution_id bigint, p_program_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.institution_programs 
        WHERE institution_id = p_institution_id AND program_id = p_program_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_get_all();

CREATE OR REPLACE FUNCTION public.sp_institution_program_get_all()
 RETURNS TABLE(institution_id bigint, institution_name text, program_id bigint, program_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT ip.institution_id, i.name AS institution_name, ip.program_id, 
           p.name AS program_name, ip.created_at
    FROM public.institution_programs ip
    INNER JOIN public.institutions i ON ip.institution_id = i.id
    INNER JOIN public.programs p ON ip.program_id = p.id
    ORDER BY i.name, p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_get_by_institution(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_get_by_institution(p_institution_id bigint)
 RETURNS TABLE(program_id bigint, program_name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, ip.created_at
    FROM public.institution_programs ip
    INNER JOIN public.programs p ON ip.program_id = p.id
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE ip.institution_id = p_institution_id
    ORDER BY p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_get_by_program(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_get_by_program(p_program_id bigint)
 RETURNS TABLE(institution_id bigint, institution_name text, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, it.name AS institution_type_name, i.country, i.city, ip.created_at
    FROM public.institution_programs ip
    INNER JOIN public.institutions i ON ip.institution_id = i.id
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE ip.program_id = p_program_id
    ORDER BY i.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_remove(int8, int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_remove(p_institution_id bigint, p_program_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.institution_programs
    WHERE institution_id = p_institution_id AND program_id = p_program_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_program_remove_all_from_institution(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_program_remove_all_from_institution(p_institution_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    DELETE FROM public.institution_programs
    WHERE institution_id = p_institution_id;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_search(text);

CREATE OR REPLACE FUNCTION public.sp_institution_search(p_search_term text)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, institution_type_name text, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT i.id, i.name, i.institution_type_id, it.name AS institution_type_name,
           i.country, i.city, i.created_at
    FROM public.institutions i
    LEFT JOIN public.institution_types it ON i.institution_type_id = it.id
    WHERE i.name ILIKE '%' || p_search_term || '%'
       OR i.country ILIKE '%' || p_search_term || '%'
       OR i.city ILIKE '%' || p_search_term || '%'
    ORDER BY i.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_create(text);

CREATE OR REPLACE FUNCTION public.sp_institution_type_create(p_name text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.institution_types (name)
    VALUES (p_name)
    RETURNING institution_types.id, institution_types.name, institution_types.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution type "%" already exists', p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_type_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.institution_types
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Institution type with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_exists(text);

CREATE OR REPLACE FUNCTION public.sp_institution_type_exists(p_name text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.institution_types WHERE name = p_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_get_all();

CREATE OR REPLACE FUNCTION public.sp_institution_type_get_all()
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT it.id, it.name, it.created_at
    FROM public.institution_types it
    ORDER BY it.name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_institution_type_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT it.id, it.name, it.created_at
    FROM public.institution_types it
    WHERE it.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_get_by_name(text);

CREATE OR REPLACE FUNCTION public.sp_institution_type_get_by_name(p_name text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT it.id, it.name, it.created_at
    FROM public.institution_types it
    WHERE it.name = p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_type_update(int8, text);

CREATE OR REPLACE FUNCTION public.sp_institution_type_update(p_id bigint, p_name text)
 RETURNS TABLE(id bigint, name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.institution_types
    SET name = p_name
    WHERE institution_types.id = p_id
    RETURNING institution_types.id, institution_types.name, institution_types.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Institution type with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution type "%" already exists', p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_institution_update(int8, text, int8, text, text);

CREATE OR REPLACE FUNCTION public.sp_institution_update(p_id bigint, p_name text DEFAULT NULL::text, p_institution_type_id bigint DEFAULT NULL::bigint, p_country text DEFAULT NULL::text, p_city text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, name text, institution_type_id bigint, country text, city text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.institutions
    SET 
        name = COALESCE(p_name, institutions.name),
        institution_type_id = COALESCE(p_institution_type_id, institutions.institution_type_id),
        country = COALESCE(p_country, institutions.country),
        city = COALESCE(p_city, institutions.city)
    WHERE institutions.id = p_id
    RETURNING institutions.id, institutions.name, institutions.institution_type_id, 
              institutions.country, institutions.city, institutions.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Institution with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Institution "%" already exists in this location', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Institution type ID % does not exist', p_institution_type_id;
END;
$function$
;

-- DROP FUNCTION public.sp_level_count_semesters(int8);

CREATE OR REPLACE FUNCTION public.sp_level_count_semesters(p_level_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.semesters
    WHERE level_id = p_level_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_level_create(int8, text, int4);

CREATE OR REPLACE FUNCTION public.sp_level_create(p_program_id bigint, p_name text, p_sort_order integer DEFAULT 1)
 RETURNS TABLE(id bigint, program_id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.levels (program_id, name, sort_order)
    VALUES (p_program_id, p_name, p_sort_order)
    RETURNING levels.id, levels.program_id, levels.name, levels.sort_order, levels.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Level "%" already exists in this program', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Program ID % does not exist', p_program_id;
END;
$function$
;

-- DROP FUNCTION public.sp_level_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_level_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.levels
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Level with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_level_exists(text, int8);

CREATE OR REPLACE FUNCTION public.sp_level_exists(p_name text, p_program_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.levels 
        WHERE name = p_name AND program_id = p_program_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_all();

CREATE OR REPLACE FUNCTION public.sp_level_get_all()
 RETURNS TABLE(id bigint, program_id bigint, program_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    ORDER BY p.name, l.sort_order, l.name;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_level_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, program_id bigint, program_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_by_name_program(text, int8);

CREATE OR REPLACE FUNCTION public.sp_level_get_by_name_program(p_name text, p_program_id bigint)
 RETURNS TABLE(id bigint, program_id bigint, program_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.name = p_name AND l.program_id = p_program_id;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_by_program(int8);

CREATE OR REPLACE FUNCTION public.sp_level_get_by_program(p_program_id bigint)
 RETURNS TABLE(id bigint, program_id bigint, program_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.program_id = p_program_id
    ORDER BY l.sort_order, l.name;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_full_details(int8);

CREATE OR REPLACE FUNCTION public.sp_level_get_full_details(p_level_id bigint)
 RETURNS TABLE(level_id bigint, level_name text, level_sort_order integer, level_created_at timestamp with time zone, program_id bigint, program_name text, semester_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        l.id AS level_id,
        l.name AS level_name,
        l.sort_order AS level_sort_order,
        l.created_at AS level_created_at,
        l.program_id,
        p.name AS program_name,
        COUNT(s.id) AS semester_count
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    LEFT JOIN public.semesters s ON l.id = s.level_id
    WHERE l.id = p_level_id
    GROUP BY l.id, l.name, l.sort_order, l.created_at, l.program_id, p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_next_sort_order(int8);

CREATE OR REPLACE FUNCTION public.sp_level_get_next_sort_order(p_program_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_next_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_next_order
    FROM public.levels
    WHERE program_id = p_program_id;
    
    RETURN v_next_order;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_semesters(int8);

CREATE OR REPLACE FUNCTION public.sp_level_get_semesters(p_level_id bigint)
 RETURNS TABLE(id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    WHERE s.level_id = p_level_id
    ORDER BY s.sort_order, s.name;
END;
$function$
;

-- DROP FUNCTION public.sp_level_get_with_semester_count();

CREATE OR REPLACE FUNCTION public.sp_level_get_with_semester_count()
 RETURNS TABLE(id bigint, program_id bigint, program_name text, name text, sort_order integer, created_at timestamp with time zone, semester_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, 
           l.sort_order, l.created_at, COUNT(s.id) AS semester_count
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    LEFT JOIN public.semesters s ON l.id = s.level_id
    GROUP BY l.id, l.program_id, p.name, l.name, l.sort_order, l.created_at
    ORDER BY p.name, l.sort_order, l.name;
END;
$function$
;

-- DROP FUNCTION public.sp_level_reorder(int8, int8);

CREATE OR REPLACE FUNCTION public.sp_level_reorder(p_level_id_1 bigint, p_level_id_2 bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sort_1 INTEGER;
    v_sort_2 INTEGER;
BEGIN
    -- Get current sort orders
    SELECT sort_order INTO v_sort_1 FROM public.levels WHERE id = p_level_id_1;
    SELECT sort_order INTO v_sort_2 FROM public.levels WHERE id = p_level_id_2;
    
    IF v_sort_1 IS NULL OR v_sort_2 IS NULL THEN
        RAISE EXCEPTION 'One or both level IDs not found';
    END IF;
    
    -- Swap sort orders
    UPDATE public.levels SET sort_order = v_sort_2 WHERE id = p_level_id_1;
    UPDATE public.levels SET sort_order = v_sort_1 WHERE id = p_level_id_2;
    
    RETURN TRUE;
END;
$function$
;

-- DROP FUNCTION public.sp_level_search(text);

CREATE OR REPLACE FUNCTION public.sp_level_search(p_search_term text)
 RETURNS TABLE(id bigint, program_id bigint, program_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.program_id, p.name AS program_name, l.name, l.sort_order, l.created_at
    FROM public.levels l
    LEFT JOIN public.programs p ON l.program_id = p.id
    WHERE l.name ILIKE '%' || p_search_term || '%'
       OR p.name ILIKE '%' || p_search_term || '%'
    ORDER BY l.sort_order, l.name;
END;
$function$
;

-- DROP FUNCTION public.sp_level_update(int8, text, int8, int4);

CREATE OR REPLACE FUNCTION public.sp_level_update(p_id bigint, p_name text DEFAULT NULL::text, p_program_id bigint DEFAULT NULL::bigint, p_sort_order integer DEFAULT NULL::integer)
 RETURNS TABLE(id bigint, program_id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.levels
    SET 
        name = COALESCE(p_name, levels.name),
        program_id = COALESCE(p_program_id, levels.program_id),
        sort_order = COALESCE(p_sort_order, levels.sort_order)
    WHERE levels.id = p_id
    RETURNING levels.id, levels.program_id, levels.name, levels.sort_order, levels.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Level with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Level "%" already exists in this program', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Program ID % does not exist', p_program_id;
END;
$function$
;

-- DROP FUNCTION public.sp_level_update_sort_order(int8, int4);

CREATE OR REPLACE FUNCTION public.sp_level_update_sort_order(p_id bigint, p_sort_order integer)
 RETURNS TABLE(id bigint, program_id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.levels
    SET sort_order = p_sort_order
    WHERE levels.id = p_id
    RETURNING levels.id, levels.program_id, levels.name, levels.sort_order, levels.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Level with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_program_count_institutions(int8);

CREATE OR REPLACE FUNCTION public.sp_program_count_institutions(p_program_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.institution_programs
    WHERE program_id = p_program_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_program_count_levels(int8);

CREATE OR REPLACE FUNCTION public.sp_program_count_levels(p_program_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.levels
    WHERE program_id = p_program_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_program_create(text, int8);

CREATE OR REPLACE FUNCTION public.sp_program_create(p_name text, p_domain_id bigint)
 RETURNS TABLE(id bigint, name text, domain_id bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.programs (name, domain_id)
    VALUES (p_name, p_domain_id)
    RETURNING programs.id, programs.name, programs.domain_id, programs.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Program "%" already exists in this domain', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Domain ID % does not exist', p_domain_id;
END;
$function$
;

-- DROP FUNCTION public.sp_program_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_program_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.programs
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Program with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_program_exists(text, int8);

CREATE OR REPLACE FUNCTION public.sp_program_exists(p_name text, p_domain_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.programs 
        WHERE name = p_name AND domain_id = p_domain_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_all();

CREATE OR REPLACE FUNCTION public.sp_program_get_all()
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    ORDER BY d.name, p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_by_domain(int8);

CREATE OR REPLACE FUNCTION public.sp_program_get_by_domain(p_domain_id bigint)
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.domain_id = p_domain_id
    ORDER BY p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_program_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_by_institution(int8);

CREATE OR REPLACE FUNCTION public.sp_program_get_by_institution(p_institution_id bigint)
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    INNER JOIN public.institution_programs ip ON p.id = ip.program_id
    WHERE ip.institution_id = p_institution_id
    ORDER BY p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_by_name_domain(text, int8);

CREATE OR REPLACE FUNCTION public.sp_program_get_by_name_domain(p_name text, p_domain_id bigint)
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.name = p_name AND p.domain_id = p_domain_id;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_full_details(int8);

CREATE OR REPLACE FUNCTION public.sp_program_get_full_details(p_program_id bigint)
 RETURNS TABLE(program_id bigint, program_name text, program_created_at timestamp with time zone, domain_id bigint, domain_name text, level_count bigint, institution_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS program_id,
        p.name AS program_name,
        p.created_at AS program_created_at,
        p.domain_id,
        d.name AS domain_name,
        COUNT(DISTINCT l.id) AS level_count,
        COUNT(DISTINCT ip.institution_id) AS institution_count
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    LEFT JOIN public.levels l ON p.id = l.program_id
    LEFT JOIN public.institution_programs ip ON p.id = ip.program_id
    WHERE p.id = p_program_id
    GROUP BY p.id, p.name, p.created_at, p.domain_id, d.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_levels(int8);

CREATE OR REPLACE FUNCTION public.sp_program_get_levels(p_program_id bigint)
 RETURNS TABLE(id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT l.id, l.name, l.sort_order, l.created_at
    FROM public.levels l
    WHERE l.program_id = p_program_id
    ORDER BY l.sort_order, l.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_get_with_level_count();

CREATE OR REPLACE FUNCTION public.sp_program_get_with_level_count()
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone, level_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, 
           p.created_at, COUNT(l.id) AS level_count
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    LEFT JOIN public.levels l ON p.id = l.program_id
    GROUP BY p.id, p.name, p.domain_id, d.name, p.created_at
    ORDER BY d.name, p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_search(text);

CREATE OR REPLACE FUNCTION public.sp_program_search(p_search_term text)
 RETURNS TABLE(id bigint, name text, domain_id bigint, domain_name text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.domain_id, d.name AS domain_name, p.created_at
    FROM public.programs p
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE p.name ILIKE '%' || p_search_term || '%'
       OR d.name ILIKE '%' || p_search_term || '%'
    ORDER BY p.name;
END;
$function$
;

-- DROP FUNCTION public.sp_program_update(int8, text, int8);

CREATE OR REPLACE FUNCTION public.sp_program_update(p_id bigint, p_name text DEFAULT NULL::text, p_domain_id bigint DEFAULT NULL::bigint)
 RETURNS TABLE(id bigint, name text, domain_id bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.programs
    SET 
        name = COALESCE(p_name, programs.name),
        domain_id = COALESCE(p_domain_id, programs.domain_id)
    WHERE programs.id = p_id
    RETURNING programs.id, programs.name, programs.domain_id, programs.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Program with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Program "%" already exists in this domain', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Domain ID % does not exist', p_domain_id;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_archive(int8);

CREATE OR REPLACE FUNCTION public.sp_resource_archive(p_id bigint)
 RETURNS TABLE(id bigint, title text, status text, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET status = 'archived'::resource_status
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.status::TEXT, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_count_by_creator(uuid);

CREATE OR REPLACE FUNCTION public.sp_resource_count_by_creator(p_created_by uuid)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.resources
    WHERE created_by = p_created_by;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_count_by_status(text);

CREATE OR REPLACE FUNCTION public.sp_resource_count_by_status(p_status text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.resources
    WHERE status::TEXT = p_status;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_count_by_type(text);

CREATE OR REPLACE FUNCTION public.sp_resource_count_by_type(p_type text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.resources
    WHERE type::TEXT = p_type;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_create(text, text, text, text, text, text, text, uuid);

CREATE OR REPLACE FUNCTION public.sp_resource_create(p_title text, p_description text DEFAULT NULL::text, p_type text DEFAULT 'other'::text, p_status text DEFAULT 'draft'::text, p_url text DEFAULT NULL::text, p_language text DEFAULT NULL::text, p_license text DEFAULT NULL::text, p_created_by uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.resources (title, description, type, status, url, language, license, created_by)
    VALUES (p_title, p_description, p_type::resource_type, p_status::resource_status, 
            p_url, p_language, p_license, p_created_by)
    RETURNING resources.id, resources.title, resources.description, 
              resources.type::TEXT, resources.status::TEXT, resources.url, 
              resources.language, resources.license, resources.created_by,
              resources.created_at, resources.updated_at;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid type or status value';
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'User ID % does not exist', p_created_by;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_resource_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.resources
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_all();

CREATE OR REPLACE FUNCTION public.sp_resource_get_all()
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_by_creator(uuid);

CREATE OR REPLACE FUNCTION public.sp_resource_get_by_creator(p_created_by uuid)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           r.created_at, r.updated_at
    FROM public.resources r
    WHERE r.created_by = p_created_by
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_resource_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, creator_email text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, u.email AS creator_email,
           r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_by_language(text);

CREATE OR REPLACE FUNCTION public.sp_resource_get_by_language(p_language text)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.language = p_language
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_by_status(text);

CREATE OR REPLACE FUNCTION public.sp_resource_get_by_status(p_status text)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.status::TEXT = p_status
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_by_type(text);

CREATE OR REPLACE FUNCTION public.sp_resource_get_by_type(p_type text)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.type::TEXT = p_type
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_published();

CREATE OR REPLACE FUNCTION public.sp_resource_get_published()
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.status = 'published'::resource_status
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_statistics(int8);

CREATE OR REPLACE FUNCTION public.sp_resource_get_statistics(p_resource_id bigint)
 RETURNS TABLE(resource_id bigint, resource_title text, favorites_count bigint, ratings_count bigint, average_rating numeric, modules_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS resource_id,
        r.title AS resource_title,
        COUNT(DISTINCT f.user_id) AS favorites_count,
        COUNT(DISTINCT rat.user_id) AS ratings_count,
        ROUND(AVG(rat.score), 2) AS average_rating,
        COUNT(DISTINCT rmm.module_id) AS modules_count
    FROM public.resources r
    LEFT JOIN public.favorites f ON r.id = f.resource_id
    LEFT JOIN public.ratings rat ON r.id = rat.resource_id
    LEFT JOIN public.resource_module_map rmm ON r.id = rmm.resource_id
    WHERE r.id = p_resource_id
    GROUP BY r.id, r.title;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_statuses();

CREATE OR REPLACE FUNCTION public.sp_resource_get_statuses()
 RETURNS TABLE(status_value text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT enumlabel::TEXT
    FROM pg_enum
    WHERE enumtypid = 'resource_status'::regtype
    ORDER BY enumsortorder;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_types();

CREATE OR REPLACE FUNCTION public.sp_resource_get_types()
 RETURNS TABLE(type_value text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT enumlabel::TEXT
    FROM pg_enum
    WHERE enumtypid = 'resource_type'::regtype
    ORDER BY enumsortorder;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_get_with_ratings();

CREATE OR REPLACE FUNCTION public.sp_resource_get_with_ratings()
 RETURNS TABLE(id bigint, title text, type text, status text, average_rating numeric, rating_count bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.type::TEXT, r.status::TEXT,
           ROUND(AVG(rat.score), 2) AS average_rating,
           COUNT(rat.score) AS rating_count,
           r.created_at
    FROM public.resources r
    LEFT JOIN public.ratings rat ON r.id = rat.resource_id
    GROUP BY r.id, r.title, r.type, r.status, r.created_at
    ORDER BY average_rating DESC NULLS LAST, r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_publish(int8);

CREATE OR REPLACE FUNCTION public.sp_resource_publish(p_id bigint)
 RETURNS TABLE(id bigint, title text, status text, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET status = 'published'::resource_status
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.status::TEXT, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_search(text);

CREATE OR REPLACE FUNCTION public.sp_resource_search(p_search_term text)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, creator_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.title, r.description, r.type::TEXT, r.status::TEXT, 
           r.url, r.language, r.license, r.created_by,
           u.full_name AS creator_name, r.created_at, r.updated_at
    FROM public.resources r
    LEFT JOIN public.users u ON r.created_by = u.id
    WHERE r.title ILIKE '%' || p_search_term || '%'
       OR r.description ILIKE '%' || p_search_term || '%'
    ORDER BY r.created_at DESC;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_set_updated_at();

CREATE OR REPLACE FUNCTION public.sp_resource_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.sp_resource_update(int8, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.sp_resource_update(p_id bigint, p_title text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_type text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_url text DEFAULT NULL::text, p_language text DEFAULT NULL::text, p_license text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, title text, description text, type text, status text, url text, language text, license text, created_by uuid, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET 
        title = COALESCE(p_title, resources.title),
        description = COALESCE(p_description, resources.description),
        type = COALESCE(p_type::resource_type, resources.type),
        status = COALESCE(p_status::resource_status, resources.status),
        url = COALESCE(p_url, resources.url),
        language = COALESCE(p_language, resources.language),
        license = COALESCE(p_license, resources.license)
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.description, 
              resources.type::TEXT, resources.status::TEXT, resources.url, 
              resources.language, resources.license, resources.created_by,
              resources.created_at, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid type or status value';
END;
$function$
;

-- DROP FUNCTION public.sp_resource_update_status(int8, text);

CREATE OR REPLACE FUNCTION public.sp_resource_update_status(p_id bigint, p_status text)
 RETURNS TABLE(id bigint, title text, status text, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.resources
    SET status = p_status::resource_status
    WHERE resources.id = p_id
    RETURNING resources.id, resources.title, resources.status::TEXT, resources.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resource with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'Invalid status value: %', p_status;
END;
$function$
;

-- DROP FUNCTION public.sp_role_assign_to_user(uuid, int8);

CREATE OR REPLACE FUNCTION public.sp_role_assign_to_user(p_user_id uuid, p_role_id bigint)
 RETURNS TABLE(user_id uuid, role_id bigint, assigned_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (p_user_id, p_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING
    RETURNING user_roles.user_id, user_roles.role_id, user_roles.assigned_at;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'User already has this role assigned';
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_role_create(text, text);

CREATE OR REPLACE FUNCTION public.sp_role_create(p_name text, p_description text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, name text, description text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.roles (name, description)
    VALUES (p_name, p_description)
    RETURNING roles.id, roles.name, roles.description;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Role with name "%" already exists', p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_role_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_role_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.roles
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Role with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_role_exists(text);

CREATE OR REPLACE FUNCTION public.sp_role_exists(p_name text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.roles WHERE name = p_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_role_get_all();

CREATE OR REPLACE FUNCTION public.sp_role_get_all()
 RETURNS TABLE(id bigint, name text, description text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.roles r
    ORDER BY r.name;
END;
$function$
;

-- DROP FUNCTION public.sp_role_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_role_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, name text, description text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.roles r
    WHERE r.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_role_get_by_name(text);

CREATE OR REPLACE FUNCTION public.sp_role_get_by_name(p_name text)
 RETURNS TABLE(id bigint, name text, description text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.roles r
    WHERE r.name = p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_role_get_user_roles(uuid);

CREATE OR REPLACE FUNCTION public.sp_role_get_user_roles(p_user_id uuid)
 RETURNS TABLE(id bigint, name text, description text, assigned_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description, ur.assigned_at
    FROM public.roles r
    INNER JOIN public.user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    ORDER BY r.name;
END;
$function$
;

-- DROP FUNCTION public.sp_role_remove_from_user(uuid, int8);

CREATE OR REPLACE FUNCTION public.sp_role_remove_from_user(p_user_id uuid, p_role_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role_id = p_role_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$function$
;

-- DROP FUNCTION public.sp_role_update(int8, text, text);

CREATE OR REPLACE FUNCTION public.sp_role_update(p_id bigint, p_name text DEFAULT NULL::text, p_description text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, name text, description text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.roles
    SET 
        name = COALESCE(p_name, roles.name),
        description = COALESCE(p_description, roles.description)
    WHERE roles.id = p_id
    RETURNING roles.id, roles.name, roles.description;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Role with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Role with name "%" already exists', p_name;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_count_modules(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_count_modules(p_semester_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.modules
    WHERE semester_id = p_semester_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_create(int8, text, int4);

CREATE OR REPLACE FUNCTION public.sp_semester_create(p_level_id bigint, p_name text, p_sort_order integer DEFAULT 1)
 RETURNS TABLE(id bigint, level_id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.semesters (level_id, name, sort_order)
    VALUES (p_level_id, p_name, p_sort_order)
    RETURNING semesters.id, semesters.level_id, semesters.name, semesters.sort_order, semesters.created_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Semester "%" already exists in this level', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Level ID % does not exist', p_level_id;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_delete(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_delete(p_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.semesters
    WHERE id = p_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Semester with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_exists(text, int8);

CREATE OR REPLACE FUNCTION public.sp_semester_exists(p_name text, p_level_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.semesters 
        WHERE name = p_name AND level_id = p_level_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_all();

CREATE OR REPLACE FUNCTION public.sp_semester_get_all()
 RETURNS TABLE(id bigint, level_id bigint, level_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    ORDER BY l.sort_order, s.sort_order, s.name;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_by_id(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_by_id(p_id bigint)
 RETURNS TABLE(id bigint, level_id bigint, level_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.id = p_id;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_by_level(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_by_level(p_level_id bigint)
 RETURNS TABLE(id bigint, level_id bigint, level_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.level_id = p_level_id
    ORDER BY s.sort_order, s.name;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_by_name_level(text, int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_by_name_level(p_name text, p_level_id bigint)
 RETURNS TABLE(id bigint, level_id bigint, level_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.name = p_name AND s.level_id = p_level_id;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_full_details(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_full_details(p_semester_id bigint)
 RETURNS TABLE(semester_id bigint, semester_name text, semester_sort_order integer, semester_created_at timestamp with time zone, level_id bigint, level_name text, module_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS semester_id,
        s.name AS semester_name,
        s.sort_order AS semester_sort_order,
        s.created_at AS semester_created_at,
        s.level_id,
        l.name AS level_name,
        COUNT(m.id) AS module_count
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    LEFT JOIN public.modules m ON s.id = m.semester_id
    WHERE s.id = p_semester_id
    GROUP BY s.id, s.name, s.sort_order, s.created_at, s.level_id, l.name;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_full_hierarchy(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_full_hierarchy(p_semester_id bigint)
 RETURNS TABLE(semester_id bigint, semester_name text, semester_sort_order integer, semester_created_at timestamp with time zone, level_id bigint, level_name text, program_id bigint, program_name text, domain_id bigint, domain_name text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS semester_id,
        s.name AS semester_name,
        s.sort_order AS semester_sort_order,
        s.created_at AS semester_created_at,
        l.id AS level_id,
        l.name AS level_name,
        p.id AS program_id,
        p.name AS program_name,
        d.id AS domain_id,
        d.name AS domain_name
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    LEFT JOIN public.programs p ON l.program_id = p.id
    LEFT JOIN public.domains d ON p.domain_id = d.id
    WHERE s.id = p_semester_id;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_modules(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_modules(p_semester_id bigint)
 RETURNS TABLE(id bigint, code text, title text, description text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT m.id, m.code, m.title, m.description, m.created_at
    FROM public.modules m
    WHERE m.semester_id = p_semester_id
    ORDER BY m.code, m.title;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_next_sort_order(int8);

CREATE OR REPLACE FUNCTION public.sp_semester_get_next_sort_order(p_level_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_next_order INTEGER;
BEGIN
    SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_next_order
    FROM public.semesters
    WHERE level_id = p_level_id;
    
    RETURN v_next_order;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_get_with_module_count();

CREATE OR REPLACE FUNCTION public.sp_semester_get_with_module_count()
 RETURNS TABLE(id bigint, level_id bigint, level_name text, name text, sort_order integer, created_at timestamp with time zone, module_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, 
           s.sort_order, s.created_at, COUNT(m.id) AS module_count
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    LEFT JOIN public.modules m ON s.id = m.semester_id
    GROUP BY s.id, s.level_id, l.name, s.name, s.sort_order, s.created_at
    ORDER BY l.sort_order, s.sort_order, s.name;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_reorder(int8, int8);

CREATE OR REPLACE FUNCTION public.sp_semester_reorder(p_semester_id_1 bigint, p_semester_id_2 bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sort_1 INTEGER;
    v_sort_2 INTEGER;
BEGIN
    -- Get current sort orders
    SELECT sort_order INTO v_sort_1 FROM public.semesters WHERE id = p_semester_id_1;
    SELECT sort_order INTO v_sort_2 FROM public.semesters WHERE id = p_semester_id_2;
    
    IF v_sort_1 IS NULL OR v_sort_2 IS NULL THEN
        RAISE EXCEPTION 'One or both semester IDs not found';
    END IF;
    
    -- Swap sort orders
    UPDATE public.semesters SET sort_order = v_sort_2 WHERE id = p_semester_id_1;
    UPDATE public.semesters SET sort_order = v_sort_1 WHERE id = p_semester_id_2;
    
    RETURN TRUE;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_search(text);

CREATE OR REPLACE FUNCTION public.sp_semester_search(p_search_term text)
 RETURNS TABLE(id bigint, level_id bigint, level_name text, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT s.id, s.level_id, l.name AS level_name, s.name, s.sort_order, s.created_at
    FROM public.semesters s
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE s.name ILIKE '%' || p_search_term || '%'
       OR l.name ILIKE '%' || p_search_term || '%'
    ORDER BY s.sort_order, s.name;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_update(int8, text, int8, int4);

CREATE OR REPLACE FUNCTION public.sp_semester_update(p_id bigint, p_name text DEFAULT NULL::text, p_level_id bigint DEFAULT NULL::bigint, p_sort_order integer DEFAULT NULL::integer)
 RETURNS TABLE(id bigint, level_id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.semesters
    SET 
        name = COALESCE(p_name, semesters.name),
        level_id = COALESCE(p_level_id, semesters.level_id),
        sort_order = COALESCE(p_sort_order, semesters.sort_order)
    WHERE semesters.id = p_id
    RETURNING semesters.id, semesters.level_id, semesters.name, semesters.sort_order, semesters.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Semester with ID % not found', p_id;
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Semester "%" already exists in this level', p_name;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Level ID % does not exist', p_level_id;
END;
$function$
;

-- DROP FUNCTION public.sp_semester_update_sort_order(int8, int4);

CREATE OR REPLACE FUNCTION public.sp_semester_update_sort_order(p_id bigint, p_sort_order integer)
 RETURNS TABLE(id bigint, level_id bigint, name text, sort_order integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.semesters
    SET sort_order = p_sort_order
    WHERE semesters.id = p_id
    RETURNING semesters.id, semesters.level_id, semesters.name, semesters.sort_order, semesters.created_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Semester with ID % not found', p_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_count_by_institution(int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_count_by_institution(p_institution_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.student_profiles
    WHERE institution_id = p_institution_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_count_by_program(int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_count_by_program(p_program_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.student_profiles
    WHERE program_id = p_program_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_count_by_semester(int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_count_by_semester(p_semester_id bigint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.student_profiles
    WHERE current_semester_id = p_semester_id;
    
    RETURN v_count;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_create(uuid, int8, int8, int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_create(p_user_id uuid, p_institution_id bigint DEFAULT NULL::bigint, p_program_id bigint DEFAULT NULL::bigint, p_current_semester_id bigint DEFAULT NULL::bigint)
 RETURNS TABLE(user_id uuid, institution_id bigint, program_id bigint, current_semester_id bigint, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    INSERT INTO public.student_profiles (user_id, institution_id, program_id, current_semester_id)
    VALUES (p_user_id, p_institution_id, p_program_id, p_current_semester_id)
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Student profile already exists for user %', p_user_id;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid user_id, institution_id, program_id, or current_semester_id';
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_delete(uuid);

CREATE OR REPLACE FUNCTION public.sp_student_profile_delete(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.student_profiles
    WHERE user_id = p_user_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    IF v_deleted THEN
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_exists(uuid);

CREATE OR REPLACE FUNCTION public.sp_student_profile_exists(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.student_profiles WHERE user_id = p_user_id
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_get_all();

CREATE OR REPLACE FUNCTION public.sp_student_profile_get_all()
 RETURNS TABLE(user_id uuid, user_full_name text, user_email text, institution_id bigint, institution_name text, program_id bigint, program_name text, current_semester_id bigint, current_semester_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.program_id,
        p.name AS program_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    ORDER BY u.full_name;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_get_by_institution(int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_institution(p_institution_id bigint)
 RETURNS TABLE(user_id uuid, user_full_name text, user_email text, program_id bigint, program_name text, current_semester_id bigint, current_semester_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.program_id,
        p.name AS program_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    WHERE sp.institution_id = p_institution_id
    ORDER BY u.full_name;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_get_by_program(int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_program(p_program_id bigint)
 RETURNS TABLE(user_id uuid, user_full_name text, user_email text, institution_id bigint, institution_name text, current_semester_id bigint, current_semester_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    WHERE sp.program_id = p_program_id
    ORDER BY u.full_name;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_get_by_semester(int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_semester(p_semester_id bigint)
 RETURNS TABLE(user_id uuid, user_full_name text, user_email text, institution_id bigint, institution_name text, program_id bigint, program_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.program_id,
        p.name AS program_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    WHERE sp.current_semester_id = p_semester_id
    ORDER BY u.full_name;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_get_by_user_id(uuid);

CREATE OR REPLACE FUNCTION public.sp_student_profile_get_by_user_id(p_user_id uuid)
 RETURNS TABLE(user_id uuid, user_full_name text, user_email text, institution_id bigint, institution_name text, program_id bigint, program_name text, current_semester_id bigint, current_semester_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        sp.institution_id,
        i.name AS institution_name,
        sp.program_id,
        p.name AS program_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs p ON sp.program_id = p.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    WHERE sp.user_id = p_user_id;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_get_full_details(uuid);

CREATE OR REPLACE FUNCTION public.sp_student_profile_get_full_details(p_user_id uuid)
 RETURNS TABLE(user_id uuid, user_full_name text, user_email text, user_is_active boolean, institution_id bigint, institution_name text, institution_country text, institution_city text, program_id bigint, program_name text, domain_id bigint, domain_name text, current_semester_id bigint, current_semester_name text, level_id bigint, level_name text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sp.user_id,
        u.full_name AS user_full_name,
        u.email AS user_email,
        u.is_active AS user_is_active,
        sp.institution_id,
        i.name AS institution_name,
        i.country AS institution_country,
        i.city AS institution_city,
        sp.program_id,
        pr.name AS program_name,
        pr.domain_id,
        d.name AS domain_name,
        sp.current_semester_id,
        s.name AS current_semester_name,
        s.level_id,
        l.name AS level_name,
        sp.created_at,
        sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN public.users u ON sp.user_id = u.id
    LEFT JOIN public.institutions i ON sp.institution_id = i.id
    LEFT JOIN public.programs pr ON sp.program_id = pr.id
    LEFT JOIN public.domains d ON pr.domain_id = d.id
    LEFT JOIN public.semesters s ON sp.current_semester_id = s.id
    LEFT JOIN public.levels l ON s.level_id = l.id
    WHERE sp.user_id = p_user_id;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_set_updated_at();

CREATE OR REPLACE FUNCTION public.sp_student_profile_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_update(uuid, int8, int8, int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_update(p_user_id uuid, p_institution_id bigint DEFAULT NULL::bigint, p_program_id bigint DEFAULT NULL::bigint, p_current_semester_id bigint DEFAULT NULL::bigint)
 RETURNS TABLE(user_id uuid, institution_id bigint, program_id bigint, current_semester_id bigint, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET 
        institution_id = COALESCE(p_institution_id, student_profiles.institution_id),
        program_id = COALESCE(p_program_id, student_profiles.program_id),
        current_semester_id = COALESCE(p_current_semester_id, student_profiles.current_semester_id)
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid institution_id, program_id, or current_semester_id';
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_update_institution(uuid, int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_update_institution(p_user_id uuid, p_institution_id bigint)
 RETURNS TABLE(user_id uuid, institution_id bigint, program_id bigint, current_semester_id bigint, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET institution_id = p_institution_id
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Institution ID % does not exist', p_institution_id;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_update_program(uuid, int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_update_program(p_user_id uuid, p_program_id bigint)
 RETURNS TABLE(user_id uuid, institution_id bigint, program_id bigint, current_semester_id bigint, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET program_id = p_program_id
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Program ID % does not exist', p_program_id;
END;
$function$
;

-- DROP FUNCTION public.sp_student_profile_update_semester(uuid, int8);

CREATE OR REPLACE FUNCTION public.sp_student_profile_update_semester(p_user_id uuid, p_current_semester_id bigint)
 RETURNS TABLE(user_id uuid, institution_id bigint, program_id bigint, current_semester_id bigint, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.student_profiles
    SET current_semester_id = p_current_semester_id
    WHERE student_profiles.user_id = p_user_id
    RETURNING student_profiles.user_id, student_profiles.institution_id, 
              student_profiles.program_id, student_profiles.current_semester_id,
              student_profiles.created_at, student_profiles.updated_at;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student profile for user % not found', p_user_id;
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Semester ID % does not exist', p_current_semester_id;
END;
$function$
;

-- DROP FUNCTION public.sp_user_change_email(uuid, text);

CREATE OR REPLACE FUNCTION public.sp_user_change_email(p_user_id uuid, p_new_email text)
 RETURNS TABLE(id uuid, full_name text, email text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  if p_new_email is null or length(trim(p_new_email)) = 0 then
    raise exception 'New email is required';
  end if;

  v_email := public.sp_user_normalize_email(p_new_email);

  update public.users u
  set email = v_email
  where u.id = p_user_id
  returning u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at
  into id, full_name, email, is_active, created_at, updated_at;

  if not found then
    raise exception 'User not found';
  end if;

  return next;

exception
  when unique_violation then
    raise exception 'Email already in use';
end;
$function$
;

-- DROP FUNCTION public.sp_user_change_password(uuid, text, text);

CREATE OR REPLACE FUNCTION public.sp_user_change_password(p_user_id uuid, p_old_password text, p_new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_hash text;
begin
  if p_new_password is null or length(p_new_password) < 8 then
    raise exception 'New password must be at least 8 characters';
  end if;

  select u.password_hash into v_hash
  from public.users u
  where u.id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  if v_hash <> crypt(p_old_password, v_hash) then
    raise exception 'Old password is incorrect';
  end if;

  update public.users
  set password_hash = crypt(p_new_password, gen_salt('bf'))
  where id = p_user_id;
end;
$function$
;

-- DROP FUNCTION public.sp_user_delete(uuid);

CREATE OR REPLACE FUNCTION public.sp_user_delete(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from public.users where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$function$
;

-- DROP FUNCTION public.sp_user_get_by_email(text);

CREATE OR REPLACE FUNCTION public.sp_user_get_by_email(p_email text)
 RETURNS TABLE(id uuid, full_name text, email text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at
  from public.users u
  where u.email = public.sp_user_normalize_email(p_email);
$function$
;

-- DROP FUNCTION public.sp_user_get_by_id(uuid);

CREATE OR REPLACE FUNCTION public.sp_user_get_by_id(p_user_id uuid)
 RETURNS TABLE(id uuid, full_name text, email text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at
  from public.users u
  where u.id = p_user_id;
$function$
;

-- DROP FUNCTION public.sp_user_login(text, text);

CREATE OR REPLACE FUNCTION public.sp_user_login(p_email text, p_password text)
 RETURNS TABLE(id uuid, full_name text, email text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  v_email := public.sp_user_normalize_email(p_email);

  return query
  select u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at
  from public.users u
  where u.email = v_email
    and u.is_active = true
    and u.password_hash = crypt(p_password, u.password_hash);
end;
$function$
;

-- DROP FUNCTION public.sp_user_normalize_email(text);

CREATE OR REPLACE FUNCTION public.sp_user_normalize_email(p_email text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select lower(trim(p_email));
$function$
;

-- DROP FUNCTION public.sp_user_register(text, text, text);

CREATE OR REPLACE FUNCTION public.sp_user_register(p_full_name text, p_email text, p_password text)
 RETURNS TABLE(id uuid, full_name text, email text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_email text;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email is required';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  v_email := public.sp_user_normalize_email(p_email);

  insert into public.users (full_name, email, password_hash, is_active)
  values (
    nullif(trim(p_full_name), ''),
    v_email,
    crypt(p_password, gen_salt('bf')),
    true
  )
  returning users.id, users.full_name, users.email, users.is_active, users.created_at, users.updated_at
  into id, full_name, email, is_active, created_at, updated_at;

  return next;

exception
  when unique_violation then
    raise exception 'Email already in use';
end;
$function$
;

-- DROP FUNCTION public.sp_user_reset_password(uuid, text);

CREATE OR REPLACE FUNCTION public.sp_user_reset_password(p_user_id uuid, p_new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if p_new_password is null or length(p_new_password) < 8 then
    raise exception 'New password must be at least 8 characters';
  end if;

  update public.users
  set password_hash = crypt(p_new_password, gen_salt('bf'))
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$function$
;

-- DROP FUNCTION public.sp_user_set_active(uuid, bool);

CREATE OR REPLACE FUNCTION public.sp_user_set_active(p_user_id uuid, p_is_active boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.users
  set is_active = coalesce(p_is_active, true)
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$function$
;

-- DROP FUNCTION public.sp_user_set_updated_at();

CREATE OR REPLACE FUNCTION public.sp_user_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$
;

-- DROP FUNCTION public.sp_user_update_profile(uuid, text);

CREATE OR REPLACE FUNCTION public.sp_user_update_profile(p_user_id uuid, p_full_name text)
 RETURNS TABLE(id uuid, full_name text, email text, is_active boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  update public.users u
  set full_name = nullif(trim(p_full_name), '')
  where u.id = p_user_id
  returning u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at
  into id, full_name, email, is_active, created_at, updated_at;

  if not found then
    raise exception 'User not found';
  end if;

  return next;
end;
$function$
;

-- DROP PROCEDURE public.update_user_role(uuid, int8, int8);

CREATE OR REPLACE PROCEDURE public.update_user_role(IN p_user_id uuid, IN p_old_role_id bigint, IN p_new_role_id bigint)
 LANGUAGE plpgsql
AS $procedure$
BEGIN
    UPDATE public.user_roles
    SET role_id = p_new_role_id,
        assigned_at = now()
    WHERE user_id = p_user_id
      AND role_id = p_old_role_id;
END;
$procedure$
;