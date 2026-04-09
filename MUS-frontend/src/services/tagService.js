import { del, get, patch, post } from "@/services/http";

const TAGS = "/tags";
const tagListInFlight = new Map();
const tagListCache = new Map();
const TAG_CACHE_TTL_MS = 30000;

export const normalizeTag = (item) => {
  if (!item) return null;

  const id = Number(item.id || item.tag_id);

  return {
    ...item,
    id: Number.isFinite(id) ? id : item.id || item.tag_id,
    tag_id: Number.isFinite(id) ? id : item.tag_id,
    name: item.name || item.tag_name || "",
    tag_name: item.tag_name || item.name || "",
    slug: item.slug || item.tag_slug || "",
    tag_slug: item.tag_slug || item.slug || "",
    category: item.category || item.tag_category || "topic",
    description: item.description || item.tag_description || "",
    is_active: typeof item.is_active === "boolean" ? item.is_active : true,
    usage_count: Number(item.usage_count || item.usageCount || 0),
  };
};

export const normalizeTags = (items) => (Array.isArray(items) ? items.map(normalizeTag).filter(Boolean) : []);

const makeCacheKey = (params = {}) => JSON.stringify(params);

const getCached = (key) => {
  const cached = tagListCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > TAG_CACHE_TTL_MS) {
    tagListCache.delete(key);
    return null;
  }
  return cached.data;
};

const setCached = (key, data) => {
  tagListCache.set(key, { ts: Date.now(), data });
};

const clearTagCaches = () => {
  tagListInFlight.clear();
  tagListCache.clear();
};

export const invalidateTagCache = () => {
  clearTagCaches();
};

export const tagService = {
  listTags: async (params = {}, options = {}) => {
    const { force = false } = options;
    const key = makeCacheKey(params);

    if (!force) {
      const cached = getCached(key);
      if (cached) return cached;
      if (tagListInFlight.has(key)) return tagListInFlight.get(key);
    }

    const request = get(TAGS, { params })
      .then((response) => {
        const data = normalizeTags(response?.data);
        setCached(key, data);
        return data;
      })
      .finally(() => {
        tagListInFlight.delete(key);
      });

    tagListInFlight.set(key, request);
    return request;
  },

  listPopularTags: async (limit = 20) => {
    const response = await get(`${TAGS}/popular`, { params: { limit } });
    return normalizeTags(response?.data);
  },

  createTag: async (payload) => {
    const response = await post(TAGS, payload);
    clearTagCaches();
    return normalizeTag(response?.data);
  },

  updateTag: async (tagId, payload) => {
    const response = await patch(`${TAGS}/${tagId}`, payload);
    clearTagCaches();
    return normalizeTag(response?.data);
  },

  deleteTag: async (tagId) => {
    const response = await del(`${TAGS}/${tagId}`);
    clearTagCaches();
    return response;
  },
};

export default tagService;
