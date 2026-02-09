import { del, get, patch, post } from "@/services/http";

const SEMESTERS = "/semesters";

export const semesterService = {
  createSemester: (payload) => post(SEMESTERS, payload),
  getAllSemesters: () => get(SEMESTERS),
  getSemesterById: (id) => get(`${SEMESTERS}/${id}`),
  updateSemester: (id, payload) => patch(`${SEMESTERS}/${id}`, payload),
  deleteSemester: (id) => del(`${SEMESTERS}/${id}`),

  getSemesterByNameLevel: (levelId, name) =>
    get(`${SEMESTERS}/level/${levelId}/name/${encodeURIComponent(name)}`),

  searchSemesters: (searchTerm) => get(`${SEMESTERS}/search/${encodeURIComponent(searchTerm)}`),
  getSemestersWithModuleCount: () => get(`${SEMESTERS}/with-module-count`),
  getSemesterModules: (id) => get(`${SEMESTERS}/${id}/modules`),
  updateSemesterSortOrder: (id, sort_order) => patch(`${SEMESTERS}/${id}/sort-order`, { sort_order }),
  reorderSemesters: (semester_id_1, semester_id_2) =>
    post(`${SEMESTERS}/reorder`, { semester_id_1, semester_id_2 }),
  getNextSortOrder: (levelId) => get(`${SEMESTERS}/level/${levelId}/next-sort-order`),
  countSemesterModules: (id) => get(`${SEMESTERS}/${id}/modules/count`),
  getSemesterFullHierarchy: (id) => get(`${SEMESTERS}/${id}/full-hierarchy`),
  getSemesterFullDetails: (id) => get(`${SEMESTERS}/${id}/full-details`),
  getSemestersByLevel: (levelId) => get(`${SEMESTERS}/level/${levelId}`),
};

export default semesterService;
