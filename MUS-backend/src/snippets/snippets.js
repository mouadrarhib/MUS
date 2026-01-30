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
  },

  INSTITUTION_TYPE: {
    CREATE: `SELECT * FROM public.sp_institution_type_create(:name)`,
    GET_BY_ID: `SELECT * FROM public.sp_institution_type_get_by_id(:id)`,
    GET_BY_NAME: `SELECT * FROM public.sp_institution_type_get_by_name(:name)`,
    GET_ALL: `SELECT * FROM public.sp_institution_type_get_all()`,
    UPDATE: `SELECT * FROM public.sp_institution_type_update(:id, :name)`,
    DELETE: `SELECT public.sp_institution_type_delete(:id)`,
    EXISTS: `SELECT public.sp_institution_type_exists(:name)`,
  },

  INSTITUTION: {
    CREATE: `SELECT * FROM public.sp_institution_create(:name, :institution_type_id, :country, :city)`,
    GET_BY_ID: `SELECT * FROM public.sp_institution_get_by_id(:id)`,
    GET_BY_NAME_LOCATION: `SELECT * FROM public.sp_institution_get_by_name_location(:name, :country, :city)`,
    GET_ALL: `SELECT * FROM public.sp_institution_get_all()`,
    GET_BY_TYPE: `SELECT * FROM public.sp_institution_get_by_type(:institution_type_id)`,
    GET_BY_COUNTRY: `SELECT * FROM public.sp_institution_get_by_country(:country)`,
    UPDATE: `SELECT * FROM public.sp_institution_update(:id, :name, :institution_type_id, :country, :city)`,
    DELETE: `SELECT public.sp_institution_delete(:id)`,
    SEARCH: `SELECT * FROM public.sp_institution_search(:search_term)`,
  },

  INSTITUTION_PROGRAM: {
    ADD: `SELECT * FROM public.sp_institution_program_add(:institution_id, :program_id)`,
    REMOVE: `SELECT public.sp_institution_program_remove(:institution_id, :program_id)`,
    GET_BY_INSTITUTION: `SELECT * FROM public.sp_institution_program_get_by_institution(:institution_id)`,
    GET_BY_PROGRAM: `SELECT * FROM public.sp_institution_program_get_by_program(:program_id)`,
    EXISTS: `SELECT public.sp_institution_program_exists(:institution_id, :program_id)`,
    GET_ALL: `SELECT * FROM public.sp_institution_program_get_all()`,
    REMOVE_ALL_FROM_INSTITUTION: `SELECT public.sp_institution_program_remove_all_from_institution(:institution_id)`,
    ADD_BULK: `SELECT public.sp_institution_program_add_bulk(:institution_id, :program_ids)`,
  },

  DOMAIN: {
    CREATE: `SELECT * FROM public.sp_domain_create(:name)`,
    
    GET_BY_ID: `SELECT * FROM public.sp_domain_get_by_id(:id)`,
    
    GET_BY_NAME: `SELECT * FROM public.sp_domain_get_by_name(:name)`,
    
    GET_ALL: `SELECT * FROM public.sp_domain_get_all()`,
    
    UPDATE: `SELECT * FROM public.sp_domain_update(:id, :name)`,
    
    DELETE: `SELECT public.sp_domain_delete(:id)`,
    
    EXISTS: `SELECT public.sp_domain_exists(:name)`,
    
    SEARCH: `SELECT * FROM public.sp_domain_search(:search_term)`,
    
    GET_WITH_PROGRAM_COUNT: `SELECT * FROM public.sp_domain_get_with_program_count()`,
    
    GET_BY_ID_WITH_PROGRAMS: `SELECT * FROM public.sp_domain_get_by_id_with_programs(:id)`,
    
    GET_PROGRAMS: `SELECT * FROM public.sp_domain_get_programs(:domain_id)`,
    
    COUNT_PROGRAMS: `SELECT public.sp_domain_count_programs(:domain_id)`,
  },

  PROGRAM: {
    CREATE: `SELECT * FROM public.sp_program_create(:name, :domain_id)`,
    
    GET_BY_ID: `SELECT * FROM public.sp_program_get_by_id(:id)`,
    
    GET_BY_NAME_DOMAIN: `SELECT * FROM public.sp_program_get_by_name_domain(:name, :domain_id)`,
    
    GET_ALL: `SELECT * FROM public.sp_program_get_all()`,
    
    GET_BY_DOMAIN: `SELECT * FROM public.sp_program_get_by_domain(:domain_id)`,
    
    UPDATE: `SELECT * FROM public.sp_program_update(:id, :name, :domain_id)`,
    
    DELETE: `SELECT public.sp_program_delete(:id)`,
    
    EXISTS: `SELECT public.sp_program_exists(:name, :domain_id)`,
    
    SEARCH: `SELECT * FROM public.sp_program_search(:search_term)`,
    
    GET_WITH_LEVEL_COUNT: `SELECT * FROM public.sp_program_get_with_level_count()`,
    
    GET_LEVELS: `SELECT * FROM public.sp_program_get_levels(:program_id)`,
    
    GET_FULL_DETAILS: `SELECT * FROM public.sp_program_get_full_details(:program_id)`,
    
    GET_BY_INSTITUTION: `SELECT * FROM public.sp_program_get_by_institution(:institution_id)`,
    
    COUNT_LEVELS: `SELECT public.sp_program_count_levels(:program_id)`,
    
    COUNT_INSTITUTIONS: `SELECT public.sp_program_count_institutions(:program_id)`,
  },

  LEVEL: {
    CREATE: `SELECT * FROM public.sp_level_create(:program_id, :name, :sort_order)`,
    
    GET_BY_ID: `SELECT * FROM public.sp_level_get_by_id(:id)`,
    
    GET_BY_NAME_PROGRAM: `SELECT * FROM public.sp_level_get_by_name_program(:name, :program_id)`,
    
    GET_ALL: `SELECT * FROM public.sp_level_get_all()`,
    
    GET_BY_PROGRAM: `SELECT * FROM public.sp_level_get_by_program(:program_id)`,
    
    UPDATE: `SELECT * FROM public.sp_level_update(:id, :name, :program_id, :sort_order)`,
    
    DELETE: `SELECT public.sp_level_delete(:id)`,
    
    EXISTS: `SELECT public.sp_level_exists(:name, :program_id)`,
    
    SEARCH: `SELECT * FROM public.sp_level_search(:search_term)`,
    
    GET_WITH_SEMESTER_COUNT: `SELECT * FROM public.sp_level_get_with_semester_count()`,
    
    GET_SEMESTERS: `SELECT * FROM public.sp_level_get_semesters(:level_id)`,
    
    UPDATE_SORT_ORDER: `SELECT * FROM public.sp_level_update_sort_order(:id, :sort_order)`,
    
    REORDER: `SELECT public.sp_level_reorder(:level_id_1, :level_id_2)`,
    
    GET_NEXT_SORT_ORDER: `SELECT public.sp_level_get_next_sort_order(:program_id)`,
    
    COUNT_SEMESTERS: `SELECT public.sp_level_count_semesters(:level_id)`,
    
    GET_FULL_DETAILS: `SELECT * FROM public.sp_level_get_full_details(:level_id)`,
  },

  SEMESTER: {
    CREATE: `SELECT * FROM public.sp_semester_create(:level_id, :name, :sort_order)`,
    
    GET_BY_ID: `SELECT * FROM public.sp_semester_get_by_id(:id)`,
    
    GET_BY_NAME_LEVEL: `SELECT * FROM public.sp_semester_get_by_name_level(:name, :level_id)`,
    
    GET_ALL: `SELECT * FROM public.sp_semester_get_all()`,
    
    GET_BY_LEVEL: `SELECT * FROM public.sp_semester_get_by_level(:level_id)`,
    
    UPDATE: `SELECT * FROM public.sp_semester_update(:id, :name, :level_id, :sort_order)`,
    
    DELETE: `SELECT public.sp_semester_delete(:id)`,
    
    EXISTS: `SELECT public.sp_semester_exists(:name, :level_id)`,
    
    SEARCH: `SELECT * FROM public.sp_semester_search(:search_term)`,
    
    GET_WITH_MODULE_COUNT: `SELECT * FROM public.sp_semester_get_with_module_count()`,
    
    GET_MODULES: `SELECT * FROM public.sp_semester_get_modules(:semester_id)`,
    
    UPDATE_SORT_ORDER: `SELECT * FROM public.sp_semester_update_sort_order(:id, :sort_order)`,
    
    REORDER: `SELECT public.sp_semester_reorder(:semester_id_1, :semester_id_2)`,
    
    GET_NEXT_SORT_ORDER: `SELECT public.sp_semester_get_next_sort_order(:level_id)`,
    
    COUNT_MODULES: `SELECT public.sp_semester_count_modules(:semester_id)`,
    
    GET_FULL_HIERARCHY: `SELECT * FROM public.sp_semester_get_full_hierarchy(:semester_id)`,
    
    GET_FULL_DETAILS: `SELECT * FROM public.sp_semester_get_full_details(:semester_id)`,
  },

   STUDENT_PROFILE: {
    CREATE: `SELECT * FROM public.sp_student_profile_create(:user_id, :institution_id, :program_id, :current_semester_id)`,
    
    GET_BY_USER_ID: `SELECT * FROM public.sp_student_profile_get_by_user_id(:user_id)`,
    
    GET_ALL: `SELECT * FROM public.sp_student_profile_get_all()`,
    
    UPDATE: `SELECT * FROM public.sp_student_profile_update(:user_id, :institution_id, :program_id, :current_semester_id)`,
    
    UPDATE_INSTITUTION: `SELECT * FROM public.sp_student_profile_update_institution(:user_id, :institution_id)`,
    
    UPDATE_PROGRAM: `SELECT * FROM public.sp_student_profile_update_program(:user_id, :program_id)`,
    
    UPDATE_SEMESTER: `SELECT * FROM public.sp_student_profile_update_semester(:user_id, :current_semester_id)`,
    
    DELETE: `SELECT public.sp_student_profile_delete(:user_id)`,
    
    EXISTS: `SELECT public.sp_student_profile_exists(:user_id)`,
    
    GET_BY_INSTITUTION: `SELECT * FROM public.sp_student_profile_get_by_institution(:institution_id)`,
    
    GET_BY_PROGRAM: `SELECT * FROM public.sp_student_profile_get_by_program(:program_id)`,
    
    GET_BY_SEMESTER: `SELECT * FROM public.sp_student_profile_get_by_semester(:semester_id)`,
    
    COUNT_BY_INSTITUTION: `SELECT public.sp_student_profile_count_by_institution(:institution_id)`,
    
    COUNT_BY_PROGRAM: `SELECT public.sp_student_profile_count_by_program(:program_id)`,
    
    COUNT_BY_SEMESTER: `SELECT public.sp_student_profile_count_by_semester(:semester_id)`,
    
    GET_FULL_DETAILS: `SELECT * FROM public.sp_student_profile_get_full_details(:user_id)`,
  },

RESOURCE: {
  CREATE: `SELECT * FROM public.sp_resource_create(:title, :description, :status, :url, :language, :license, :created_by, :educational_type, :format, :resource_type_id, :metadata)`,
  
  GET_BY_ID: `SELECT * FROM public.sp_resource_get_by_id(:id)`,
  
  GET_ALL: `SELECT * FROM public.sp_resource_get_all()`,
  
  GET_BY_STATUS: `SELECT * FROM public.sp_resource_get_by_status(:status)`,
  
  GET_BY_EDUCATIONAL_TYPE: `SELECT * FROM public.sp_resource_get_by_educational_type(:educational_type)`,
  
  GET_BY_FORMAT: `SELECT * FROM public.sp_resource_get_by_format(:format)`,
  
  GET_BY_RESOURCE_TYPE: `SELECT * FROM public.sp_resource_get_by_resource_type(:resource_type_id)`,
  
  GET_BY_CREATOR: `SELECT * FROM public.sp_resource_get_by_creator(:created_by)`,
  
  GET_BY_LANGUAGE: `SELECT * FROM public.sp_resource_get_by_language(:language)`,
  
  UPDATE: `SELECT * FROM public.sp_resource_update(:id, :title, :description, :status, :url, :language, :license, :educational_type, :format, :resource_type_id, :metadata)`,
  
  UPDATE_METADATA: `SELECT * FROM public.sp_resource_update_metadata(:id, :metadata)`,
  
  UPDATE_STATUS: `SELECT * FROM public.sp_resource_update_status(:id, :status)`,
  
  PUBLISH: `SELECT * FROM public.sp_resource_publish(:id)`,
  
  ARCHIVE: `SELECT * FROM public.sp_resource_archive(:id)`,
  
  DELETE: `SELECT public.sp_resource_delete(:id)`,
  
  SEARCH: `SELECT * FROM public.sp_resource_search(:search_term)`,
  
  ADVANCED_SEARCH: `SELECT * FROM public.sp_resource_advanced_search(:search_term, :status, :educational_type, :format, :language, :resource_type_id)`,
  
  GET_PUBLISHED: `SELECT * FROM public.sp_resource_get_published()`,
  
  COUNT_BY_STATUS: `SELECT public.sp_resource_count_by_status(:status)`,
  
  COUNT_BY_EDUCATIONAL_TYPE: `SELECT public.sp_resource_count_by_educational_type(:educational_type)`,
  
  COUNT_BY_FORMAT: `SELECT public.sp_resource_count_by_format(:format)`,
  
  COUNT_BY_CREATOR: `SELECT public.sp_resource_count_by_creator(:created_by)`,
  
  GET_WITH_RATINGS: `SELECT * FROM public.sp_resource_get_with_ratings()`,
  
  GET_STATISTICS: `SELECT * FROM public.sp_resource_get_statistics(:resource_id)`,
  
  GET_STATUSES: `SELECT * FROM public.sp_resource_get_statuses()`,
  
  GET_EDUCATIONAL_TYPES: `SELECT * FROM public.sp_resource_get_educational_types()`,
  
  GET_FORMATS: `SELECT * FROM public.sp_resource_get_formats()`,
  
  SEARCH_BY_METADATA: `SELECT * FROM public.sp_resource_search_by_metadata(:metadata_key, :metadata_value)`,
},





};
