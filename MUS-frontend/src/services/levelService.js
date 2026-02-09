import { del, get, patch, post } from "@/services/http";

const LEVELS = "/levels";

export const levelService = {
  createLevel: (payload) => post(LEVELS, payload),
  getAllLevels: () => get(LEVELS),
  getLevelById: (id) => get(`${LEVELS}/${id}`),
  updateLevel: (id, payload) => patch(`${LEVELS}/${id}`, payload),
  deleteLevel: (id) => del(`${LEVELS}/${id}`),

  getLevelByNameProgram: (programId, name) =>
    get(`${LEVELS}/program/${programId}/name/${encodeURIComponent(name)}`),

  searchLevels: (searchTerm) => get(`${LEVELS}/search/${encodeURIComponent(searchTerm)}`),
  getLevelsWithSemesterCount: () => get(`${LEVELS}/with-semester-count`),
  getLevelSemesters: (id) => get(`${LEVELS}/${id}/semesters`),
  updateLevelSortOrder: (id, sort_order) => patch(`${LEVELS}/${id}/sort-order`, { sort_order }),
  reorderLevels: (level_id_1, level_id_2) => post(`${LEVELS}/reorder`, { level_id_1, level_id_2 }),
  getNextSortOrder: (programId) => get(`${LEVELS}/program/${programId}/next-sort-order`),
  countLevelSemesters: (id) => get(`${LEVELS}/${id}/semesters/count`),
  getLevelFullDetails: (id) => get(`${LEVELS}/${id}/full-details`),
  getLevelsByProgram: (programId) => get(`${LEVELS}/program/${programId}`),
};

export default levelService;
