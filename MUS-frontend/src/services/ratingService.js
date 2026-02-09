import { del, get, post } from "@/services/http";

const RATINGS = "/ratings";

export const ratingService = {
  addOrUpdateRating: (resource_id, score, comment) => post(RATINGS, { resource_id, score, comment }),

  listMyRatings: () => get(`${RATINGS}/my-ratings`),
  getMyRatingSummary: () => get(`${RATINGS}/my-summary`),
  getMyRatingForResource: (resourceId) => get(`${RATINGS}/resource/${resourceId}/my-rating`),
  deleteMyRating: (resourceId) => del(`${RATINGS}/resource/${resourceId}`),
  checkCanRate: (resourceId) => get(`${RATINGS}/can-rate/${resourceId}`),

  listRatingsByResource: (resourceId) => get(`${RATINGS}/resource/${resourceId}`),
  listRatingsWithComments: (resourceId) => get(`${RATINGS}/resource/${resourceId}/with-comments`),
  listRatingsByScore: (resourceId, score) => get(`${RATINGS}/resource/${resourceId}/score/${score}`),
  getResourceAverageRating: (resourceId) => get(`${RATINGS}/resource/${resourceId}/average`),
  getResourceRatingStatistics: (resourceId) => get(`${RATINGS}/resource/${resourceId}/statistics`),
  countResourceRatings: (resourceId) => get(`${RATINGS}/resource/${resourceId}/count`),
  listRatingsByDateRange: (resourceId, start_date, end_date) =>
    get(`${RATINGS}/resource/${resourceId}/date-range`, { params: { start_date, end_date } }),

  listTopRatedResources: (limit = 10, min_ratings = 5) =>
    get(`${RATINGS}/top-rated`, { params: { limit, min_ratings } }),

  listRecentRatings: (limit = 10) => get(`${RATINGS}/recent`, { params: { limit } }),
  listResourcesWithRatings: () => get(`${RATINGS}/resources-with-ratings`),

  listRatingsByUser: (userId) => get(`${RATINGS}/user/${userId}`),
  countUserRatings: (userId) => get(`${RATINGS}/user/${userId}/count`),
  getUserSummary: (userId) => get(`${RATINGS}/user/${userId}/summary`),
};

export default ratingService;
