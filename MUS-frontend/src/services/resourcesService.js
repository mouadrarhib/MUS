import { del, get, patch, post, put } from "@/services/http";

const RESOURCE = {
  ROOT: "/resources",
  ADMIN: "/admin/resources",
};

let myResourcesInFlight = null;
let myResourcesCache = null;
let myResourcesCacheTs = 0;
const RESOURCE_CACHE_TTL_MS = 5000;
const resourceListInFlight = new Map();
const resourceListCache = new Map();
const tagListInFlight = new Map();
const myRejectionsInFlight = new Map();
const myRejectionsCache = new Map();
const resourceTagsMapInFlight = new Map();

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
  resourceTagsMapInFlight.clear();
  myResourcesInFlight = null;
  myResourcesCache = null;
  myResourcesCacheTs = 0;
  myRejectionsInFlight.clear();
  myRejectionsCache.clear();
};

const normalizeResource = (item) => {
  if (!item) return item;

  const id = item.id || item.resource_id;
  const status = item.status || item.resource_status;
  const educationalType = item.educational_type || item.resource_educational_type || item.educationalType;
  const createdAt = item.created_at || item.resource_created_at || item.createdAt;
  const accessTier = String(item.access_tier || item.accessTier || "free").toLowerCase() === "premium" ? "premium" : "free";

  return {
    ...item,
    id,
    status,
    educationalType,
    access_tier: accessTier,
    accessTier,
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

const extractOne = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
};

export const resourcesService = {
  listTags: async (params = {}) => {
    const key = makeCacheKey("tags", params);
    const cached = getCached(key);
    if (cached) return cached;
    if (tagListInFlight.has(key)) return tagListInFlight.get(key);

    const request = get(`/tags`, { params })
      .then((response) => {
        const data = Array.isArray(response?.data) ? response.data : [];
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
    const response = await get(`/tags/popular`, { params: { limit } });
    return Array.isArray(response?.data) ? response.data : [];
  },

  getResourceTags: async (resourceId) => {
    const response = await get(`/resources/${resourceId}/tags`);
    return Array.isArray(response?.data) ? response.data : [];
  },

  getResourcesTagsMap: async (resourceIds = []) => {
    const normalized = Array.from(new Set((resourceIds || []).map((v) => Number(v)).filter(Number.isFinite)));
    if (!normalized.length) return {};

    const sortedIds = [...normalized].sort((a, b) => a - b);
    const key = makeCacheKey("resources-tags-map", { ids: sortedIds });

    const cached = getCached(key);
    if (cached) return cached;
    if (resourceTagsMapInFlight.has(key)) return resourceTagsMapInFlight.get(key);

    const request = get(`/tags/resources-map`, {
      params: {
        resource_ids: sortedIds.join(","),
      },
    })
      .then((response) => {
        const data = response?.data && typeof response.data === "object" ? response.data : {};
        setCached(key, data);
        return data;
      })
      .finally(() => {
        resourceTagsMapInFlight.delete(key);
      });

    resourceTagsMapInFlight.set(key, request);
    return request;
  },

  replaceResourceTags: async (resourceId, tagIds = []) => {
    const normalized = Array.from(new Set((tagIds || []).map((v) => Number(v)).filter(Number.isFinite)));
    const response = await put(`/resources/${resourceId}/tags`, { tag_ids: normalized });
    return Array.isArray(response?.data) ? response.data : [];
  },

  createResource: async (resourceData) => {
    const response = await post(RESOURCE.ROOT, resourceData);
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  requestUploadUrl: async ({ filename, mime_type, size_bytes }) => {
    const response = await post(`${RESOURCE.ROOT}/upload-url`, { filename, mime_type, size_bytes });
    return response?.data || {};
  },

  requestUploadUrlByResourceId: async (resourceId, { filename, mime_type, size_bytes }) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/upload-url`, {
      filename,
      mime_type,
      size_bytes,
    });
    return response?.data || {};
  },

  uploadFileToSignedUrl: async ({ uploadUrl, file, contentType }) => {
    const result = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType || file?.type || "application/octet-stream",
      },
      body: file,
    });

    if (!result.ok) {
      throw new Error(`Upload failed with status ${result.status}`);
    }

    return true;
  },

  uploadFileToResource: async (resourceId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await post(`${RESOURCE.ROOT}/${resourceId}/upload-file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  confirmUpload: async (payload) => {
    const response = await post(`${RESOURCE.ROOT}/confirm-upload`, payload);
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  attachFileToResource: async (resourceId, object_key) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/attach-file`, { object_key });
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  attachUrlToResource: async (resourceId, url) => {
    const response = await patch(`${RESOURCE.ROOT}/${resourceId}/attach-url`, { url });
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  getResourceFileUrl: async (resourceId, { download = false } = {}) => {
    const response = await get(`${RESOURCE.ROOT}/${resourceId}/file-url`, {
      params: download ? { download: true } : undefined,
    });
    return response?.data || {};
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

  getMyResources: async (options = {}) => {
    const { force = false } = options;

    if (!force && myResourcesCache && Date.now() - myResourcesCacheTs <= RESOURCE_CACHE_TTL_MS) {
      return myResourcesCache;
    }

    if (!force && myResourcesInFlight) {
      return myResourcesInFlight;
    }

    if (!myResourcesInFlight || force) {
      myResourcesInFlight = get(`${RESOURCE.ROOT}/my-resources`)
        .then((response) => {
          const data = normalizeArray(extractDataArray(response));
          myResourcesCache = data;
          myResourcesCacheTs = Date.now();
          return data;
        })
        .finally(() => {
          myResourcesInFlight = null;
        });
    }

    return myResourcesInFlight;
  },

  getMyResourceAnalytics: async () => {
    const response = await get(`${RESOURCE.ROOT}/my-analytics`);
    return response?.data || {};
  },

  getMyRejections: async (limit = 100, options = {}) => {
    const { force = false } = options;
    const key = makeCacheKey("my-rejections", { limit });

    if (!force) {
      const cached = getCached(key);
      if (cached) return cached;
      if (myRejectionsInFlight.has(key)) return myRejectionsInFlight.get(key);
    }

    const request = get(`${RESOURCE.ROOT}/my-rejections`, {
      params: { limit },
    })
      .then((response) => {
        const data = Array.isArray(response?.data) ? response.data : [];
        setCached(key, data);
        myRejectionsCache.set(key, data);
        return data;
      })
      .finally(() => {
        myRejectionsInFlight.delete(key);
      });

    myRejectionsInFlight.set(key, request);
    return request;
  },

  getAllRejections: async ({ search = null, limit = 200 } = {}) => {
    const response = await get(`${RESOURCE.ROOT}/rejections`, {
      params: {
        ...(search ? { search } : {}),
        limit,
      },
    });
    return Array.isArray(response?.data) ? response.data : [];
  },

  getResourceById: async (resourceId) => {
    const response = await get(`${RESOURCE.ROOT}/${resourceId}`);
    return normalizeResource(response?.data);
  },

  recordDownload: async (resourceId) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/download`);
    return response?.data || response || {};
  },

  updateResource: async (resourceId, updatedData) => {
    const response = await patch(`${RESOURCE.ROOT}/${resourceId}`, updatedData);
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
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
    return normalizeResource(extractOne(response));
  },

  updateResourceStatus: async (resourceId, status) => {
    const response = await patch(`${RESOURCE.ROOT}/${resourceId}/status`, { status });
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  publishResource: async (resourceId) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/publish`);
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  archiveResource: async (resourceId) => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/archive`);
    clearResourceListCaches();
    return normalizeResource(extractOne(response));
  },

  rejectResource: async (resourceId, reason = "") => {
    const response = await post(`${RESOURCE.ROOT}/${resourceId}/reject`, {
      ...(reason ? { reason } : {}),
    });
    clearResourceListCaches();
    return response?.data || {};
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
