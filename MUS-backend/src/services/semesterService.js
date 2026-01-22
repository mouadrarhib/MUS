import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const Semester = sequelize.models.Semester;

export const createSemester = async (levelId, name, sortOrder) => {
  const [results] = await sequelize.query(SQL.SEMESTER.CREATE, {
    replacements: { level_id: levelId, name, sort_order: sortOrder },
  });
  return results;
};

export const getAllSemesters = async () => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_ALL);
  return results;
};

export const getSemesterById = async (id) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_BY_ID, {
    replacements: { id },
  });
  return results.length > 0 ? results[0] : null;
};

export const updateSemester = async (id, name, levelId, sortOrder) => {
  const [results] = await sequelize.query(SQL.SEMESTER.UPDATE, {
    replacements: { id, name, level_id: levelId, sort_order: sortOrder },
  });
  return results;
};

export const deleteSemester = async (id) => {
  await sequelize.query(SQL.SEMESTER.DELETE, {
    replacements: { id },
  });
};

export const getSemesterByNameLevel = async (name, levelId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_BY_NAME_LEVEL, {
    replacements: { name, level_id: levelId },
  });
  return results.length > 0 ? results[0] : null;
};

export const searchSemesters = async (searchTerm) => {
  const [results] = await sequelize.query(SQL.SEMESTER.SEARCH, {
    replacements: { search_term: searchTerm },
  });
  return results;
};

export const getSemestersWithModuleCount = async () => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_WITH_MODULE_COUNT);
  return results;
};

export const getSemesterModules = async (semesterId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_MODULES, {
    replacements: { semester_id: semesterId },
  });
  return results;
};

export const updateSemesterSortOrder = async (id, sortOrder) => {
  const [results] = await sequelize.query(SQL.SEMESTER.UPDATE_SORT_ORDER, {
    replacements: { id, sort_order: sortOrder },
  });
  return results;
};

export const reorderSemesters = async (semesterId1, semesterId2) => {
  await sequelize.query(SQL.SEMESTER.REORDER, {
    replacements: { semester_id_1: semesterId1, semester_id_2: semesterId2 },
  });
};

export const getNextSortOrder = async (levelId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_NEXT_SORT_ORDER, {
    replacements: { level_id: levelId },
  });
  return results.length > 0 ? results[0] : null;
};

export const countSemesterModules = async (semesterId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.COUNT_MODULES, {
    replacements: { semester_id: semesterId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getSemesterFullHierarchy = async (semesterId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_FULL_HIERARCHY, {
    replacements: { semester_id: semesterId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getSemesterFullDetails = async (semesterId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_FULL_DETAILS, {
    replacements: { semester_id: semesterId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getSemestersByLevel = async (levelId) => {
  const [results] = await sequelize.query(SQL.SEMESTER.GET_BY_LEVEL, {
    replacements: { level_id: levelId },
  });
  return results;
};
