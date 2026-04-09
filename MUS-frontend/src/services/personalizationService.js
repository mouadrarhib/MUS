import { get, put } from "@/services/http";
import { invalidateTagCache, normalizeTags } from "@/services/tagService";

const PERSONALIZATION = "/personalization";

export const personalizationService = {
  getMyTagPreferences: async () => {
    const response = await get(`${PERSONALIZATION}/me/tags`);
    return normalizeTags(response?.data);
  },

  setMyTagPreferences: async (tagIds = []) => {
    const normalized = Array.from(new Set((tagIds || []).map((v) => Number(v)).filter(Number.isFinite)));
    const response = await put(`${PERSONALIZATION}/me/tags`, { tag_ids: normalized });
    invalidateTagCache();
    return normalizeTags(response?.data);
  },

  getMyRecommendations: async (limit = 24) => {
    const response = await get(`${PERSONALIZATION}/me/recommendations`, {
      params: { limit },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },
};

export default personalizationService;
