CREATE OR REPLACE FUNCTION public.sp_role_create(
    p_name TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, name TEXT, description TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.roles (name, description)
    VALUES (p_name, p_description)
    RETURNING roles.id, roles.name, roles.description;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Role with name "%" already exists', p_name;
END;
$$;

-- 2. Get Role by ID
CREATE OR REPLACE FUNCTION public.sp_role_get_by_id(
    p_id BIGINT
)
RETURNS TABLE(id BIGINT, name TEXT, description TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.roles r
    WHERE r.id = p_id;
END;
$$;

-- 3. Get Role by Name
CREATE OR REPLACE FUNCTION public.sp_role_get_by_name(
    p_name TEXT
)
RETURNS TABLE(id BIGINT, name TEXT, description TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.roles r
    WHERE r.name = p_name;
END;
$$;

-- 4. Get All Roles

CREATE OR REPLACE FUNCTION public.sp_role_get_all()
RETURNS TABLE(id BIGINT, name TEXT, description TEXT) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description
    FROM public.roles r
    ORDER BY r.name;
END;
$$;

-- 5. update Role
CREATE OR REPLACE FUNCTION public.sp_role_update(
    p_id BIGINT,
    p_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE(id BIGINT, name TEXT, description TEXT) 
LANGUAGE plpgsql
AS $$
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
$$;

-- 6. Delete Role
CREATE OR REPLACE FUNCTION public.sp_role_delete(
    p_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
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
$$;

-- 7. Check if Role Exists
CREATE OR REPLACE FUNCTION public.sp_role_exists(
    p_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.roles WHERE name = p_name
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$$;


-- 8. assign Role to User
CREATE OR REPLACE FUNCTION public.sp_role_assign_to_user(
    p_user_id UUID,
    p_role_id BIGINT
)
RETURNS TABLE(user_id UUID, role_id BIGINT, assigned_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
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
$$;

-- 9. remove Role from User
CREATE OR REPLACE FUNCTION public.sp_role_remove_from_user(
    p_user_id UUID,
    p_role_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.user_roles
    WHERE user_id = p_user_id AND role_id = p_role_id;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

-- 10. Get Roles for User
CREATE OR REPLACE FUNCTION public.sp_role_get_user_roles(
    p_user_id UUID
)
RETURNS TABLE(id BIGINT, name TEXT, description TEXT, assigned_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.description, ur.assigned_at
    FROM public.roles r
    INNER JOIN public.user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
    ORDER BY r.name;
END;
$$;

