import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  getRecommendationsForUser,
  getUserTagPreferences,
  setUserTagPreferences,
} from "../services/personalizationService.js";

export const getMyTagPreferencesHandler = asyncHandler(async (req, res) => {
  const result = await getUserTagPreferences(req.user.id);
  return successResponse(res, "Tag preferences retrieved successfully", result);
});

export const setMyTagPreferencesHandler = asyncHandler(async (req, res) => {
  const { tag_ids } = req.body;
  const result = await setUserTagPreferences(req.user.id, tag_ids || []);
  return successResponse(res, "Tag preferences updated successfully", result);
});

export const getMyRecommendationsHandler = asyncHandler(async (req, res) => {
  const limit = Number(req.query?.limit || 24);
  const result = await getRecommendationsForUser(req.user.id, limit);
  return successResponse(res, "Recommendations retrieved successfully", result);
});
