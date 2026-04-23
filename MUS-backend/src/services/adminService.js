import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
import AppError from "../helpers/appError.js";
import { assertCanChangeUserActiveState } from "./userRolePolicyService.js";


/**
 * ============================================================================
 * USER OVERVIEW MANAGEMENT
 * ============================================================================
 */


/**
 * Récupérer tous les utilisateurs avec vue d'ensemble complète
 * (informations personnelles, profil étudiant, statistiques des ressources)
 */
export const getAllUsersOverview = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_ALL_USERS_OVERVIEW);
  return results;
};

/**
 * Get users points management overview (non-admin users by default)
 */
export const getUsersPointsOverview = async ({ includeAdmin = false } = {}) => {
  const [results] = await sequelize.query(
    `
    SELECT
      u.id AS user_id,
      u.full_name,
      u.email,
      u.is_active,
      COALESCE(u.points, 0)::BIGINT AS points,
      STRING_AGG(DISTINCT ro.name, ', ' ORDER BY ro.name) AS roles,
      COUNT(DISTINCT r.id)::BIGINT AS total_resources_created,
      COUNT(
        DISTINCT CASE
          WHEN f.user_id IS NOT NULL AND f.resource_id IS NOT NULL
            THEN CONCAT(f.user_id::text, ':', f.resource_id::text)
          ELSE NULL
        END
      )::BIGINT AS total_favorites_received,
      MAX(r.created_at) AS latest_resource_created_at
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.id
    INNER JOIN roles ro ON ro.id = ur.role_id
    LEFT JOIN resources r ON r.created_by = u.id
    LEFT JOIN favorites f ON f.resource_id = r.id
    WHERE (:include_admin OR ro.name <> 'admin')
    GROUP BY u.id, u.full_name, u.email, u.is_active, u.points
    ORDER BY COALESCE(u.points, 0) DESC, u.full_name ASC
    `,
    {
      replacements: { include_admin: includeAdmin },
    }
  );

  return results;
};

export const getContributorRewardsAnalytics = async ({
  periodDays = 30,
  role = "all",
  search = "",
  contributorsPage = 1,
  contributorsLimit = 10,
  activityPage = 1,
  activityLimit = 10,
  topResourcesLimit = 12,
} = {}) => {
  const safePeriodDays = Math.min(Math.max(Number(periodDays) || 30, 1), 90);
  const safeRole = String(role || "all").toLowerCase() === "teacher"
    ? "teacher"
    : String(role || "all").toLowerCase() === "student"
      ? "student"
      : "all";
  const safeSearch = String(search || "").trim().toLowerCase();
  const searchLike = `%${safeSearch}%`;
  const safeContributorsPage = Math.max(Number(contributorsPage) || 1, 1);
  const safeContributorsLimit = Math.min(Math.max(Number(contributorsLimit) || 10, 1), 100);
  const safeActivityPage = Math.max(Number(activityPage) || 1, 1);
  const safeActivityLimit = Math.min(Math.max(Number(activityLimit) || 10, 1), 100);
  const safeTopResourcesLimit = Math.min(Math.max(Number(topResourcesLimit) || 12, 1), 50);
  const contributorsOffset = (safeContributorsPage - 1) * safeContributorsLimit;
  const activityOffset = (safeActivityPage - 1) * safeActivityLimit;

  const replacements = {
    period_days: safePeriodDays,
    role_filter: safeRole,
    search_term: safeSearch,
    search_like: searchLike,
  };

  const [summaryRows] = await sequelize.query(
    `
    WITH role_flags AS (
      SELECT
        ur.user_id,
        BOOL_OR(lower(ro.name) = 'teacher') AS is_teacher,
        BOOL_OR(lower(ro.name) = 'student') AS is_student
      FROM public.user_roles ur
      INNER JOIN public.roles ro ON ro.id = ur.role_id
      GROUP BY ur.user_id
    ),
    contributors AS (
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.is_active,
        COALESCE(u.points, 0)::BIGINT AS points,
        CASE
          WHEN rf.is_teacher THEN 'teacher'
          WHEN rf.is_student THEN 'student'
          ELSE NULL
        END AS primary_role
      FROM public.users u
      INNER JOIN role_flags rf ON rf.user_id = u.id
      WHERE rf.is_teacher OR rf.is_student
    ),
    filtered_contributors AS (
      SELECT *
      FROM contributors c
      WHERE (:role_filter = 'all' OR c.primary_role = :role_filter)
        AND (
          :search_term = ''
          OR lower(COALESCE(c.full_name, '')) LIKE :search_like
          OR lower(COALESCE(c.email, '')) LIKE :search_like
        )
    ),
    contributor_resources AS (
      SELECT r.id, r.created_by
      FROM public.resources r
      INNER JOIN filtered_contributors c ON c.id = r.created_by
    ),
    reward_events AS (
      SELECT wpe.*
      FROM public.wallet_points_events wpe
      INNER JOIN filtered_contributors c ON c.id = wpe.user_id
      WHERE wpe.event_type IN ('download_reward', 'favorite_added_reward', 'favorite_removed_penalty')
    )
    SELECT
      COUNT(*)::BIGINT AS total_contributors,
      COUNT(*) FILTER (WHERE c.is_active)::BIGINT AS active_contributors,
      COUNT(*) FILTER (WHERE c.primary_role = 'student')::BIGINT AS total_students,
      COUNT(*) FILTER (WHERE c.primary_role = 'teacher')::BIGINT AS total_teachers,
      COALESCE(SUM(c.points), 0)::BIGINT AS total_current_points,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.resource_downloads rd
        INNER JOIN contributor_resources cr ON cr.id = rd.resource_id
      ) AS total_downloads,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.favorites f
        INNER JOIN contributor_resources cr ON cr.id = f.resource_id
      ) AS total_favorites,
      (SELECT COALESCE(SUM(re.points_change), 0)::BIGINT FROM reward_events re) AS total_points_from_events,
      (SELECT COALESCE(SUM(re.points_change), 0)::BIGINT FROM reward_events re WHERE re.occurred_at >= NOW() - INTERVAL '7 days') AS points_last_7_days,
      (SELECT COALESCE(SUM(re.points_change), 0)::BIGINT FROM reward_events re WHERE re.occurred_at >= NOW() - INTERVAL '30 days') AS points_last_30_days,
      (SELECT COALESCE(SUM(re.points_change), 0)::BIGINT FROM reward_events re WHERE re.occurred_at >= NOW() - (:period_days * INTERVAL '1 day')) AS points_last_period,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.resource_downloads rd
        INNER JOIN contributor_resources cr ON cr.id = rd.resource_id
        WHERE rd.downloaded_at >= NOW() - INTERVAL '7 days'
      ) AS downloads_last_7_days,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.resource_downloads rd
        INNER JOIN contributor_resources cr ON cr.id = rd.resource_id
        WHERE rd.downloaded_at >= NOW() - INTERVAL '30 days'
      ) AS downloads_last_30_days,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.resource_downloads rd
        INNER JOIN contributor_resources cr ON cr.id = rd.resource_id
        WHERE rd.downloaded_at >= NOW() - (:period_days * INTERVAL '1 day')
      ) AS downloads_last_period,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.favorites f
        INNER JOIN contributor_resources cr ON cr.id = f.resource_id
        WHERE f.created_at >= NOW() - INTERVAL '7 days'
      ) AS favorites_last_7_days,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.favorites f
        INNER JOIN contributor_resources cr ON cr.id = f.resource_id
        WHERE f.created_at >= NOW() - INTERVAL '30 days'
      ) AS favorites_last_30_days,
      (
        SELECT COUNT(*)::BIGINT
        FROM public.favorites f
        INNER JOIN contributor_resources cr ON cr.id = f.resource_id
        WHERE f.created_at >= NOW() - (:period_days * INTERVAL '1 day')
      ) AS favorites_last_period
    FROM filtered_contributors c
    `,
    { replacements }
  );

  const [contributorsRows] = await sequelize.query(
    `
    WITH role_flags AS (
      SELECT
        ur.user_id,
        BOOL_OR(lower(ro.name) = 'teacher') AS is_teacher,
        BOOL_OR(lower(ro.name) = 'student') AS is_student
      FROM public.user_roles ur
      INNER JOIN public.roles ro ON ro.id = ur.role_id
      GROUP BY ur.user_id
    ),
    contributors AS (
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.is_active,
        COALESCE(u.points, 0)::BIGINT AS points,
        CASE
          WHEN rf.is_teacher THEN 'teacher'
          WHEN rf.is_student THEN 'student'
          ELSE NULL
        END AS primary_role
      FROM public.users u
      INNER JOIN role_flags rf ON rf.user_id = u.id
      WHERE rf.is_teacher OR rf.is_student
    ),
    filtered_contributors AS (
      SELECT *
      FROM contributors c
      WHERE (:role_filter = 'all' OR c.primary_role = :role_filter)
        AND (
          :search_term = ''
          OR lower(COALESCE(c.full_name, '')) LIKE :search_like
          OR lower(COALESCE(c.email, '')) LIKE :search_like
        )
    ),
    resource_stats AS (
      SELECT
        r.created_by AS user_id,
        COUNT(*)::BIGINT AS total_resources_created,
        COUNT(*) FILTER (WHERE lower(r.status::text) = 'published')::BIGINT AS published_resources,
        MAX(r.created_at) AS latest_resource_created_at
      FROM public.resources r
      GROUP BY r.created_by
    ),
    download_stats AS (
      SELECT
        r.created_by AS user_id,
        COUNT(*)::BIGINT AS total_downloads_received
      FROM public.resources r
      INNER JOIN public.resource_downloads rd ON rd.resource_id = r.id
      GROUP BY r.created_by
    ),
    favorite_stats AS (
      SELECT
        r.created_by AS user_id,
        COUNT(*)::BIGINT AS total_favorites_received
      FROM public.resources r
      INNER JOIN public.favorites f ON f.resource_id = r.id
      GROUP BY r.created_by
    ),
    reward_stats AS (
      SELECT
        wpe.user_id,
        COALESCE(SUM(wpe.points_change), 0)::BIGINT AS total_points_from_events,
        COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.event_type = 'download_reward'), 0)::BIGINT AS points_from_downloads,
        COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.event_type IN ('favorite_added_reward', 'favorite_removed_penalty')), 0)::BIGINT AS points_from_favorites,
        COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.occurred_at >= NOW() - INTERVAL '30 days'), 0)::BIGINT AS points_last_30_days
      FROM public.wallet_points_events wpe
      GROUP BY wpe.user_id
    )
    SELECT
      c.id AS user_id,
      c.full_name,
      c.email,
      c.is_active,
      c.primary_role,
      c.points,
      COALESCE(rs.total_resources_created, 0)::BIGINT AS total_resources_created,
      COALESCE(rs.published_resources, 0)::BIGINT AS published_resources,
      COALESCE(ds.total_downloads_received, 0)::BIGINT AS total_downloads_received,
      COALESCE(fs.total_favorites_received, 0)::BIGINT AS total_favorites_received,
      COALESCE(ws.points_from_downloads, 0)::BIGINT AS points_from_downloads,
      COALESCE(ws.points_from_favorites, 0)::BIGINT AS points_from_favorites,
      COALESCE(ws.total_points_from_events, 0)::BIGINT AS total_points_from_events,
      COALESCE(ws.points_last_30_days, 0)::BIGINT AS points_last_30_days,
      rs.latest_resource_created_at,
      COUNT(*) OVER()::BIGINT AS total_count
    FROM filtered_contributors c
    LEFT JOIN resource_stats rs ON rs.user_id = c.id
    LEFT JOIN download_stats ds ON ds.user_id = c.id
    LEFT JOIN favorite_stats fs ON fs.user_id = c.id
    LEFT JOIN reward_stats ws ON ws.user_id = c.id
    ORDER BY c.points DESC, c.full_name ASC
    LIMIT :contributors_limit
    OFFSET :contributors_offset
    `,
    {
      replacements: {
        ...replacements,
        contributors_limit: safeContributorsLimit,
        contributors_offset: contributorsOffset,
      },
    }
  );

  const [topResourcesRows] = await sequelize.query(
    `
    WITH role_flags AS (
      SELECT
        ur.user_id,
        BOOL_OR(lower(ro.name) = 'teacher') AS is_teacher,
        BOOL_OR(lower(ro.name) = 'student') AS is_student
      FROM public.user_roles ur
      INNER JOIN public.roles ro ON ro.id = ur.role_id
      GROUP BY ur.user_id
    ),
    contributors AS (
      SELECT
        u.id,
        u.full_name,
        u.email,
        CASE
          WHEN rf.is_teacher THEN 'teacher'
          WHEN rf.is_student THEN 'student'
          ELSE NULL
        END AS primary_role
      FROM public.users u
      INNER JOIN role_flags rf ON rf.user_id = u.id
      WHERE rf.is_teacher OR rf.is_student
    ),
    filtered_contributors AS (
      SELECT *
      FROM contributors c
      WHERE (:role_filter = 'all' OR c.primary_role = :role_filter)
        AND (
          :search_term = ''
          OR lower(COALESCE(c.full_name, '')) LIKE :search_like
          OR lower(COALESCE(c.email, '')) LIKE :search_like
        )
    ),
    contributor_resources AS (
      SELECT
        r.id,
        r.title,
        r.status::text AS status,
        r.created_at,
        r.created_by,
        fc.full_name AS owner_name,
        fc.primary_role AS owner_role
      FROM public.resources r
      INNER JOIN filtered_contributors fc ON fc.id = r.created_by
    ),
    download_stats AS (
      SELECT rd.resource_id, COUNT(*)::BIGINT AS downloads_count
      FROM public.resource_downloads rd
      GROUP BY rd.resource_id
    ),
    favorite_stats AS (
      SELECT f.resource_id, COUNT(*)::BIGINT AS favorites_count
      FROM public.favorites f
      GROUP BY f.resource_id
    ),
    reward_stats AS (
      SELECT
        wpe.resource_id,
        COALESCE(SUM(wpe.points_change), 0)::BIGINT AS points_total,
        COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.event_type = 'download_reward'), 0)::BIGINT AS points_from_downloads,
        COALESCE(SUM(wpe.points_change) FILTER (WHERE wpe.event_type IN ('favorite_added_reward', 'favorite_removed_penalty')), 0)::BIGINT AS points_from_favorites
      FROM public.wallet_points_events wpe
      GROUP BY wpe.resource_id
    )
    SELECT
      cr.id AS resource_id,
      cr.title AS resource_title,
      cr.status AS resource_status,
      cr.created_at,
      cr.created_by AS owner_user_id,
      cr.owner_name,
      cr.owner_role,
      COALESCE(ds.downloads_count, 0)::BIGINT AS downloads_count,
      COALESCE(fs.favorites_count, 0)::BIGINT AS favorites_count,
      COALESCE(rs.points_from_downloads, 0)::BIGINT AS points_from_downloads,
      COALESCE(rs.points_from_favorites, 0)::BIGINT AS points_from_favorites,
      COALESCE(rs.points_total, 0)::BIGINT AS points_total
    FROM contributor_resources cr
    LEFT JOIN download_stats ds ON ds.resource_id = cr.id
    LEFT JOIN favorite_stats fs ON fs.resource_id = cr.id
    LEFT JOIN reward_stats rs ON rs.resource_id = cr.id
    ORDER BY COALESCE(rs.points_total, 0) DESC, COALESCE(ds.downloads_count, 0) DESC, COALESCE(fs.favorites_count, 0) DESC, cr.created_at DESC
    LIMIT :top_resources_limit
    `,
    {
      replacements: {
        ...replacements,
        top_resources_limit: safeTopResourcesLimit,
      },
    }
  );

  const [recentActivityRows] = await sequelize.query(
    `
    WITH role_flags AS (
      SELECT
        ur.user_id,
        BOOL_OR(lower(ro.name) = 'teacher') AS is_teacher,
        BOOL_OR(lower(ro.name) = 'student') AS is_student
      FROM public.user_roles ur
      INNER JOIN public.roles ro ON ro.id = ur.role_id
      GROUP BY ur.user_id
    ),
    contributors AS (
      SELECT
        u.id,
        u.full_name,
        u.email,
        CASE
          WHEN rf.is_teacher THEN 'teacher'
          WHEN rf.is_student THEN 'student'
          ELSE NULL
        END AS primary_role
      FROM public.users u
      INNER JOIN role_flags rf ON rf.user_id = u.id
      WHERE rf.is_teacher OR rf.is_student
    ),
    filtered_contributors AS (
      SELECT *
      FROM contributors c
      WHERE (:role_filter = 'all' OR c.primary_role = :role_filter)
        AND (
          :search_term = ''
          OR lower(COALESCE(c.full_name, '')) LIKE :search_like
          OR lower(COALESCE(c.email, '')) LIKE :search_like
        )
    )
    SELECT
      wpe.id,
      wpe.event_type,
      wpe.points_change,
      wpe.resource_id,
      r.title AS resource_title,
      wpe.user_id AS beneficiary_user_id,
      fc.full_name AS beneficiary_name,
      fc.primary_role AS beneficiary_role,
      wpe.actor_user_id,
      actor.full_name AS actor_name,
      wpe.occurred_at,
      COUNT(*) OVER()::BIGINT AS total_count
    FROM public.wallet_points_events wpe
    INNER JOIN filtered_contributors fc ON fc.id = wpe.user_id
    LEFT JOIN public.users actor ON actor.id = wpe.actor_user_id
    LEFT JOIN public.resources r ON r.id = wpe.resource_id
    ORDER BY wpe.occurred_at DESC NULLS LAST
    LIMIT :activity_limit
    OFFSET :activity_offset
    `,
    {
      replacements: {
        ...replacements,
        activity_limit: safeActivityLimit,
        activity_offset: activityOffset,
      },
    }
  );

  const contributorsTotal = Number(contributorsRows?.[0]?.total_count || 0);
  const activityTotal = Number(recentActivityRows?.[0]?.total_count || 0);

  return {
    overview: {
      ...(summaryRows?.[0] || {}),
      period_days: safePeriodDays,
    },
    contributors: (contributorsRows || []).map(({ total_count: _total_count, ...rest }) => rest),
    contributors_meta: {
      page: safeContributorsPage,
      limit: safeContributorsLimit,
      total: contributorsTotal,
      total_pages: contributorsTotal > 0 ? Math.ceil(contributorsTotal / safeContributorsLimit) : 0,
    },
    top_resources: topResourcesRows || [],
    recent_activity: (recentActivityRows || []).map(({ total_count: _total_count, ...rest }) => rest),
    recent_activity_meta: {
      page: safeActivityPage,
      limit: safeActivityLimit,
      total: activityTotal,
      total_pages: activityTotal > 0 ? Math.ceil(activityTotal / safeActivityLimit) : 0,
    },
    filters: {
      role: safeRole,
      search: safeSearch,
      period_days: safePeriodDays,
      top_resources_limit: safeTopResourcesLimit,
    },
    generated_at: new Date().toISOString(),
  };
};

/**
 * Adjust user points (positive: pay/add points, negative: deduct points)
 */
export const adjustUserPoints = async (userId, pointsDelta, note = null) => {
  const [rows] = await sequelize.query(
    `
    UPDATE users
    SET
      points = GREATEST(COALESCE(points, 0) + :points_delta, 0),
      updated_at = NOW()
    WHERE id = :user_id
    RETURNING id AS user_id, full_name, email, COALESCE(points, 0)::BIGINT AS points, updated_at
    `,
    {
      replacements: {
        user_id: userId,
        points_delta: Number(pointsDelta),
      },
    }
  );

  if (!rows.length) {
    throw new AppError("Utilisateur introuvable", 404);
  }

  return {
    ...rows[0],
    points_delta: Number(pointsDelta),
    note,
  };
};


/**
 * ============================================================================
 * STUDENTS MANAGEMENT (Utilisation des VUES)
 * ============================================================================
 */


/**
 * Récupérer tous les students
 */
export const getAllStudents = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_ALL_STUDENTS);
  return results;
};


/**
 * Récupérer les détails complets d'un student
 */
export const getStudentDetails = async (userId) => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_STUDENT_DETAILS, {
    replacements: { user_id: userId },
  });
  
  if (results.length === 0) {
    throw new AppError("Etudiant introuvable", 404);
  }
  
  return results[0];
};


/**
 * Récupérer les statistiques globales
 */
export const getStudentsStatistics = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_STUDENTS_STATISTICS);
  return results[0] || {};
};


/**
 * Filtrer les students par statut actif
 */
export const filterStudentsByStatus = async (isActive) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_STUDENTS_BY_STATUS, {
    replacements: { is_active: isActive },
  });
  return results;
};


/**
 * Filtrer les students par profil complété
 */
export const filterStudentsByProfile = async (hasProfile) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_STUDENTS_BY_PROFILE, {
    replacements: { has_profile: hasProfile },
  });
  return results;
};


/**
 * Filtrer les students par institution
 */
export const filterStudentsByInstitution = async (institutionId) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_STUDENTS_BY_INSTITUTION, {
    replacements: { institution_id: institutionId },
  });
  return results;
};


/**
 * Filtrer les students par programme
 */
export const filterStudentsByProgram = async (programId) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_STUDENTS_BY_PROGRAM, {
    replacements: { program_id: programId },
  });
  return results;
};


/**
 * Rechercher des students par nom ou email
 */
export const searchStudents = async (searchTerm) => {
  const [results] = await sequelize.query(SQL.ADMIN.SEARCH_STUDENTS, {
    replacements: { search: `%${searchTerm}%` },
  });
  return results;
};


/**
 * Activer/Désactiver un utilisateur
 */
export const toggleUserStatus = async (userId, isActive) => {
  await assertCanChangeUserActiveState(userId, Boolean(isActive));

  await sequelize.query(SQL.USER.SET_ACTIVE, {
    replacements: { id: userId, is_active: isActive },
  });
  
  return {
    success: true,
    message: `Utilisateur ${isActive ? "active" : "desactive"} avec succes`,
    user_id: userId,
    is_active: isActive,
  };
};


/**
 * Dashboard admin complet
 */
export const getAdminDashboard = async () => {
  const stats = await getStudentsStatistics();

  const [teacherStatsRows] = await sequelize.query(`
    SELECT
      COUNT(DISTINCT u.id)::BIGINT AS total_teachers,
      COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = true)::BIGINT AS active_teachers,
      COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = false)::BIGINT AS inactive_teachers,
      COUNT(r.id)::BIGINT AS total_resources_by_teachers,
      COUNT(r.id) FILTER (WHERE r.status = 'published')::BIGINT AS published_resources,
      COUNT(r.id) FILTER (WHERE r.status = 'draft')::BIGINT AS draft_resources,
      COUNT(r.id) FILTER (WHERE r.status = 'archived')::BIGINT AS archived_resources,
      COUNT(r.id) FILTER (
        WHERE r.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )::BIGINT AS resources_last_7_days,
      COUNT(r.id) FILTER (
        WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days'
      )::BIGINT AS resources_last_30_days,
      COUNT(DISTINCT u.id) FILTER (
        WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )::BIGINT AS new_teachers_last_7_days,
      COUNT(DISTINCT u.id) FILTER (
        WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days'
      )::BIGINT AS new_teachers_last_30_days
    FROM users u
    INNER JOIN user_roles ur ON ur.user_id = u.id
    INNER JOIN roles ro ON ro.id = ur.role_id
    LEFT JOIN resources r ON r.created_by = u.id
    WHERE ro.name = 'teacher'
  `);
  
  // Ajouter d'autres statistiques si nécessaire
  const [globalStats] = await sequelize.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM resources) AS total_resources,
      (SELECT COUNT(*) FROM favorites) AS total_favorites,
      (SELECT COUNT(*) FROM ratings) AS total_ratings
  `);

  const [rewardsStats] = await sequelize.query(`
    WITH contributor_users AS (
      SELECT u.id, u.full_name, COALESCE(u.points, 0) AS points
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles ro ON ur.role_id = ro.id
      WHERE lower(ro.name) IN ('student', 'teacher')
    )
    SELECT
      (SELECT COUNT(*) FROM resource_downloads)::BIGINT AS total_downloads,
      (
        SELECT COUNT(*)
        FROM resource_downloads rd
        WHERE rd.downloaded_at >= CURRENT_DATE - INTERVAL '7 days'
      )::BIGINT AS downloads_last_7_days,
      (
        SELECT COUNT(*)
        FROM resource_downloads rd
        WHERE rd.downloaded_at >= CURRENT_DATE - INTERVAL '30 days'
      )::BIGINT AS downloads_last_30_days,
      (SELECT COALESCE(SUM(cu.points), 0) FROM contributor_users cu)::BIGINT AS total_points_awarded,
      (
        SELECT cu.id
        FROM contributor_users cu
        ORDER BY cu.points DESC, cu.full_name ASC
        LIMIT 1
      ) AS top_points_student_id,
      (
        SELECT cu.full_name
        FROM contributor_users cu
        ORDER BY cu.points DESC, cu.full_name ASC
        LIMIT 1
      ) AS top_points_student_name,
      (
        SELECT cu.points
        FROM contributor_users cu
        ORDER BY cu.points DESC, cu.full_name ASC
        LIMIT 1
      )::BIGINT AS top_points_value
  `);
  
  return {
    students: stats,
    teachers: teacherStatsRows[0] || {},
    global: globalStats[0] || {},
    rewards: rewardsStats[0] || {},
    timestamp: new Date(),
  };
};


/**
 * ============================================================================
 * RESOURCES MANAGEMENT - ARCHITECTURE MULTI-ROLES
 * ============================================================================
 */


/**
 * Récupérer TOUTES les resources (tous rôles)
 */
export const getAllUserResources = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_ALL_USER_RESOURCES);
  return results;
};


/**
 * Récupérer les resources d'un créateur spécifique
 * @param {string} creatorId - UUID du créateur
 */
export const getUserResourcesByCreator = async (creatorId) => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_USER_RESOURCES_BY_CREATOR, {
    replacements: { creator_id: creatorId },
  });
  return results;
};


/**
 * Récupérer toutes les resources des students
 */
export const getAllStudentResources = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_ALL_STUDENT_RESOURCES);
  return results;
};


/**
 * Récupérer toutes les resources des teachers (pour le futur)
 */
export const getAllTeacherResources = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_ALL_TEACHER_RESOURCES);
  return results;
};


/**
 * Filtrer resources par rôle
 * @param {string} role - 'student', 'teacher', 'admin'
 */
export const filterResourcesByRole = async (role) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_RESOURCES_BY_ROLE, {
    replacements: { role },
  });
  return results;
};


/**
 * Filtrer resources par statut
 * @param {string} status - 'draft', 'published', 'archived'
 */
export const filterResourcesByStatus = async (status) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_RESOURCES_BY_STATUS, {
    replacements: { status },
  });
  return results;
};


/**
 * Filtrer resources par module
 * @param {number} moduleId - ID du module
 */
export const filterResourcesByModule = async (moduleId) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_RESOURCES_BY_MODULE, {
    replacements: { module_id: moduleId },
  });
  return results;
};


/**
 * Filtrer resources par programme
 * @param {number} programId - ID du programme
 */
export const filterResourcesByProgram = async (programId) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_RESOURCES_BY_PROGRAM, {
    replacements: { program_id: programId },
  });
  return results;
};


/**
 * Filtrer resources par domaine
 * @param {number} domainId - ID du domaine
 */
export const filterResourcesByDomain = async (domainId) => {
  const [results] = await sequelize.query(SQL.ADMIN.FILTER_RESOURCES_BY_DOMAIN, {
    replacements: { domain_id: domainId },
  });
  return results;
};


/**
 * Statistiques des resources par rôle
 */
export const getResourcesStatsByRole = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_RESOURCES_STATS_BY_ROLE);
  return results;
};


/**
 * Statistiques des resources par statut
 */
export const getResourcesStatsByStatus = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_RESOURCES_STATS_BY_STATUS);
  return results;
};


/**
 * Statistiques des resources par module
 */
export const getResourcesStatsByModule = async () => {
  const [results] = await sequelize.query(SQL.ADMIN.GET_RESOURCES_STATS_BY_MODULE);
  return results;
};


/**
 * Rechercher des resources par titre, description ou créateur
 * @param {string} searchTerm - Terme de recherche
 */
export const searchResources = async (searchTerm) => {
  const [results] = await sequelize.query(SQL.ADMIN.SEARCH_RESOURCES, {
    replacements: { search: `%${searchTerm}%` },
  });
  return results;
};


/**
 * Rechercher des resources d'un créateur spécifique
 * @param {string} searchTerm - Terme de recherche
 * @param {string} creatorId - UUID du créateur
 */
export const searchResourcesByCreator = async (searchTerm, creatorId) => {
  const [results] = await sequelize.query(SQL.ADMIN.SEARCH_RESOURCES_BY_CREATOR, {
    replacements: { 
      search: `%${searchTerm}%`,
      creator_id: creatorId 
    },
  });
  return results;
};


/**
 * ============================================================================
 * COMPATIBILITÉ - ANCIENNES FONCTIONS
 * ============================================================================
 */


/**
 * @deprecated Utiliser getUserResourcesByCreator() à la place
 * Récupérer les resources d'un student (ancienne version pour compatibilité)
 * 
 * Cette fonction est conservée pour ne pas casser le code existant.
 * Elle utilise la nouvelle fonction getUserResourcesByCreator() en interne.
 */
export const getStudentResources = async (userId) => {
  // Rediriger vers la nouvelle fonction
  return getUserResourcesByCreator(userId);
};
