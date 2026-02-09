import { del, get, patch, post } from "@/services/http";

// NOTE: backend route is mounted with typo: /ressouces-module-map
const RESOURCE_MODULE_MAP = "/ressouces-module-map";

export const resourceModuleMapService = {
  addModuleToResource: (resourceId, payload) =>
    post(`${RESOURCE_MODULE_MAP}/resources/${resourceId}/modules`, payload),

  getModulesByResource: (resourceId) =>
    get(`${RESOURCE_MODULE_MAP}/resources/${resourceId}/modules`),

  removeModuleFromResource: (resourceId, moduleId) =>
    del(`${RESOURCE_MODULE_MAP}/resources/${resourceId}/modules/${moduleId}`),

  removeAllModulesFromResource: (resourceId) =>
    del(`${RESOURCE_MODULE_MAP}/resources/${resourceId}/modules`),

  updateResourceModuleMap: (resourceId, moduleId, payload) =>
    patch(`${RESOURCE_MODULE_MAP}/resources/${resourceId}/modules/${moduleId}`, payload),

  getResourcesByModule: (moduleId) => get(`${RESOURCE_MODULE_MAP}/modules/${moduleId}/resources`),
  getAvailableModulesForStudent: () => get(`${RESOURCE_MODULE_MAP}/students/me/available-modules`),
};

export default resourceModuleMapService;
