import { get, post } from "@/services/http";

const MEMBERSHIPS = "/memberships";

export const membershipService = {
  getPlans: async () => {
    const response = await get(`${MEMBERSHIPS}/plans`);
    return Array.isArray(response?.data) ? response.data : [];
  },

  getMyMembership: async () => {
    const response = await get(`${MEMBERSHIPS}/me`);
    return response?.data || null;
  },

  assignMembership: async ({ user_id, plan_code, starts_at = null, ends_at = null, notes = null }) => {
    const response = await post(`${MEMBERSHIPS}/assign`, {
      user_id,
      plan_code,
      ...(starts_at ? { starts_at } : {}),
      ...(ends_at ? { ends_at } : {}),
      ...(notes ? { notes } : {}),
    });
    return response?.data || null;
  },

  cancelMembership: async ({ user_id, notes = null }) => {
    const response = await post(`${MEMBERSHIPS}/cancel`, {
      user_id,
      ...(notes ? { notes } : {}),
    });
    return response?.data || null;
  },
};

export default membershipService;
