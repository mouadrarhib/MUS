import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  addSessionMessageHandler,
  cancelSessionBookingHandler,
  clearSessionInboxHandler,
  completeSessionBookingHandler,
  createSessionBookingHandler,
  createTeacherSlotHandler,
  deleteTeacherSlotHandler,
  getSessionBookingByIdHandler,
  listBookableSlotsHandler,
  listMySessionBookingsHandler,
  listSessionMessagesHandler,
  listTeacherSlotsHandler,
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

router.use(authMiddleware);

router.get(
  "/teacher/slots",
  requireRole("teacher", "admin"),
  [query("include_inactive").optional().isBoolean().withMessage("include_inactive must be boolean")],
  validateRequest,
  listTeacherSlotsHandler
);

router.post(
  "/teacher/slots",
  requireRole("teacher"),
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
  requireRole("teacher"),
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
  requireRole("teacher"),
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
  ],
  validateRequest,
  createSessionBookingHandler
);

router.get(
  "/bookings",
  requireRole("student", "teacher", "admin"),
  [
    query("status").optional().isIn(["confirmed", "cancelled", "completed", "no_show"]).withMessage("status is invalid"),
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
  requireRole("teacher", "admin"),
  [param("bookingId").isInt({ min: 1 }).withMessage("bookingId must be a positive integer")],
  validateRequest,
  completeSessionBookingHandler
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
