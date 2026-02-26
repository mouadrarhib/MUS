import { UserRole } from "../models/index.js";

export const SQL = {
  ADMIN: {
    
  // ===========================================================================
  // USER OVERVIEW MANAGEMENT
  // ===========================================================================
  
  GET_ALL_USERS_OVERVIEW: `
    SELECT * FROM public.vw_admin_user_overview 
    ORDER BY user_created_at DESC
  `,

    // ===========================================================================
    // STUDENTS MANAGEMENT
    // ===========================================================================
    
    // ===== LISTE & DÉTAILS STUDENTS =====
    GET_ALL_STUDENTS: `SELECT * FROM vw_admin_students_list ORDER BY account_created_at DESC`,
    
    GET_STUDENT_DETAILS: `
      SELECT * FROM vw_admin_student_full_details 
      WHERE user_id = :user_id
    `,
    
    GET_STUDENTS_STATISTICS: `SELECT * FROM vw_admin_students_statistics`,
    
    // ===== FILTRES STUDENTS =====
    FILTER_STUDENTS_BY_STATUS: `
      SELECT * FROM vw_admin_students_list 
      WHERE is_active = :is_active
      ORDER BY account_created_at DESC
    `,
    
    FILTER_STUDENTS_BY_PROFILE: `
      SELECT * FROM vw_admin_students_list 
      WHERE has_profile = :has_profile
      ORDER BY account_created_at DESC
    `,
    
    FILTER_STUDENTS_BY_INSTITUTION: `
      SELECT * FROM vw_admin_students_list 
      WHERE institution_id = :institution_id
      ORDER BY account_created_at DESC
    `,
    
    FILTER_STUDENTS_BY_PROGRAM: `
      SELECT * FROM vw_admin_students_list 
      WHERE program_id = :program_id
      ORDER BY account_created_at DESC
    `,
    
    // ===== RECHERCHE STUDENTS =====
    SEARCH_STUDENTS: `
      SELECT * FROM vw_admin_students_list
      WHERE LOWER(full_name) LIKE LOWER(:search)
      OR LOWER(email) LIKE LOWER(:search)
      ORDER BY account_created_at DESC
    `,
    
    // ===========================================================================
    // RESOURCES MANAGEMENT - ARCHITECTURE MULTI-ROLES
    // ===========================================================================
    
    // ===== VUE PRINCIPALE (Tous les rôles) =====
    
    GET_ALL_USER_RESOURCES: `
      SELECT * FROM vw_admin_user_resources 
      ORDER BY resource_created_at DESC
    `,
    
    GET_USER_RESOURCES_BY_CREATOR: `
      SELECT * FROM vw_admin_user_resources 
      WHERE creator_id = :creator_id
      ORDER BY resource_created_at DESC
    `,
    
    // ===== VUES SPÉCIALISÉES PAR RÔLE =====
    
    GET_ALL_STUDENT_RESOURCES: `
      SELECT * FROM vw_admin_student_resources 
      ORDER BY resource_created_at DESC
    `,
    
    GET_ALL_TEACHER_RESOURCES: `
      SELECT * FROM vw_admin_teacher_resources 
      ORDER BY resource_created_at DESC
    `,
    
    // ===== FILTRES RESOURCES =====
    
    FILTER_RESOURCES_BY_ROLE: `
      SELECT * FROM vw_admin_user_resources 
      WHERE :role = ANY(creator_roles)
      ORDER BY resource_created_at DESC
    `,
    
    FILTER_RESOURCES_BY_STATUS: `
      SELECT * FROM vw_admin_user_resources 
      WHERE resource_status = :status
      ORDER BY resource_created_at DESC
    `,
    
    FILTER_RESOURCES_BY_MODULE: `
      SELECT * FROM vw_admin_user_resources 
      WHERE module_id = :module_id
      ORDER BY resource_created_at DESC
    `,
    
    FILTER_RESOURCES_BY_PROGRAM: `
      SELECT * FROM vw_admin_user_resources 
      WHERE program_id = :program_id
      ORDER BY resource_created_at DESC
    `,
    
    FILTER_RESOURCES_BY_DOMAIN: `
      SELECT * FROM vw_admin_user_resources 
      WHERE domain_id = :domain_id
      ORDER BY resource_created_at DESC
    `,
    
    // ===== STATISTIQUES RESOURCES =====
    
    GET_RESOURCES_STATS_BY_ROLE: `
      SELECT 
        primary_role,
        COUNT(DISTINCT resource_id) AS total_resources,
        COUNT(DISTINCT resource_id) FILTER (WHERE resource_status = 'published') AS published,
        COUNT(DISTINCT resource_id) FILTER (WHERE resource_status = 'draft') AS draft,
        COUNT(DISTINCT resource_id) FILTER (WHERE resource_status = 'archived') AS archived,
        COUNT(DISTINCT creator_id) AS total_creators,
        AVG(avg_rating)::NUMERIC(3,2) AS avg_rating_all,
        SUM(total_favorites)::BIGINT AS total_favorites_all,
        SUM(total_ratings)::BIGINT AS total_ratings_all
      FROM vw_admin_user_resources
      GROUP BY primary_role
      ORDER BY total_resources DESC
    `,
    
    GET_RESOURCES_STATS_BY_STATUS: `
      SELECT 
        resource_status,
        COUNT(DISTINCT resource_id) AS total,
        COUNT(DISTINCT creator_id) AS total_creators,
        AVG(avg_rating)::NUMERIC(3,2) AS avg_rating
      FROM vw_admin_user_resources
      GROUP BY resource_status
      ORDER BY total DESC
    `,
    
    GET_RESOURCES_STATS_BY_MODULE: `
      SELECT 
        module_id,
        module_code,
        module_title,
        COUNT(DISTINCT resource_id) AS total_resources,
        COUNT(DISTINCT creator_id) AS total_creators,
        AVG(avg_rating)::NUMERIC(3,2) AS avg_rating
      FROM vw_admin_user_resources
      WHERE module_id IS NOT NULL
      GROUP BY module_id, module_code, module_title
      ORDER BY total_resources DESC
    `,
    
    // ===== RECHERCHE RESOURCES =====
    
    SEARCH_RESOURCES: `
      SELECT * FROM vw_admin_user_resources
      WHERE LOWER(resource_title) LIKE LOWER(:search)
      OR LOWER(resource_description) LIKE LOWER(:search)
      OR LOWER(creator_name) LIKE LOWER(:search)
      ORDER BY resource_created_at DESC
    `,
    
    SEARCH_RESOURCES_BY_CREATOR: `
      SELECT * FROM vw_admin_user_resources
      WHERE (LOWER(resource_title) LIKE LOWER(:search)
      OR LOWER(resource_description) LIKE LOWER(:search))
      AND creator_id = :creator_id
      ORDER BY resource_created_at DESC
    `,
    
    // ===========================================================================
    // COMPATIBILITÉ - ANCIENNES REQUÊTES (à garder pour ne pas casser le code)
    // ===========================================================================
    
    /**
     * @deprecated Utiliser GET_USER_RESOURCES_BY_CREATOR à la place
     * Cette requête utilise l'ancien nom de colonne student_user_id
     * mais reste fonctionnelle grâce aux alias dans la vue
     */
    GET_STUDENT_RESOURCES: `
      SELECT * FROM vw_admin_student_resources 
      WHERE student_user_id = :user_id
      ORDER BY resource_created_at DESC
    `,
  },

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

  USER_SETTINGS: {
    CREATE: `SELECT * FROM public.sp_user_settings_create(:user_id, :theme_mode, :font_size, :language, :timezone, :date_format, :email_notifications, :push_notifications, :resource_alerts, :weekly_digest, :show_activity_status, :show_profile, :two_factor_enabled)`,

    GET_BY_USER_ID: `SELECT * FROM public.sp_user_settings_get_by_user_id(:user_id)`,

    UPDATE: `SELECT * FROM public.sp_user_settings_update(:user_id, :theme_mode, :font_size, :language, :timezone, :date_format, :email_notifications, :push_notifications, :resource_alerts, :weekly_digest, :show_activity_status, :show_profile, :two_factor_enabled)`,

    UPDATE_APPEARANCE: `SELECT * FROM public.sp_user_settings_update_appearance(:user_id, :theme_mode, :font_size)`,

    UPDATE_NOTIFICATIONS: `SELECT * FROM public.sp_user_settings_update_notifications(:user_id, :email_notifications, :push_notifications, :resource_alerts, :weekly_digest)`,

    UPDATE_PRIVACY: `SELECT * FROM public.sp_user_settings_update_privacy(:user_id, :show_activity_status, :show_profile, :two_factor_enabled)`,

    UPDATE_LOCALE: `SELECT * FROM public.sp_user_settings_update_locale(:user_id, :language, :timezone, :date_format)`,

    DELETE: `SELECT public.sp_user_settings_delete(:user_id)`,

    EXISTS: `SELECT public.sp_user_settings_exists(:user_id)`,
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

  MODULE: {
    CREATE: `SELECT * FROM public.sp_module_create(:semester_id, :code, :title, :description)`,

    GET_BY_ID: `SELECT * FROM public.sp_module_get_by_id(:id)`,

    GET_BY_CODE_SEMESTER: `SELECT * FROM public.sp_module_get_by_code_semester(:code, :semester_id)`,

    GET_ALL: `SELECT * FROM public.sp_module_get_all()`,

    GET_BY_SEMESTER: `SELECT * FROM public.sp_module_get_by_semester(:semester_id)`,

    UPDATE: `SELECT * FROM public.sp_module_update(:id, :code, :title, :description, :semester_id)`,

    DELETE: `SELECT public.sp_module_delete(:id)`,

    EXISTS: `SELECT public.sp_module_exists(:code, :semester_id)`,

    SEARCH: `SELECT * FROM public.sp_module_search(:search_term)`,

    GET_WITH_RESOURCE_COUNT: `SELECT * FROM public.sp_module_get_with_resource_count()`,

    GET_RESOURCES: `SELECT * FROM public.sp_module_get_resources(:module_id)`,

    COUNT_RESOURCES: `SELECT public.sp_module_count_resources(:module_id)`,

    GET_FULL_HIERARCHY: `SELECT * FROM public.sp_module_get_full_hierarchy(:module_id)`,

    GET_FULL_DETAILS: `SELECT * FROM public.sp_module_get_full_details(:module_id)`,

    GET_BY_LEVEL: `SELECT * FROM public.sp_module_get_by_level(:level_id)`,

    GET_BY_PROGRAM: `SELECT * FROM public.sp_module_get_by_program(:program_id)`,

    GET_BY_DOMAIN: `SELECT * FROM public.sp_module_get_by_domain(:domain_id)`,

    COUNT_BY_SEMESTER: `SELECT public.sp_module_count_by_semester(:semester_id)`,

    GET_STATISTICS: `SELECT * FROM public.sp_module_get_statistics(:module_id)`,

    GET_BY_RESOURCE_TYPE: `SELECT * FROM public.sp_module_get_by_resource_type(:resource_type_id)`,
  },

  RATING: {
    CREATE: `SELECT * FROM public.sp_rating_create(:user_id, :resource_id, :score, :comment)`,

    GET_BY_USER_RESOURCE: `SELECT * FROM public.sp_rating_get_by_user_resource(:user_id, :resource_id)`,

    GET_BY_RESOURCE: `SELECT * FROM public.sp_rating_get_by_resource(:resource_id)`,

    GET_BY_USER: `SELECT * FROM public.sp_rating_get_by_user(:user_id)`,

    UPDATE: `SELECT * FROM public.sp_rating_update(:user_id, :resource_id, :score, :comment)`,

    DELETE: `SELECT public.sp_rating_delete(:user_id, :resource_id)`,

    EXISTS: `SELECT public.sp_rating_exists(:user_id, :resource_id)`,

    GET_AVERAGE: `SELECT * FROM public.sp_rating_get_average(:resource_id)`,

    GET_STATISTICS: `SELECT * FROM public.sp_rating_get_statistics(:resource_id)`,

    GET_RESOURCES_WITH_RATINGS: `SELECT * FROM public.sp_rating_get_resources_with_ratings()`,

    GET_TOP_RATED: `SELECT * FROM public.sp_rating_get_top_rated(:limit, :min_ratings)`,

    GET_RECENT: `SELECT * FROM public.sp_rating_get_recent(:limit)`,

    GET_BY_SCORE: `SELECT * FROM public.sp_rating_get_by_score(:resource_id, :score)`,

    COUNT_BY_RESOURCE: `SELECT public.sp_rating_count_by_resource(:resource_id)`,

    COUNT_BY_USER: `SELECT public.sp_rating_count_by_user(:user_id)`,

    GET_USER_SUMMARY: `SELECT * FROM public.sp_rating_get_user_summary(:user_id)`,

    GET_WITH_COMMENTS: `SELECT * FROM public.sp_rating_get_with_comments(:resource_id)`,

    UPSERT: `SELECT * FROM public.sp_rating_upsert(:user_id, :resource_id, :score, :comment)`,

    GET_BY_DATE_RANGE: `SELECT * FROM public.sp_rating_get_by_date_range(:resource_id, :start_date, :end_date)`,

    DELETE_BY_RESOURCE: `SELECT public.sp_rating_delete_by_resource(:resource_id)`,
  },

  TAG: {
    CREATE: `SELECT * FROM public.sp_tag_create(:name, :slug, :category, :description, :created_by)`,

    GET_BY_ID: `SELECT * FROM public.sp_tag_get_by_id(:id)`,

    GET_BY_SLUG: `SELECT * FROM public.sp_tag_get_by_slug(:slug)`,

    GET_ALL: `SELECT * FROM public.sp_tag_get_all(:search_term, :category, :is_active, :limit_value)`,

    UPDATE: `SELECT * FROM public.sp_tag_update(:id, :name, :slug, :category, :description, :is_active)`,

    DELETE: `SELECT public.sp_tag_delete(:id)`,

    EXISTS_BY_SLUG: `SELECT public.sp_tag_exists_by_slug(:slug, :exclude_id)`,

    GET_BY_RESOURCE: `SELECT * FROM public.sp_tag_get_by_resource(:resource_id)`,

    GET_BY_RESOURCES: `SELECT * FROM public.sp_tag_get_by_resources(CAST(:resource_ids AS BIGINT[]))`,

    ATTACH_TO_RESOURCE: `SELECT * FROM public.sp_tag_attach_to_resource(:resource_id, :tag_id)`,

    DETACH_FROM_RESOURCE: `SELECT public.sp_tag_detach_from_resource(:resource_id, :tag_id)`,

    REPLACE_RESOURCE_TAGS: `SELECT * FROM public.sp_tag_replace_resource_tags(:resource_id, CAST(:tag_ids AS BIGINT[]))`,

    GET_POPULAR: `SELECT * FROM public.sp_tag_get_popular(:limit_value)`,
  },

  FAVORITE: {
    // Add/Remove operations (avec mapping des noms)
    ADD: `
    SELECT 
      fav_user_id AS user_id,
      fav_resource_id AS resource_id,
      fav_created_at AS created_at
    FROM public.sp_favorite_add(:user_id, :resource_id)
  `,

    REMOVE: `SELECT public.sp_favorite_remove(:user_id, :resource_id)`,

    TOGGLE: `
    SELECT 
      fav_is_favorited AS is_favorited,
      fav_action AS action
    FROM public.sp_favorite_toggle(:user_id, :resource_id)
  `,

    REMOVE_ALL_BY_USER: `SELECT public.sp_favorite_remove_all_by_user(:user_id)`,

    // Check operations
    EXISTS: `SELECT public.sp_favorite_exists(:user_id, :resource_id)`,

    // Get user favorites (les autres fonctions retournent les bons noms directement)
    GET_BY_USER: `SELECT * FROM public.sp_favorite_get_by_user(:user_id)`,

    GET_BY_USER_STATUS: `SELECT * FROM public.sp_favorite_get_by_user_status(:user_id, :status)`,

    GET_BY_USER_EDUCATIONAL_TYPE: `SELECT * FROM public.sp_favorite_get_by_user_educational_type(:user_id, :educational_type)`,

    GET_BY_USER_FORMAT: `SELECT * FROM public.sp_favorite_get_by_user_format(:user_id, :format)`,

    GET_RECENT_BY_USER: `SELECT * FROM public.sp_favorite_get_recent_by_user(:user_id, :limit)`,

    // Count operations
    COUNT_BY_USER: `SELECT public.sp_favorite_count_by_user(:user_id)`,

    COUNT_BY_RESOURCE: `SELECT public.sp_favorite_count_by_resource(:resource_id)`,

    // Statistics and analytics
    GET_USER_STATISTICS: `SELECT * FROM public.sp_favorite_get_user_statistics(:user_id)`,

    GET_MOST_POPULAR: `SELECT * FROM public.sp_favorite_get_most_popular(:limit)`,

    // Search
    SEARCH_BY_USER: `SELECT * FROM public.sp_favorite_search_by_user(:user_id, :search_term)`,

    // Admin/Analytics
    GET_USERS_BY_RESOURCE: `SELECT * FROM public.sp_favorite_get_users_by_resource(:resource_id)`,
  },


};
