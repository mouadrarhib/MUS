import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const StudentProfile = sequelize.models.StudentProfile;

export const createStudentProfile = async (
  userId,
  institutionId,
  programId,
  currentSemesterId
) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.CREATE, {
    replacements: {
      user_id: userId,
      institution_id: institutionId,
      program_id: programId,
      current_semester_id: currentSemesterId,
    },
  });
  return results;
};

export const getAllStudentProfiles = async () => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.GET_ALL);
  return results;
};

export const getStudentProfileByUserId = async (userId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.GET_BY_USER_ID, {
    replacements: { user_id: userId },
  });
  return results.length > 0 ? results[0] : null;
};

export const updateStudentProfile = async (
  userId,
  institutionId,
  programId,
  currentSemesterId
) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.UPDATE, {
    replacements: {
      user_id: userId,
      institution_id: institutionId,
      program_id: programId,
      current_semester_id: currentSemesterId,
    },
  });
  return results;
};

export const updateStudentInstitution = async (userId, institutionId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.UPDATE_INSTITUTION, {
    replacements: { user_id: userId, institution_id: institutionId },
  });
  return results;
};

export const updateStudentProgram = async (userId, programId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.UPDATE_PROGRAM, {
    replacements: { user_id: userId, program_id: programId },
  });
  return results;
};

export const updateStudentSemester = async (userId, currentSemesterId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.UPDATE_SEMESTER, {
    replacements: { user_id: userId, current_semester_id: currentSemesterId },
  });
  return results;
};

export const deleteStudentProfile = async (userId) => {
  await sequelize.query(SQL.STUDENT_PROFILE.DELETE, {
    replacements: { user_id: userId },
  });
};

export const studentProfileExists = async (userId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.EXISTS, {
    replacements: { user_id: userId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getStudentProfilesByInstitution = async (institutionId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.GET_BY_INSTITUTION, {
    replacements: { institution_id: institutionId },
  });
  return results;
};

export const getStudentProfilesByProgram = async (programId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.GET_BY_PROGRAM, {
    replacements: { program_id: programId },
  });
  return results;
};

export const getStudentProfilesBySemester = async (semesterId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.GET_BY_SEMESTER, {
    replacements: { semester_id: semesterId },
  });
  return results;
};

export const countStudentProfilesByInstitution = async (institutionId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.COUNT_BY_INSTITUTION, {
    replacements: { institution_id: institutionId },
  });
  return results.length > 0 ? results[0] : null;
};

export const countStudentProfilesByProgram = async (programId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.COUNT_BY_PROGRAM, {
    replacements: { program_id: programId },
  });
  return results.length > 0 ? results[0] : null;
};

export const countStudentProfilesBySemester = async (semesterId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.COUNT_BY_SEMESTER, {
    replacements: { semester_id: semesterId },
  });
  return results.length > 0 ? results[0] : null;
};

export const getStudentProfileFullDetails = async (userId) => {
  const [results] = await sequelize.query(SQL.STUDENT_PROFILE.GET_FULL_DETAILS, {
    replacements: { user_id: userId },
  });
  return results.length > 0 ? results[0] : null;
};
