import { UserRole } from "../models/index.js";

export const SQL = {
  USER: {
    REGISTER: `SELECT * FROM public.sp_user_register(:full_name, :email, :password)`,
    LOGIN: `SELECT * FROM public.sp_user_login(:email, :password)`,
    GET_BY_EMAIL: `SELECT * FROM public.sp_user_get_by_email(:email)`,
    GET_BY_ID: `SELECT * FROM public.sp_user_get_by_id(:id)`,
    CHANGE_EMAIL: `SELECT * FROM public.sp_user_change_email(:id, :new_email)`,
    CHANGE_PASSWORD: `SELECT public.sp_user_change_password(:id, :old_password, :new_password)`,
    RESET_PASSWORD: `SELECT public.sp_user_reset_password(:id, :new_password)`,
    SET_ACTIVE: `SELECT public.sp_user_set_active(:id, :is_active)`,
    DELETE: `SELECT public.sp_user_delete(:id)`,
    UPDATE_PROFILE: `SELECT * FROM public.sp_user_update_profile(:id, :full_name)`,
  },

  ROLE: {
    CREATE: `SELECT * FROM public.sp_role_create(:name, :description)`,
    
    GET_BY_ID: `SELECT * FROM public.sp_role_get_by_id(:id)`,
    
    GET_BY_NAME: `SELECT * FROM public.sp_role_get_by_name(:name)`,
    
    GET_ALL: `SELECT * FROM public.sp_role_get_all()`,
    
    UPDATE: `SELECT * FROM public.sp_role_update(:id, :name, :description)`,
    
    DELETE: `SELECT public.sp_role_delete(:id)`,
    
    EXISTS: `SELECT public.sp_role_exists(:name)`,
    
    ASSIGN_TO_USER: `SELECT * FROM public.sp_role_assign_to_user(:user_id, :role_id)`,
    
    REMOVE_FROM_USER: `SELECT public.sp_role_remove_from_user(:user_id, :role_id)`,
    
    GET_USER_ROLES: `SELECT * FROM public.sp_role_get_user_roles(:user_id)`,
  },

  USER_ROLE: {
    ASSIGN: `CALL public.assign_role_to_user(:user_id, :role_id)`,

    GET_BY_USER: `SELECT * FROM public.get_roles_by_user(:user_id)`,

    UPDATE: `CALL public.update_user_role(:user_id, :old_role_id, :new_role_id)`,

    REMOVE: `CALL public.remove_role_from_user(:user_id, :role_id)`
  }

};
