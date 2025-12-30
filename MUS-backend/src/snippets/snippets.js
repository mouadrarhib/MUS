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
};
