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
export const getModuleResources = async (moduleId) => {
  const [results] = await sequelize.query(SQL.MODULE.GET_RESOURCES, {
    replacements: { module_id: moduleId },
  });
  return results;
};

// ============================================================================
// COUNT MODULE RESOURCES
// ============================================================================
export const countModuleResources = async (moduleId) => {
  const [results] = await sequelize.query(SQL.MODULE.COUNT_RESOURCES, {
    replacements: { module_id: moduleId },
  });
  return results.length > 0 ? results[0].sp_module_count_resources : 0;
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
