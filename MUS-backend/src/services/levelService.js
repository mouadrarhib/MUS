import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const Level = sequelize.models.Level;

export const createLevel = async (programId, name, sortOrder) => {
  const [results] = await sequelize.query(SQL.LEVEL.CREATE, {
    replacements: { program_id: programId, name, sort_order: sortOrder },
  });
  return results;
};

export const getAllLevels = async () => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_ALL);
  return results;
};

export const getLevelById = async (id) => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_BY_ID, {
    replacements: { id },
  });
  return results.length > 0 ? results[0] : null;
};

export const updateLevel = async (id, name, programId, sortOrder) => {
  const [results] = await sequelize.query(SQL.LEVEL.UPDATE, {
    replacements: { id, name, program_id: programId, sort_order: sortOrder },
  });
  return results;
};

export const deleteLevel = async (id) => {
  await sequelize.query(SQL.LEVEL.DELETE, {
    replacements: { id },
  });
};

export const getLevelByNameProgram = async (name, programId) => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_BY_NAME_PROGRAM, {
    replacements: { name, program_id: programId },
  });
  return results.length > 0 ? results[0] : null;
};

export const searchLevels = async (searchTerm) => {
  const [results] = await sequelize.query(SQL.LEVEL.SEARCH, {
    replacements: { search_term: searchTerm },
  });
  return results;
};

export const getLevelsWithSemesterCount = async () => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_WITH_SEMESTER_COUNT);
  return results;
};

export const getLevelSemesters = async (levelId) => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_SEMESTERS, {
    replacements: { level_id: levelId },
  });
  return results;
};

export const updateLevelSortOrder = async (id, sortOrder) => {
  const [results] = await sequelize.query(SQL.LEVEL.UPDATE_SORT_ORDER, {
    replacements: { id, sort_order: sortOrder },
  });
  return results;
};

export const reorderLevels = async (levelId1, levelId2) => {
  await sequelize.query(SQL.LEVEL.REORDER, {
    replacements: { level_id_1: levelId1, level_id_2: levelId2 },
  });
};

export const getNextSortOrder = async (programId) => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_NEXT_SORT_ORDER, {
    replacements: { program_id: programId },
  });
  return results.length > 0 ? results[0] : null;
};

export const countLevelSemesters = async (levelId) => {
  const [results] = await sequelize.query(SQL.LEVEL.COUNT_SEMESTERS, {
    replacements: { level_id: levelId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getLevelFullDetails = async (levelId) => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_FULL_DETAILS, {
    replacements: { level_id: levelId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getLevelsByProgram = async (programId) => {
  const [results] = await sequelize.query(SQL.LEVEL.GET_BY_PROGRAM, {
    replacements: { program_id: programId },
  });
  return results;
};
