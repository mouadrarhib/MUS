import { get, patch } from "@/services/http";

const ADMIN = "/admin";

export const adminService = {
  getDashboard: () => get(`${ADMIN}/dashboard`),
  getUsersOverview: () => get(`${ADMIN}/users/overview`),

  getAllStudents: () => get(`${ADMIN}/students`),
  getStudentDetails: (userId) => get(`${ADMIN}/students/${userId}`),
  getStudentsStatistics: () => get(`${ADMIN}/students/statistics`),
  searchStudents: (q) => get(`${ADMIN}/students/search`, { params: { q } }),

  filterStudentsByStatus: (isActive) =>
    get(`${ADMIN}/students/filter/status`, { params: { is_active: Boolean(isActive) } }),

  filterStudentsByProfile: (hasProfile) =>
    get(`${ADMIN}/students/filter/profile`, { params: { has_profile: Boolean(hasProfile) } }),

  filterStudentsByInstitution: (institutionId) =>
    get(`${ADMIN}/students/filter/institution/${institutionId}`),

  filterStudentsByProgram: (programId) => get(`${ADMIN}/students/filter/program/${programId}`),

  toggleUserStatus: (userId, isActive) =>
    patch(`${ADMIN}/users/${userId}/toggle-status`, { is_active: Boolean(isActive) }),

  getAllResources: (params = {}) => get(`${ADMIN}/resources`, { params }),
  getAllStudentResources: () => get(`${ADMIN}/resources/students`),
  getAllTeacherResources: () => get(`${ADMIN}/resources/teachers`),
  getResourcesStatistics: (groupBy = "role") =>
    get(`${ADMIN}/resources/statistics`, { params: { group_by: groupBy } }),

  getStudentResourcesLegacy: (userId) => get(`${ADMIN}/students/${userId}/resources`),
};

export default adminService;
