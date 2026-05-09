import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  addSessionMessageHandler,
  cancelSessionBookingHandler,
  clearSessionInboxHandler,
  confirmSessionBookingHandler,
  completeSessionBookingHandler,
  createSessionBookingHandler,
  createTeacherSlotHandler,
  deleteTeacherSlotHandler,
  getSessionBookingByIdHandler,
  getTutorPricingProfileHandler,
  listBookableSlotsHandler,
  listMySessionBookingsHandler,
  listSessionMessagesHandler,
  listTeacherSlotsHandler,
  rejectSessionBookingHandler,
  upsertMyTutorPricingProfileHandler,
  updateTeacherSlotHandler,
} from "../controllers/sessionController.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.get(
  "/slots",
  [
    query("teacher_id").optional().isUUID().withMessage("Valid teacher UUID is required"),
    query("start_from").optional().isISO8601().withMessage("start_from must be a valid ISO date"),
    query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("limit must be between 1 and 200"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be >= 0"),
  ],
  validateRequest,
  listBookableSlotsHandler
);

router.get(
  "/tutors/:tutorId/pricing",
  [param("tutorId").isUUID().withMessage("Valid tutor UUID is required")],
  validateRequest,
  getTutorPricingProfileHandler
);

router.use(authMiddleware);

router.put(
  "/tutors/me/pricing",
  requireRole("teacher", "student", "admin"),
  [
    body("base_rate_per_hour").isFloat({ min: 0 }).withMessage("base_rate_per_hour must be >= 0"),
    body("currency").optional().isString().isLength({ min: 3, max: 8 }).withMessage("currency must be 3-8 characters"),
    body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
  ],
  validateRequest,
  upsertMyTutorPricingProfileHandler
);

router.get(
  "/teacher/slots",
  requireRole("teacher", "student", "admin"),
  [query("include_inactive").optional().isBoolean().withMessage("include_inactive must be boolean")],
  validateRequest,
  listTeacherSlotsHandler
);

router.post(
  "/teacher/slots",
  requireRole("teacher", "student", "admin"),
  [
    body("start_at").isISO8601().withMessage("start_at must be valid ISO datetime"),
    body("end_at").isISO8601().withMessage("end_at must be valid ISO datetime"),
    body("timezone").optional().isString().isLength({ min: 2, max: 64 }).withMessage("timezone must be a valid string"),
  ],
  validateRequest,
  createTeacherSlotHandler
);

router.patch(
  "/teacher/slots/:slotId",
  requireRole("teacher", "student", "admin"),
  [
    param("slotId").isInt({ min: 1 }).withMessage("slotId must be a positive integer"),
    body("start_at").optional().isISO8601().withMessage("start_at must be valid ISO datetime"),
    body("end_at").optional().isISO8601().withMessage("end_at must be valid ISO datetime"),
    body("timezone").optional().isString().isLength({ min: 2, max: 64 }).withMessage("timezone must be a valid string"),
    body("is_active").optional().isBoolean().withMessage("is_active must be boolean"),
  ],
  validateRequest,
  updateTeacherSlotHandler
);

router.delete(
  "/teacher/slots/:slotId",
  requireRole("teacher", "student", "admin"),
  [param("slotId").isInt({ min: 1 }).withMessage("slotId must be a positive integer")],
  validateRequest,
  deleteTeacherSlotHandler
);

router.post(
  "/bookings",
  requireRole("student"),
  [
    body("slot_id").isInt({ min: 1 }).withMessage("slot_id must be a positive integer"),
    body("note").optional().isString().isLength({ max: 2000 }).withMessage("note must be <= 2000 characters"),
    body("duration_minutes").optional().isIn([30, 60, 90, 120]).withMessage("duration_minutes must be one of 30,60,90,120"),
    body("session_mode").optional().isIn(["remote"]).withMessage("session_mode must be remote"),
    body("subject_module").optional().isString().isLength({ max: 200 }).withMessage("subject_module must be <= 200 characters"),
    body("pricing_snapshot").optional().isObject().withMessage("pricing_snapshot must be an object"),
    body("booking_metadata").optional().isObject().withMessage("booking_metadata must be an object"),
  ],
  validateRequest,
  createSessionBookingHandler
);

router.get(
  "/bookings",
  requireRole("student", "teacher", "admin"),
  [
    query("status").optional().isIn(["pending", "confirmed", "rejected", "cancelled", "completed", "no_show"]).withMessage("status is invalid"),
    query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("limit must be between 1 and 200"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be >= 0"),
  ],
  validateRequest,
  listMySessionBookingsHandler
);

router.patch(
  "/bookings/clear",
  requireRole("student", "teacher", "admin"),
  clearSessionInboxHandler
);

router.get(
  "/bookings/:bookingId",
  requireRole("student", "teacher", "admin"),
  [param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer")],
  validateRequest,
  getSessionBookingByIdHandler
);

router.patch(
  "/bookings/:bookingId/cancel",
  requireRole("student", "teacher", "admin"),
  [
    param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer"),
    body("reason").optional().isString().isLength({ min: 3, max: 1000 }).withMessage("reason must contain 3-1000 characters"),
  ],
  validateRequest,
  cancelSessionBookingHandler
);

router.patch(
  "/bookings/:bookingId/complete",
  requireRole("teacher", "student", "admin"),
  [param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer")],
  validateRequest,
  completeSessionBookingHandler
);

router.patch(
  "/bookings/:bookingId/confirm",
  requireRole("teacher", "student", "admin"),
  [param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer")],
  validateRequest,
  confirmSessionBookingHandler
);

router.patch(
  "/bookings/:bookingId/reject",
  requireRole("teacher", "student", "admin"),
  [
    param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer"),
    body("reason").optional().isString().isLength({ min: 3, max: 1000 }).withMessage("reason must contain 3-1000 characters"),
  ],
  validateRequest,
  rejectSessionBookingHandler
);

router.get(
  "/bookings/:bookingId/messages",
  requireRole("student", "teacher", "admin"),
  [
    param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 500 }).withMessage("limit must be between 1 and 500"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be >= 0"),
  ],
  validateRequest,
  listSessionMessagesHandler
);

router.post(
  "/bookings/:bookingId/messages",
  requireRole("student", "teacher", "admin"),
  [
    param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer"),
    body("body").isString().isLength({ min: 1, max: 5000 }).withMessage("body must contain 1-5000 characters"),
  ],
  validateRequest,
  addSessionMessageHandler
);

export default router;
