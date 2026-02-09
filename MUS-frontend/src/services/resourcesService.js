import { del, get, patch, post } from "@/services/http";

const RESOURCE = {
  ROOT: "/resources",
  ADMIN: "/admin/resources",
};

let myResourcesInFlight = null;
const RESOURCE_CACHE_TTL_MS = 5000;
const resourceListInFlight = new Map();
const resourceListCache = new Map();

const makeCacheKey = (prefix, payload) => `${prefix}:${JSON.stringify(payload || {})}`;

const getCached = (key) => {
  const cached = resourceListCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > RESOURCE_CACHE_TTL_MS) {
    resourceListCache.delete(key);
    return null;
  }
  return cached.data;
};

const setCached = (key, data) => {
  resourceListCache.set(key, {
    ts: Date.now(),
    data,
  });
};

const clearResourceListCaches = () => {
  resourceListInFlight.clear();
  resourceListCache.clear();
};

const normalizeResource = (item) => {
  if (!item) return item;

  const id = item.id || item.resource_id;
  const status = item.status || item.resource_status;
  const educationalType = item.educational_type || item.resource_educational_type || item.educationalType;
  const createdAt = item.created_at || item.resource_created_at || item.createdAt;

  return {
    ...item,
    id,
    status,
    educationalType,
    format: item.format || item.resource_format,
    title: item.title || item.resource_title,
    description: item.description || item.resource_description,
    createdAt,
    author: {
      id: item.created_by || item.creator_id || item.author?.id,
      name: item.creator_name || item.created_by_name || item.author?.name,
      role: item.primary_role || item.creator_primary_role || item.author?.role,
      institution: item.institution_name || item.author?.institution,
    },
    academicContext: {
      moduleCode: item.module_code,
      moduleTitle: item.module_title,
      difficulty: item.difficulty,
      chapter: item.chapter,
      examRelated: item.exam_related,
    },
  };
};

const normalizeArray = (items) => (Array.isArray(items) ? items.map(normalizeResource) : []);

const extractDataArray = (response, key) => {
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const resourcesService = {
  createResource: async (resourceData) => {
    const response = await post(RESOURCE.ROOT, resourceData);
    clearResourceListCaches();
    return normalizeResource(response?.data);
  },

  getAllResources: async (params = {}, options = {}) => {
    const { force = false } = options;
    const key = makeCacheKey("all", params);

    if (!force) {
      const cached = getCached(key);
      if (cached) return cached;
      if (resourceListInFlight.has(key)) return resourceListInFlight.get(key);
    }

    const request = get(RESOURCE.ROOT, { params })
      .then((response) => {
        const data = normalizeArray(extractDataArray(response));
        setCached(key, data);
        return data;
      })
      .finally(() => {
        resourceListInFlight.delete(key);
      });

    resourceListInFlight.set(key, request);
    return request;
  },

  getAdminResources: async (params = {}) => {
    const response = await get(RESOURCE.ADMIN, { params });
    return normalizeArray(extractDataArray(response, "resources"));
  },

  getMyResources: async () => {
    if (!myResourcesInFlight) {
      myResourcesInFlight = get(`${RESOURCE.ROOT}/my-resources`)
        .then((response) => normalizeArray(extractDataArray(response)))
        .finally(() => {
          myResourcesInFlight = null;
        });
    }

    return myResourcesInFlight;
  },

  getResourceById: async (resourceId) => {
    const response = await get(`${RESOURCE.ROOT}/${resourceId}`);
    return normalizeResource(response?.data);
  },

  updateResource: async (resourceId, updatedData) => {
    const response = await patch(`${RESOURCE.ROOT}/${resourceId}`, updatedData);
    clearResourceListCaches();
    return normalizeResource(response?.data);
  },

  deleteResource: async (resourceId) => {
    await del(`${RESOURCE.ROOT}/${resourceId}`);
    clearResourceListCaches();
    return { id: resourceId };
  },

  listPublishedResources: async () => {
    const response = await get(`${RESOURCE.ROOT}/published`);
    return normalizeArray(extractDataArray(response));
  },

  listResourcesByStatus: async (status, options = {}) => {
    const { force = false } = options;
    const key = makeCacheKey("status", { status });

    if (!force) {
      const cached = getCached(key);
      if (cached) return cached;
      if (resourceListInFlight.has(key)) return resourceListInFlight.get(key);
    }

    const request = get(`${RESOURCE.ROOT}/status/${status}`)
      .then((response) => {
        const data = normalizeArray(extractDataArray(response));
        setCached(key, data);
        return data;
      })
      .finally(() => {
        resourceListInFlight.delete(key);
      });

    resourceListInFlight.set(key, request);
    return request;
  },

  listResourcesByEducationalType: async (educationalType) => {
    const response = await get(`${RESOURCE.ROOT}/educational-type/${educationalType}`);
    return normalizeArray(extractDataArray(response));
  },

  listResourcesByFormat: async (format) => {
    const response = await get(`${RESOURCE.ROOT}/format/${format}`);
    return normalizeArray(extractDataArray(response));
  },

  listResourcesByResourceType: async (resourceTypeId) => {
    const response = await get(`${RESOURCE.ROOT}/resource-type/${resourceTypeId}`);
    return normalizeArray(extractDataArray(response));
  },

  listResourcesByCreator: async (creatorId) => {
    const response = await get(`${RESOURCE.ROOT}/creator/${creatorId}`);
    return normalizeArray(extractDataArray(response));
  },

  listResourcesByLanguage: async (language) => {
    const response = await get(`${RESOURCE.ROOT}/language/${language}`);
    return normalizeArray(extractDataArray(response));
  },

  updateResourceMetadata: async (resourceId, metadata) => {
    const response = await patch(`${RESOURCE.ROOT}/${resourceId}/metadata`, { metadata });
    clearResourceListCaches();
    return normalizeResource(response?.data);
  },

  updateResourceStatus: async (resourceId, status) => {
    const response = await patch(`${RESOURCE.ROOT}/${resourceId}/status`, { status });
    clearResourceListCaches();
    return normalizeResource(response?.data);
  },

  publishResource: async (resourceId) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/publish`);
    clearResourceListCaches();
    return normalizeResource(response?.data);
  },

  archiveResource: async (resourceId) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/archive`);
    clearResourceListCaches();
    return normalizeResource(response?.data);
  },

  searchResources: async (searchTerm) => {
    const response = await get(`${RESOURCE.ROOT}/search/${searchTerm}`);
    return normalizeArray(extractDataArray(response));
  },

  advancedSearchResources: async (filters) => {
    const response = await post(`${RESOURCE.ROOT}/advanced-search`, filters);
    return normalizeArray(extractDataArray(response));
  },

  searchResourcesByMetadata: async (metadataKey, metadataValue) => {
    const response = await post(`${RESOURCE.ROOT}/search-metadata`, {
      metadata_key: metadataKey,
      metadata_value: metadataValue,
    });
    return normalizeArray(extractDataArray(response));
  },

  countResourcesByStatus: async (status) => {
    const response = await get(`${RESOURCE.ROOT}/status/${status}/count`);
    return response?.data || { count: 0 };
  },

  countResourcesByEducationalType: async (educationalType) => {
    const response = await get(`${RESOURCE.ROOT}/educational-type/${educationalType}/count`);
    return response?.data || { count: 0 };
  },

  countResourcesByFormat: async (format) => {
    const response = await get(`${RESOURCE.ROOT}/format/${format}/count`);
    return response?.data || { count: 0 };
  },

  countResourcesByCreator: async (creatorId) => {
    const response = await get(`${RESOURCE.ROOT}/creator/${creatorId}/count`);
    return response?.data || { count: 0 };
  },

  listResourcesWithRatings: async () => {
    const response = await get(`${RESOURCE.ROOT}/with-ratings`);
    return normalizeArray(extractDataArray(response));
  },

  getResourceStatistics: async (resourceId) => {
    const response = await get(`${RESOURCE.ROOT}/${resourceId}/statistics`);
    return response?.data || {};
  },

  getResourceStatuses: async () => {
    const response = await get(`${RESOURCE.ROOT}/statuses`);
    return extractDataArray(response);
  },

  getResourceEducationalTypes: async () => {
    const response = await get(`${RESOURCE.ROOT}/educational-types`);
    return extractDataArray(response);
  },

  getResourceFormats: async () => {
    const response = await get(`${RESOURCE.ROOT}/formats`);
    return extractDataArray(response);
  },
};

export default resourcesService;
