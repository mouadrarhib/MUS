import { get, patch, post } from '@/services/http';

const confusionService = {
  createSignal: async (resourceId, payload = {}) => {
    const response = await post(`/resources/${resourceId}/confusion-signals`, payload);
    return response?.data || null;
  },

  listMyCases: async ({ status, page = 1, limit = 20 } = {}) => {
    const response = await get('/students/me/confusion-cases', {
      params: {
        status: status || undefined,
        page,
        limit,
      },
    });

    return Array.isArray(response?.data) ? response.data : [];
  },

  listStaffCases: async ({ status, moduleId, assignedToMe = false, page = 1, limit = 20 } = {}) => {
    const response = await get('/confusion/cases', {
      params: {
        status: status || undefined,
        module_id: moduleId || undefined,
        assigned_to_me: assignedToMe ? 'true' : undefined,
        page,
        limit,
      },
    });

    if (Array.isArray(response?.data?.rows)) return response.data.rows;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  },

  getCaseDetails: async (caseId) => {
    const response = await get(`/confusion/cases/${caseId}`);
    return response?.data || null;
  },

  listCaseEvents: async (caseId, { limit = 50 } = {}) => {
    const response = await get(`/confusion/cases/${caseId}/events`, {
      params: { limit },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  updateCaseStatus: async (caseId, payload) => {
    const response = await patch(`/confusion/cases/${caseId}/status`, payload);
    return response?.data || null;
  },

  assignCase: async (caseId, payload) => {
    const response = await patch(`/confusion/cases/${caseId}/assign`, payload);
    return response?.data || null;
  },
};

export default confusionService;
