import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  getWalletActivity,
  getWalletSummary,
  getWalletTopResources,
} from "../services/walletService.js";

export const getMyWalletSummaryHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await getWalletSummary(userId);
  return successResponse(res, "Wallet summary retrieved successfully", result);
});

export const getMyWalletTopResourcesHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Number(req.query.limit || 10);
  const result = await getWalletTopResources(userId, limit);
  return successResponse(res, "Wallet top resources retrieved successfully", result);
});

export const getMyWalletActivityHandler = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = Number(req.query.limit || 20);
  const offset = Number(req.query.offset || 0);
  const result = await getWalletActivity(userId, { limit, offset });
  return successResponse(res, "Wallet activity retrieved successfully", result);
});
