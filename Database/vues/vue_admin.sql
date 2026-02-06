-- =============================================================================
-- VUE 1: vw_admin_students_list
-- Liste de tous les étudiants avec leurs informations de base
-- =============================================================================

CREATE OR REPLACE VIEW vw_admin_students_list AS
SELECT 
    -- Informations utilisateur
    u.id AS user_id,
    u.full_name,
    u.email,
    u.is_active,
    u.created_at AS account_created_at,
    u.updated_at AS account_updated_at,
    
    -- Statut du profil étudiant
    CASE 
        WHEN sp.user_id IS NOT NULL THEN true 
        ELSE false 
    END AS has_profile,
    
    -- Informations institution
    sp.institution_id,
    i.name AS institution_name,
    i.country AS institution_country,
    i.city AS institution_city,
    it.name AS institution_type,
    
    -- Informations académiques
    sp.program_id,
    p.name AS program_name,
    d.id AS domain_id,
    d.name AS domain_name,
    
    -- Niveau et semestre actuels
    l.id AS current_level_id,
    l.name AS current_level_name,
    sp.current_semester_id,
    s.name AS current_semester_name,
    
    -- Statistiques resources (sous-requêtes pour performance)
    (SELECT COUNT(*) 
     FROM resources r 
     WHERE r.created_by = u.id) AS total_resources,
     
    (SELECT COUNT(*) 
     FROM resources r 
     WHERE r.created_by = u.id 
       AND r.status = 'published') AS published_resources,
       
    (SELECT COUNT(*) 
     FROM resources r 
     WHERE r.created_by = u.id 
       AND r.status = 'draft') AS draft_resources,
    
    -- Statistiques engagement
    (SELECT COUNT(*) 
     FROM favorites f 
     WHERE f.user_id = u.id) AS total_favorites,
     
    (SELECT COUNT(*) 
     FROM ratings rat 
     WHERE rat.user_id = u.id) AS total_ratings_given,
     
    -- Note moyenne reçue
    (SELECT COALESCE(AVG(rat.score), 0)::NUMERIC(3,2)
     FROM ratings rat
     INNER JOIN resources r ON rat.resource_id = r.id
     WHERE r.created_by = u.id) AS avg_rating_received,
     
    -- Dates du profil
    sp.created_at AS profile_created_at,
    sp.updated_at AS profile_updated_at

FROM users u
-- JOIN sur user_roles pour filtrer uniquement les students
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles ro ON ur.role_id = ro.id
-- LEFT JOIN car un student peut ne pas avoir complété son profil
LEFT JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN institutions i ON sp.institution_id = i.id
LEFT JOIN institution_types it ON i.institution_type_id = it.id
LEFT JOIN programs p ON sp.program_id = p.id
LEFT JOIN domains d ON p.domain_id = d.id
LEFT JOIN semesters s ON sp.current_semester_id = s.id
LEFT JOIN levels l ON s.level_id = l.id

WHERE ro.name = 'student'

ORDER BY u.created_at DESC;

-- Commentaire
COMMENT ON VIEW vw_admin_students_list IS 
'Liste tous les étudiants avec leurs informations de base et statistiques (Admin)';


-- =============================================================================
-- VUE 2: vw_admin_student_full_details
-- Détails complets d'un étudiant avec toutes ses statistiques
-- =============================================================================

CREATE OR REPLACE VIEW vw_admin_student_full_details AS
SELECT 
    -- === IDENTITÉ ===
    u.id AS user_id,
    u.full_name,
    u.email,
    u.is_active,
    u.created_at AS account_created_at,
    u.updated_at AS account_updated_at,
    
    -- === RÔLES ===
    ARRAY_AGG(DISTINCT ro.name) FILTER (WHERE ro.name IS NOT NULL) AS user_roles,
    
    -- === PROFIL STUDENT ===
    CASE WHEN sp.user_id IS NOT NULL THEN true ELSE false END AS has_profile,
    sp.created_at AS profile_created_at,
    sp.updated_at AS profile_updated_at,
    
    -- === INSTITUTION ===
    sp.institution_id,
    i.name AS institution_name,
    i.country AS institution_country,
    i.city AS institution_city,
    it.id AS institution_type_id,
    it.name AS institution_type,
    
    -- === HIÉRARCHIE ACADÉMIQUE ===
    d.id AS domain_id,
    d.name AS domain_name,
    sp.program_id,
    p.name AS program_name,
    l.id AS level_id,
    l.name AS level_name,
    l.sort_order AS level_order,
    sp.current_semester_id,
    s.name AS current_semester_name,
    s.sort_order AS semester_order,
    
    -- === STATISTIQUES RESOURCES ===
    COUNT(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) AS total_resources_created,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'published') AS published_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'draft') AS draft_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'archived') AS archived_resources,
    
    -- Resources par type éducatif
    COUNT(DISTINCT r.id) FILTER (WHERE r.educational_type = 'course') AS course_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.educational_type = 'exam') AS exam_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.educational_type = 'correction') AS correction_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.educational_type = 'notes') AS notes_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.educational_type = 'resume') AS resume_resources,
    
    -- Resources par format
    COUNT(DISTINCT r.id) FILTER (WHERE r.format = 'pdf') AS pdf_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.format = 'video') AS video_resources,
    COUNT(DISTINCT r.id) FILTER (WHERE r.format = 'powerpoint') AS powerpoint_resources,
    
    -- === ENGAGEMENT ===
    COUNT(DISTINCT f.resource_id) FILTER (WHERE f.resource_id IS NOT NULL) AS total_favorites,
    COUNT(DISTINCT rat_given.resource_id) FILTER (WHERE rat_given.resource_id IS NOT NULL) AS total_ratings_given,
    COALESCE(AVG(rat_given.score) FILTER (WHERE rat_given.score IS NOT NULL), 0)::NUMERIC(3,2) AS avg_rating_given,
    
    -- Ratings reçus sur ses resources
    COUNT(DISTINCT rat_received.user_id) FILTER (WHERE rat_received.user_id IS NOT NULL) AS total_ratings_received,
    COALESCE(AVG(rat_received.score) FILTER (WHERE rat_received.score IS NOT NULL), 0)::NUMERIC(3,2) AS avg_rating_received,
    
    -- Popularité (combien de users ont favorisé ses resources)
    COUNT(DISTINCT f_received.user_id) FILTER (WHERE f_received.user_id IS NOT NULL) AS total_favorites_received,
    
    -- === ACTIVITÉ RÉCENTE ===
    MAX(r.created_at) AS last_resource_created_at,
    MAX(f.created_at) AS last_favorite_added_at,
    MAX(rat_given.created_at) AS last_rating_given_at

FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles ro ON ur.role_id = ro.id
LEFT JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN institutions i ON sp.institution_id = i.id
LEFT JOIN institution_types it ON i.institution_type_id = it.id
LEFT JOIN programs p ON sp.program_id = p.id
LEFT JOIN domains d ON p.domain_id = d.id
LEFT JOIN semesters s ON sp.current_semester_id = s.id
LEFT JOIN levels l ON s.level_id = l.id
LEFT JOIN resources r ON u.id = r.created_by
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN ratings rat_given ON u.id = rat_given.user_id
LEFT JOIN ratings rat_received ON r.id = rat_received.resource_id
LEFT JOIN favorites f_received ON r.id = f_received.resource_id

WHERE ro.name = 'student'

GROUP BY 
    u.id, u.full_name, u.email, u.is_active, u.created_at, u.updated_at,
    sp.user_id, sp.created_at, sp.updated_at, sp.institution_id, sp.program_id, sp.current_semester_id,
    i.name, i.country, i.city, it.id, it.name,
    d.id, d.name, p.name, l.id, l.name, l.sort_order, s.name, s.sort_order;

-- Commentaire
COMMENT ON VIEW vw_admin_student_full_details IS 
'Détails complets avec toutes les statistiques d''un étudiant (Admin)';


-- =============================================================================
-- VUE 3: vw_admin_students_statistics
-- Statistiques agrégées de tous les étudiants pour le dashboard admin
-- =============================================================================

CREATE OR REPLACE VIEW vw_admin_students_statistics AS
WITH student_users AS (
    -- Liste de tous les users avec rôle 'student'
    SELECT u.id, u.is_active
    FROM users u
    INNER JOIN user_roles ur ON u.id = ur.user_id
    INNER JOIN roles ro ON ur.role_id = ro.id
    WHERE ro.name = 'student'
),
student_activity AS (
    -- Activité de chaque student
    SELECT 
        su.id AS user_id,
        COUNT(DISTINCT r.id) AS resource_count,
        COUNT(DISTINCT f.resource_id) AS favorite_count,
        COUNT(DISTINCT rat.resource_id) AS rating_count
    FROM student_users su
    LEFT JOIN resources r ON su.id = r.created_by
    LEFT JOIN favorites f ON su.id = f.user_id
    LEFT JOIN ratings rat ON su.id = rat.user_id
    GROUP BY su.id
)
SELECT 
    -- === COMPTAGES GÉNÉRAUX ===
    (SELECT COUNT(*) FROM student_users)::BIGINT AS total_students,
    (SELECT COUNT(*) FROM student_users WHERE is_active = true)::BIGINT AS active_students,
    (SELECT COUNT(*) FROM student_users WHERE is_active = false)::BIGINT AS inactive_students,
    
    -- === PROFILS ===
    (SELECT COUNT(*) FROM student_profiles)::BIGINT AS students_with_profile,
    ((SELECT COUNT(*) FROM student_users) - (SELECT COUNT(*) FROM student_profiles))::BIGINT AS students_without_profile,
    ROUND(
        (SELECT COUNT(*)::NUMERIC FROM student_profiles) / 
        NULLIF((SELECT COUNT(*) FROM student_users), 0) * 100, 
        2
    ) AS profile_completion_percentage,
    
    -- === RESOURCES ===
    (SELECT COUNT(*) FROM resources r 
     INNER JOIN student_users su ON r.created_by = su.id)::BIGINT AS total_resources_by_students,
    (SELECT COUNT(*) FROM resources r 
     INNER JOIN student_users su ON r.created_by = su.id 
     WHERE r.status = 'published')::BIGINT AS published_resources,
    (SELECT COUNT(*) FROM resources r 
     INNER JOIN student_users su ON r.created_by = su.id 
     WHERE r.status = 'draft')::BIGINT AS draft_resources,
    (SELECT COUNT(*) FROM resources r 
     INNER JOIN student_users su ON r.created_by = su.id 
     WHERE r.status = 'archived')::BIGINT AS archived_resources,
    
    -- === MOYENNES ===
    (SELECT COALESCE(AVG(resource_count), 0)::NUMERIC(10,2) FROM student_activity) AS avg_resources_per_student,
    (SELECT COALESCE(AVG(favorite_count), 0)::NUMERIC(10,2) FROM student_activity) AS avg_favorites_per_student,
    (SELECT COALESCE(AVG(rating_count), 0)::NUMERIC(10,2) FROM student_activity) AS avg_ratings_per_student,
    
    -- === STUDENT LE PLUS ACTIF ===
    (SELECT user_id FROM student_activity ORDER BY resource_count DESC LIMIT 1) AS most_active_student_id,
    (SELECT u.full_name FROM users u 
     WHERE u.id = (SELECT user_id FROM student_activity ORDER BY resource_count DESC LIMIT 1)) AS most_active_student_name,
    (SELECT MAX(resource_count) FROM student_activity)::BIGINT AS most_active_student_resources,
    
    -- === ACTIVITÉ RÉCENTE (7 derniers jours) ===
    (SELECT COUNT(*) FROM resources r 
     INNER JOIN student_users su ON r.created_by = su.id 
     WHERE r.created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT AS resources_last_7_days,
    (SELECT COUNT(*) FROM users u 
     INNER JOIN student_users su ON u.id = su.id 
     WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT AS new_students_last_7_days,
    
    -- === ACTIVITÉ RÉCENTE (30 derniers jours) ===
    (SELECT COUNT(*) FROM resources r 
     INNER JOIN student_users su ON r.created_by = su.id 
     WHERE r.created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT AS resources_last_30_days,
    (SELECT COUNT(*) FROM users u 
     INNER JOIN student_users su ON u.id = su.id 
     WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days')::BIGINT AS new_students_last_30_days,
    
    -- === ENGAGEMENT GLOBAL ===
    (SELECT COUNT(*) FROM favorites f 
     INNER JOIN student_users su ON f.user_id = su.id)::BIGINT AS total_favorites_by_students,
    (SELECT COUNT(*) FROM ratings rat 
     INNER JOIN student_users su ON rat.user_id = su.id)::BIGINT AS total_ratings_by_students,
    (SELECT COALESCE(AVG(rat.score), 0)::NUMERIC(3,2)
     FROM ratings rat
     INNER JOIN student_users su ON rat.user_id = su.id) AS avg_rating_given_by_students,
    
    -- === TIMESTAMP ===
    NOW() AS calculated_at;

-- Commentaire
COMMENT ON VIEW vw_admin_students_statistics IS 
'Statistiques globales agrégées de tous les étudiants pour le dashboard admin';


-- =============================================================================
-- VUE 4: vw_admin_student_resources
-- Liste détaillée des resources créées par chaque étudiant
-- =============================================================================

CREATE OR REPLACE VIEW vw_admin_student_resources AS
SELECT 
    -- === IDENTITÉ STUDENT ===
    u.id AS student_user_id,
    u.full_name AS student_name,
    u.email AS student_email,
    
    -- === RESOURCE INFO ===
    r.id AS resource_id,
    r.title AS resource_title,
    r.description AS resource_description,
    r.status AS resource_status,
    r.url AS resource_url,
    r.language AS resource_language,
    r.license AS resource_license,
    r.educational_type,
    r.format,
    r.resource_type_id,
    r.created_at AS resource_created_at,
    r.updated_at AS resource_updated_at,
    
    -- === STATISTIQUES RESOURCE ===
    COUNT(DISTINCT f.user_id) AS total_favorites,
    COUNT(rat.user_id) AS total_ratings,
    COALESCE(AVG(rat.score), 0)::NUMERIC(3,2) AS avg_rating,
    
    -- === MODULE ASSOCIÉ (peut être NULL) ===
    m.id AS module_id,
    m.code AS module_code,
    m.title AS module_title,
    rmm.chapter AS resource_chapter,
    rmm.difficulty AS resource_difficulty,
    rmm.exam_related AS is_exam_related,
    
    -- === HIÉRARCHIE ACADÉMIQUE ===
    s.id AS semester_id,
    s.name AS semester_name,
    l.id AS level_id,
    l.name AS level_name,
    p.id AS program_id,
    p.name AS program_name,
    d.id AS domain_id,
    d.name AS domain_name

FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles ro ON ur.role_id = ro.id
INNER JOIN resources r ON u.id = r.created_by
LEFT JOIN favorites f ON r.id = f.resource_id
LEFT JOIN ratings rat ON r.id = rat.resource_id
LEFT JOIN resource_module_map rmm ON r.id = rmm.resource_id
LEFT JOIN modules m ON rmm.module_id = m.id
LEFT JOIN semesters s ON m.semester_id = s.id
LEFT JOIN levels l ON s.level_id = l.id
LEFT JOIN programs p ON l.program_id = p.id
LEFT JOIN domains d ON p.domain_id = d.id

WHERE ro.name = 'student'

GROUP BY 
    u.id, u.full_name, u.email,
    r.id, r.title, r.description, r.status, r.url, r.language, r.license,
    r.educational_type, r.format, r.resource_type_id, r.created_at, r.updated_at,
    m.id, m.code, m.title, rmm.chapter, rmm.difficulty, rmm.exam_related,
    s.id, s.name, l.id, l.name, p.id, p.name, d.id, d.name

ORDER BY r.created_at DESC;

-- Commentaire
COMMENT ON VIEW vw_admin_student_resources IS 
'Liste détaillée de toutes les resources créées par les étudiants (Admin)';


-- =============================================================================
-- INDEX POUR AMÉLIORER LES PERFORMANCES DES VUES
-- =============================================================================

-- Index sur user_roles pour filtrage rapide par rôle
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id 
ON user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON user_roles(user_id);

-- Index sur resources pour les requêtes par créateur et statut
CREATE INDEX IF NOT EXISTS idx_resources_created_by 
ON resources(created_by);

CREATE INDEX IF NOT EXISTS idx_resources_status 
ON resources(status);

CREATE INDEX IF NOT EXISTS idx_resources_created_at 
ON resources(created_at DESC);

-- Index sur favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id 
ON favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_resource_id 
ON favorites(resource_id);

-- Index sur ratings
CREATE INDEX IF NOT EXISTS idx_ratings_user_id 
ON ratings(user_id);

CREATE INDEX IF NOT EXISTS idx_ratings_resource_id 
ON ratings(resource_id);

-- Index sur student_profiles
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution_id 
ON student_profiles(institution_id);

CREATE INDEX IF NOT EXISTS idx_student_profiles_program_id 
ON student_profiles(program_id);

CREATE INDEX IF NOT EXISTS idx_student_profiles_current_semester_id 
ON student_profiles(current_semester_id);

-- Index composé pour les requêtes de rôles
CREATE INDEX IF NOT EXISTS idx_user_roles_composite 
ON user_roles(user_id, role_id);

-- Analyser les tables pour mettre à jour les statistiques
ANALYZE users;
ANALYZE user_roles;
ANALYZE roles;
ANALYZE student_profiles;
ANALYZE resources;
ANALYZE favorites;
ANALYZE ratings;
