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
    WITH student_users AS (
      SELECT u.id, u.full_name, COALESCE(u.points, 0) AS points
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles ro ON ur.role_id = ro.id
      WHERE ro.name = 'student'
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
      (SELECT COALESCE(SUM(su.points), 0) FROM student_users su)::BIGINT AS total_points_awarded,
      (
        SELECT su.id
        FROM student_users su
        ORDER BY su.points DESC, su.full_name ASC
        LIMIT 1
      ) AS top_points_student_id,
      (
        SELECT su.full_name
        FROM student_users su
        ORDER BY su.points DESC, su.full_name ASC
        LIMIT 1
      ) AS top_points_student_name,
      (
        SELECT su.points
        FROM student_users su
        ORDER BY su.points DESC, su.full_name ASC
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
