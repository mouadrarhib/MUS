import favoritesData from '@/data/myFavorites.json';

// Store favorites in memory for modifications
let favorites = [...favoritesData.data];

export const favoritesService = {
  /**
   * Get all favorites
   */
  getAllFavorites: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(favorites);
      }, 500);
    });
  },

  /**
   * Get favorite by resource ID
   */
  getFavoriteById: async (resourceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const favorite = favorites.find(f => f.resource_id === resourceId);
        resolve(favorite || null);
      }, 300);
    });
  },

  /**
   * Remove from favorites
   */
  removeFavorite: async (resourceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = favorites.findIndex(f => f.resource_id === resourceId);
        if (index !== -1) {
          const removed = favorites.splice(index, 1);
          resolve(removed[0]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  /**
   * Get favorites count
   */
  getFavoritesCount: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(favorites.length);
      }, 200);
    });
  },

  /**
   * Get favorites by type
   */
  getFavoritesByType: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const counts = {
          exam: favorites.filter(f => f.resource_educational_type === 'exam').length,
          course: favorites.filter(f => f.resource_educational_type === 'course').length,
          notes: favorites.filter(f => f.resource_educational_type === 'notes').length,
        };
        resolve(counts);
      }, 300);
    });
  },

  /**
   * Search favorites
   */
  searchFavorites: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = favorites.filter(favorite =>
          favorite.resource_title?.toLowerCase().includes(query.toLowerCase()) ||
          favorite.resource_description?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }
};

export default favoritesService;
