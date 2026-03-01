import asyncHandler from "../helpers/asyncHandler.js";
import { successResponse } from "../helpers/response.js";
import {
  assignMembershipToUser,
  cancelUserMembership,
  getCurrentMembershipForUser,
  listActiveMembershipPlans,
} from "../services/membershipService.js";

export const listMembershipPlansHandler = asyncHandler(async (_req, res) => {
  const result = await listActiveMembershipPlans();
  return successResponse(res, "Membership plans retrieved successfully", result);
});

export const getMyMembershipHandler = asyncHandler(async (req, res) => {
  const result = await getCurrentMembershipForUser(req.user.id);
  return successResponse(res, "Membership retrieved successfully", result);
});

export const assignMembershipHandler = asyncHandler(async (req, res) => {
  const { user_id, plan_code, starts_at, ends_at, notes } = req.body;
  const result = await assignMembershipToUser({
    userId: user_id,
    planCode: plan_code,
    startsAt: starts_at || null,
    endsAt: ends_at || null,
    source: "admin",
    notes: notes || null,
  });

  return successResponse(res, "Membership assigned successfully", result);
});

export const cancelMembershipHandler = asyncHandler(async (req, res) => {
  const { user_id, notes } = req.body;
  const result = await cancelUserMembership({
    userId: user_id,
    notes: notes || null,
  });

  return successResponse(res, "Membership cancelled successfully", result);
});
