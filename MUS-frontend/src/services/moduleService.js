import { del, get, patch, post } from "@/services/http";

const MODULES = "/modules";

export const moduleService = {
  createModule: (payload) => post(MODULES, payload),
  getAllModules: () => get(MODULES),
  getModuleById: (id) => get(`${MODULES}/${id}`),
  getModuleByCodeSemester: (code, semesterId) =>
    get(`${MODULES}/code/${encodeURIComponent(code)}/semester/${semesterId}`),
  updateModule: (id, payload) => patch(`${MODULES}/${id}`, payload),
  deleteModule: (id) => del(`${MODULES}/${id}`),
  checkModuleExists: (code, semester_id) => post(`${MODULES}/check-exists`, { code, semester_id }),

  searchModules: (searchTerm) => get(`${MODULES}/search/${encodeURIComponent(searchTerm)}`),
  getDiscoverModules: () => get(`${MODULES}/discover`),
  getModulesWithResourceCount: () => get(`${MODULES}/with-resource-count`),
  getModuleResources: (id, params = {}) => get(`${MODULES}/${id}/resources`, { params }),
  countModuleResources: (id, params = {}) => get(`${MODULES}/${id}/resources/count`, { params }),
  getModuleHierarchy: (id) => get(`${MODULES}/${id}/hierarchy`),
  getModuleDetails: (id) => get(`${MODULES}/${id}/details`),
  getModulesBySemester: (semesterId) => get(`${MODULES}/semester/${semesterId}`),
  countModulesBySemester: (semesterId) => get(`${MODULES}/semester/${semesterId}/count`),
  getModulesByLevel: (levelId) => get(`${MODULES}/level/${levelId}`),
  getModulesByProgram: (programId) => get(`${MODULES}/program/${programId}`),
  getModulesByDomain: (domainId) => get(`${MODULES}/domain/${domainId}`),
  getModuleStatistics: (id) => get(`${MODULES}/${id}/statistics`),
  getModulesByResourceType: (resourceTypeId) => get(`${MODULES}/resource-type/${resourceTypeId}`),
};

export default moduleService;
