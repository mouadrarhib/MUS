import { del, get, patch, post } from "@/services/http";

const STUDENT_PROFILES = "/student-profiles";

export const studentProfileService = {
  createStudentProfile: (payload) => post(STUDENT_PROFILES, payload),
  getAllStudentProfiles: () => get(STUDENT_PROFILES),
  getStudentProfileByUserId: (userId) => get(`${STUDENT_PROFILES}/${userId}`),
  updateStudentProfile: (userId, payload) => patch(`${STUDENT_PROFILES}/${userId}`, payload),
  deleteStudentProfile: (userId) => del(`${STUDENT_PROFILES}/${userId}`),

  updateStudentInstitution: (userId, institution_id) =>
    patch(`${STUDENT_PROFILES}/${userId}/institution`, { institution_id }),

  updateStudentProgram: (userId, program_id) =>
    patch(`${STUDENT_PROFILES}/${userId}/program`, { program_id }),

  updateStudentSemester: (userId, current_semester_id) =>
    patch(`${STUDENT_PROFILES}/${userId}/semester`, { current_semester_id }),

  studentProfileExists: (userId) => get(`${STUDENT_PROFILES}/${userId}/exists`),
  getStudentProfilesByInstitution: (institutionId) => get(`${STUDENT_PROFILES}/institution/${institutionId}`),
  getStudentProfilesByProgram: (programId) => get(`${STUDENT_PROFILES}/program/${programId}`),
  getStudentProfilesBySemester: (semesterId) => get(`${STUDENT_PROFILES}/semester/${semesterId}`),
  countStudentProfilesByInstitution: (institutionId) => get(`${STUDENT_PROFILES}/institution/${institutionId}/count`),
  countStudentProfilesByProgram: (programId) => get(`${STUDENT_PROFILES}/program/${programId}/count`),
  countStudentProfilesBySemester: (semesterId) => get(`${STUDENT_PROFILES}/semester/${semesterId}/count`),
  getStudentProfileFullDetails: (userId) => get(`${STUDENT_PROFILES}/${userId}/full-details`),
};

export default studentProfileService;
