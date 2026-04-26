import { del, get, patch, post, put } from "@/services/http";
import { invalidateTagCache } from "@/services/tagService";

const RESOURCE = {
  ROOT: "/resources",
  ADMIN: "/admin/resources",
};

let myResourcesInFlight = null;
let myResourcesCache = null;
let myResourcesCacheTs = 0;
const RESOURCE_CACHE_TTL_MS = 5000;
const PUBLISHED_CACHE_TTL_MS = 30_000; // published list is large & rarely mutates during a session
const DISCOVER_BOOTSTRAP_CACHE_TTL_MS = 20_000;
let publishedResourcesInFlight = null;
let publishedResourcesCache = null;
let publishedResourcesCacheTs = 0;
const discoverBootstrapInFlight = new Map();
const discoverBootstrapCache = new Map();
const resourceListInFlight = new Map();
const resourceListCache = new Map();
const tagListInFlight = new Map();
const myRejectionsInFlight = new Map();
const myRejectionsCache = new Map();
const resourceTagsMapInFlight = new Map();

const makeCacheKey = (prefix, payload) => `${prefix}:${JSON.stringify(payload || {})}`;

const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

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
  publishedResourcesInFlight = null;
  publishedResourcesCache = null;
  publishedResourcesCacheTs = 0;
  discoverBootstrapInFlight.clear();
  discoverBootstrapCache.clear();
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
  const metadata = parseMetadata(item.metadata);
  const metadataAcademicContext = metadata?.academicContext && typeof metadata.academicContext === 'object'
    ? metadata.academicContext
    : {};

  return {
    ...item,
    id,
    status,
    educationalType,
    metadata,
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
      institutionId: String(metadataAcademicContext.institutionId || ''),
      programId: String(metadataAcademicContext.programId || ''),
      levelId: String(metadataAcademicContext.levelId || ''),
      semesterId: String(metadataAcademicContext.semesterId || ''),
      moduleId: String(metadataAcademicContext.moduleId || item.module_id || ''),
      moduleCode: metadataAcademicContext.moduleCode || item.module_code || '',
      moduleTitle: metadataAcademicContext.moduleTitle || item.module_title || '',
      difficulty: metadataAcademicContext.difficulty || item.difficulty || 'medium',
      chapter: metadataAcademicContext.chapter || item.chapter || '',
      examRelated: Boolean(metadataAcademicContext.isExamRelated ?? metadataAcademicContext.examRelated ?? item.exam_related),
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

const getDiscoverBootstrapCacheKey = (params = {}) => {
  const normalized = {
    recommendation_limit: Number(params.recommendationLimit || 12),
    resources_limit: Number(params.resourcesLimit || 80),
    module_id: params.moduleId ? String(params.moduleId) : "all",
    educational_type: params.educationalType ? String(params.educationalType) : "all",
    format: params.format ? String(params.format) : "all",
    language: params.language ? String(params.language) : "all",
    access_tier: params.accessTier ? String(params.accessTier) : "all",
    min_rating: Number(params.minRating || 0),
    favorites_only: Boolean(params.favoritesOnly),
    sort_by: params.sortBy ? String(params.sortBy) : "recommended",
    search: typeof params.search === "string" ? params.search.trim().toLowerCase() : "",
  };

  return JSON.stringify(normalized);
};

const getDiscoverBootstrapCachedValue = (key) => {
  const cached = discoverBootstrapCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > DISCOVER_BOOTSTRAP_CACHE_TTL_MS) {
    discoverBootstrapCache.delete(key);
    return null;
  }
  return cached.data;
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
    clearResourceListCaches();
    invalidateTagCache();
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

  getResourceDetailsBundle: async (resourceId) => {
    const response = await get(`${RESOURCE.ROOT}/${resourceId}/details`);
    return response?.data || null;
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

  listPublishedResources: async (options = {}) => {
    const { force = false } = options;

    // Return from cache if still fresh
    if (!force && publishedResourcesCache && Date.now() - publishedResourcesCacheTs <= PUBLISHED_CACHE_TTL_MS) {
      return publishedResourcesCache;
    }

    // Deduplicate concurrent in-flight requests (e.g. StrictMode double-invoke)
    if (!force && publishedResourcesInFlight) {
      return publishedResourcesInFlight;
    }

    publishedResourcesInFlight = get(`${RESOURCE.ROOT}/published`)
      .then((response) => {
        const data = normalizeArray(extractDataArray(response));
        publishedResourcesCache = data;
        publishedResourcesCacheTs = Date.now();
        return data;
      })
      .finally(() => {
        publishedResourcesInFlight = null;
      });

    return publishedResourcesInFlight;
  },

  getDiscoverBootstrap: async (params = {}, options = {}) => {
    const {
      recommendationLimit = 12,
      resourcesLimit = 80,
      moduleId = "all",
      educationalType = "all",
      format = "all",
      language = "all",
      accessTier = "all",
      minRating = 0,
      favoritesOnly = false,
      sortBy = "recommended",
      search = "",
    } = params;
    const { force = false } = options;
    const cacheKey = getDiscoverBootstrapCacheKey({
      recommendationLimit,
      resourcesLimit,
      moduleId,
      educationalType,
      format,
      language,
      accessTier,
      minRating,
      favoritesOnly,
      sortBy,
      search,
    });

    if (!force) {
      const cached = getDiscoverBootstrapCachedValue(cacheKey);
      if (cached) return cached;
    }

    if (!force && discoverBootstrapInFlight.has(cacheKey)) {
      return discoverBootstrapInFlight.get(cacheKey);
    }

    const request = get(`${RESOURCE.ROOT}/discover/bootstrap`, {
      params: {
        recommendation_limit: recommendationLimit,
        resources_limit: resourcesLimit,
        ...(moduleId && moduleId !== "all" ? { module_id: moduleId } : {}),
        ...(educationalType && educationalType !== "all" ? { educational_type: educationalType } : {}),
        ...(format && format !== "all" ? { format } : {}),
        ...(language && language !== "all" ? { language } : {}),
        ...(accessTier && accessTier !== "all" ? { access_tier: accessTier } : {}),
        ...(Number(minRating) > 0 ? { min_rating: minRating } : {}),
        ...(favoritesOnly ? { favorites_only: true } : {}),
        ...(sortBy ? { sort_by: sortBy } : {}),
        ...(typeof search === "string" && search.trim() ? { search: search.trim() } : {}),
      },
    })
      .then((response) => {
        const payload = response?.data || {};
        const normalized = {
          generated_at: payload?.generated_at || null,
          published_resources: normalizeArray(payload?.published_resources),
          discover_modules: Array.isArray(payload?.discover_modules) ? payload.discover_modules : [],
          recommendations: Array.isArray(payload?.recommendations) ? payload.recommendations : [],
          favorites: Array.isArray(payload?.favorites) ? payload.favorites : [],
          meta: payload?.meta && typeof payload.meta === "object" ? payload.meta : {},
        };

        discoverBootstrapCache.set(cacheKey, {
          ts: Date.now(),
          data: normalized,
        });
        return normalized;
      })
      .finally(() => {
        discoverBootstrapInFlight.delete(cacheKey);
      });

    discoverBootstrapInFlight.set(cacheKey, request);
    return request;
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
