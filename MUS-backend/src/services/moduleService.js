import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

// ============================================================================
// CREATE MODULE
// ============================================================================
export const createModule = async (semesterId, code, title, description) => {
  const [results] = await sequelize.query(SQL.MODULE.CREATE, {
    replacements: {
      semester_id: semesterId,
      code,
      title,
      description: description || null,
    },
  });
  return results;
};

// ============================================================================
// GET MODULE BY ID
// ============================================================================
export const getModuleById = async (id) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_ID, {
    replacements: { id },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET MODULE BY CODE AND SEMESTER
// ============================================================================
export const getModuleByCodeSemester = async (code, semesterId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_CODE_SEMESTER, {
    replacements: { code, semester_id: semesterId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET ALL MODULES
// ============================================================================
export const getAllModules = async () => {
  const [results] = await sequelize.query(SQL.MODULE.GET_ALL);
  return results;
};

// ============================================================================
// GET MODULES BY SEMESTER
// ============================================================================
export const getModulesBySemester = async (semesterId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_SEMESTER, {
    replacements: { semester_id: semesterId },
  });
  return results;
};

// ============================================================================
// UPDATE MODULE
// ============================================================================
export const updateModule = async (id, code, title, description, semesterId) => {
  const [results] = await sequelize.query(SQL.MODULE.UPDATE, {
    replacements: {
      id,
      code,
      title,
      description: description || null,
      semester_id: semesterId,
    },
  });
  return results;
};

// ============================================================================
// DELETE MODULE
// ============================================================================
export const deleteModule = async (id) => {
  await sequelize.query(SQL.MODULE.DELETE, {
    replacements: { id },
  });
};

// ============================================================================
// CHECK IF MODULE EXISTS
// ============================================================================
export const moduleExists = async (code, semesterId) => {
  const [results] = await sequelize.query(SQL.MODULE.EXISTS, {
    replacements: { code, semester_id: semesterId },
  });
  return results.length > 0 ? results[0].sp_module_exists : false;
};

// ============================================================================
// SEARCH MODULES
// ============================================================================
export const searchModules = async (searchTerm) => {
  const [results] = await sequelize.query(SQL.MODULE.SEARCH, {
    replacements: { search_term: searchTerm },
  });
  return results;
};

// ============================================================================
// GET MODULES WITH RESOURCE COUNT
// ============================================================================
export const getModulesWithResourceCount = async () => {
  const [results] = await sequelize.query(SQL.MODULE.GET_WITH_RESOURCE_COUNT);
  return results;
};

// ============================================================================
// GET MODULE RESOURCES
// ============================================================================
export const getModuleResources = async (moduleId, actor = null, educationalType = null) => {
  const isAdmin = (actor?.roles || []).includes("admin");
  const [results] = await sequelize.query(
    `
    SELECT
      r.id AS resource_id,
      r.title AS resource_title,
      r.description AS resource_description,
      r.status::text AS resource_status,
      r.educational_type::text AS educational_type,
      r.url AS resource_url,
      r.format::text AS resource_format,
      r.resource_type_id,
      u.full_name AS creator_name,
      m.id AS module_id,
      m.code AS module_code,
      m.title AS module_title,
      rmm.chapter,
      rmm.difficulty::text AS difficulty,
      rmm.exam_related,
      rmm.created_at
    FROM public.resource_module_map rmm
    INNER JOIN public.resources r ON rmm.resource_id = r.id
    INNER JOIN public.modules m ON m.id = rmm.module_id
    LEFT JOIN public.users u ON u.id = r.created_by
    WHERE rmm.module_id = :module_id
      AND (:educational_type::text IS NULL OR r.educational_type::text = :educational_type::text)
      ${isAdmin ? "" : "AND r.status = 'published'::resource_status"}
    ORDER BY rmm.chapter, r.title
    `,
    {
      replacements: {
        module_id: moduleId,
        educational_type: educationalType,
      },
    }
  );
  return results;
};

// ============================================================================
// COUNT MODULE RESOURCES
// ============================================================================
export const countModuleResources = async (moduleId, actor = null, educationalType = null) => {
  const isAdmin = (actor?.roles || []).includes("admin");
  const [results] = await sequelize.query(
    `
    SELECT COUNT(*)::bigint AS count
    FROM public.resource_module_map rmm
    INNER JOIN public.resources r ON rmm.resource_id = r.id
    WHERE rmm.module_id = :module_id
      AND (:educational_type::text IS NULL OR r.educational_type::text = :educational_type::text)
      ${isAdmin ? "" : "AND r.status = 'published'::resource_status"}
    `,
    {
      replacements: {
        module_id: moduleId,
        educational_type: educationalType,
      },
    }
  );
  return results.length > 0 ? Number(results[0].count) : 0;
};

// ============================================================================
// GET MODULES WITH PUBLISHED RESOURCES (DISCOVER)
// ============================================================================
export const getDiscoverModules = async () => {
  const [results] = await sequelize.query(
    `
    SELECT
      m.id,
      m.code,
      m.title,
      m.description,
      m.semester_id,
      COUNT(*)::bigint AS published_resources_count
    FROM public.modules m
    INNER JOIN public.resource_module_map rmm ON rmm.module_id = m.id
    INNER JOIN public.resources r ON r.id = rmm.resource_id
    WHERE r.status = 'published'::resource_status
    GROUP BY m.id, m.code, m.title, m.description, m.semester_id
    ORDER BY m.title
    `
  );

  return results;
};

// ============================================================================
// GET MODULE FULL HIERARCHY
// ============================================================================
export const getModuleFullHierarchy = async (moduleId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_FULL_HIERARCHY, {
    replacements: { module_id: moduleId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET MODULE FULL DETAILS
// ============================================================================
export const getModuleFullDetails = async (moduleId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_FULL_DETAILS, {
    replacements: { module_id: moduleId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET MODULES BY LEVEL
// ============================================================================
export const getModulesByLevel = async (levelId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_LEVEL, {
    replacements: { level_id: levelId },
  });
  return results;
};

// ============================================================================
// GET MODULES BY PROGRAM
// ============================================================================
export const getModulesByProgram = async (programId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_PROGRAM, {
    replacements: { program_id: programId },
  });
  return results;
};

// ============================================================================
// GET MODULES BY DOMAIN
// ============================================================================
export const getModulesByDomain = async (domainId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_DOMAIN, {
    replacements: { domain_id: domainId },
  });
  return results;
};

// ============================================================================
// COUNT MODULES BY SEMESTER
// ============================================================================
export const countModulesBySemester = async (semesterId) => {
  const [results] = await sequelize.query(SQL.MODULE.COUNT_BY_SEMESTER, {
    replacements: { semester_id: semesterId },
  });
  return results.length > 0 ? results[0].sp_module_count_by_semester : 0;
};

// ============================================================================
// GET MODULE STATISTICS
// ============================================================================
export const getModuleStatistics = async (moduleId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_STATISTICS, {
    replacements: { module_id: moduleId },
  });
  return results.length > 0 ? results[0] : null;
};

// ============================================================================
// GET MODULES BY RESOURCE TYPE
// ============================================================================
export const getModulesByResourceType = async (resourceTypeId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_BY_RESOURCE_TYPE, {
    replacements: { resource_type_id: resourceTypeId },
  });
  return results;
};
