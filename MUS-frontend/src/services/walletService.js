import { get } from "@/services/http";

const WALLET = "/wallet";

export const walletService = {
  getSummary: async () => {
    const response = await get(`${WALLET}/me/summary`);
    return response?.data || {};
  },

  getTopResources: async (limit = 10) => {
    const response = await get(`${WALLET}/me/top-resources`, {
      params: { limit },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  getActivity: async ({ limit = 20, offset = 0 } = {}) => {
    const response = await get(`${WALLET}/me/activity`, {
      params: { limit, offset },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },
};

export default walletService;
