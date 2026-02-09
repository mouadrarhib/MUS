import { del, get, post } from "@/services/http";

const FAVORITES = "/favorites";
let favoritesInFlight = null;

const toArray = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.favorites)) return response.data.favorites;
  return [];
};

export const favoritesService = {
  toggleFavorite: (resourceId) => post(`${FAVORITES}/toggle`, { resource_id: resourceId }),
  addFavorite: (resourceId) => post(FAVORITES, { resource_id: resourceId }),
  removeFavorite: async (resourceId) => {
    await del(`${FAVORITES}/${resourceId}`);
    return { resource_id: resourceId };
  },

  checkFavorite: async (resourceId) => {
    const response = await get(`${FAVORITES}/check/${resourceId}`);
    return response?.data || { is_favorited: false };
  },

  getAllFavorites: async (options = {}) => {
    const { force = false } = options;

    if (!force && favoritesInFlight) {
      return favoritesInFlight;
    }

    favoritesInFlight = get(`${FAVORITES}/my-favorites`)
      .then((response) => toArray(response))
      .finally(() => {
        favoritesInFlight = null;
      });

    return favoritesInFlight;
  },

  getFavoriteById: async (resourceId) => {
    const all = await favoritesService.getAllFavorites();
    return all.find((item) => Number(item.resource_id) === Number(resourceId)) || null;
  },

  getFavoritesByStatus: async (status) => {
    const response = await get(`${FAVORITES}/by-status/${status}`);
    return toArray(response);
  },

  getFavoritesByEducationalType: async (educationalType) => {
    const response = await get(`${FAVORITES}/by-educational-type/${educationalType}`);
    return toArray(response);
  },

  getFavoritesByFormat: async (format) => {
    const response = await get(`${FAVORITES}/by-format/${format}`);
    return toArray(response);
  },

  getFavoritesCount: async () => {
    const response = await get(`${FAVORITES}/my-favorites/count`);
    return response?.data?.count || 0;
  },

  countResourceFavorites: async (resourceId) => {
    const response = await get(`${FAVORITES}/resource/${resourceId}/count`);
    return response?.data?.count || 0;
  },

  getMostPopularFavorites: async (limit = 10) => {
    const response = await get(`${FAVORITES}/most-popular`, { params: { limit } });
    return toArray(response);
  },

  getRecentFavorites: async (limit = 10) => {
    const response = await get(`${FAVORITES}/my-favorites/recent`, { params: { limit } });
    return toArray(response);
  },

  removeAllFavorites: async () => {
    const response = await del(`${FAVORITES}/my-favorites/all`);
    return response?.data || { deleted_count: 0 };
  },

  getUserStatistics: async () => {
    const response = await get(`${FAVORITES}/my-statistics`);
    return response?.data || {};
  },

  searchFavorites: async (query) => {
    const response = await get(`${FAVORITES}/search`, { params: { q: query } });
    return toArray(response);
  },

  listUsersWhoFavorited: async (resourceId) => {
    const response = await get(`${FAVORITES}/resource/${resourceId}/users`);
    return toArray(response);
  },

  getFavoritesByType: async () => {
    const all = await favoritesService.getAllFavorites();
    return {
      exam: all.filter((item) => item.resource_educational_type === "exam").length,
      course: all.filter((item) => item.resource_educational_type === "course").length,
      notes: all.filter((item) => item.resource_educational_type === "notes").length,
    };
  },
};

export default favoritesService;
