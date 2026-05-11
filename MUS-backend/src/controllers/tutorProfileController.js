import asyncHandler from "../helpers/asyncHandler.js";
import AppError from "../helpers/appError.js";
import { successResponse } from "../helpers/response.js";
import {
  getMyTutorProfile,
  getPublicTutorProfileByUserId,
  replaceMyTutorProfileEducation,
  replaceMyTutorProfileSkills,
  setMyTutorProfileVisibility,
  upsertMyTutorProfile,
} from "../services/tutorProfileService.js";

export const getPublicTutorProfileHandler = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await getPublicTutorProfileByUserId(userId);
  if (!data) {
    throw new AppError("Tutor profile not found", 404);
  }
  return successResponse(res, "Tutor public profile retrieved successfully", data);
});

export const getMyTutorProfileHandler = asyncHandler(async (req, res) => {
  const data = await getMyTutorProfile(req.user.id);
  return successResponse(res, "My tutor profile retrieved successfully", data || null);
});

export const upsertMyTutorProfileHandler = asyncHandler(async (req, res) => {
  const payload = {
    userId: req.user.id,
    headline: req.body?.headline,
    bio: req.body?.bio,
    years_experience: req.body?.years_experience,
    hourly_rate: req.body?.hourly_rate,
    currency: req.body?.currency,
    response_time_minutes: req.body?.response_time_minutes,
    visibility_status: req.body?.visibility_status,
  };

  const data = await upsertMyTutorProfile(payload);
  return successResponse(res, "Tutor profile saved successfully", data);
});

export const setMyTutorProfileVisibilityHandler = asyncHandler(async (req, res) => {
  const visibilityStatus = String(req.body?.visibility_status || "").trim().toLowerCase();
  const data = await setMyTutorProfileVisibility({
    userId: req.user.id,
    visibilityStatus,
  });
  return successResponse(res, "Tutor profile visibility updated successfully", data);
});

export const replaceMyTutorProfileSkillsHandler = asyncHandler(async (req, res) => {
  const skills = Array.isArray(req.body?.skills) ? req.body.skills : [];
  const data = await replaceMyTutorProfileSkills({
    userId: req.user.id,
    skills,
  });
  return successResponse(res, "Tutor profile skills updated successfully", data);
});

export const replaceMyTutorProfileEducationHandler = asyncHandler(async (req, res) => {
  const education = Array.isArray(req.body?.education) ? req.body.education : [];
  const data = await replaceMyTutorProfileEducation({
    userId: req.user.id,
    education,
  });
  return successResponse(res, "Tutor profile education updated successfully", data);
});
