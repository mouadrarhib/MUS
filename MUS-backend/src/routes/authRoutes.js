import { Router } from "express";
import { body, param } from "express-validator";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";
import { authRateLimit, forgotPasswordRateLimit, registerRateLimit } from "../middleware/rateLimit.js";
import {
  login,
  googleAuth,
  me,
  register,
  removeUserById,
  removeUser,
  logout,
  resetUserPassword,
  toggleActive,
  getUserById,
  updateEmail,
  updatePassword,
  uploadAvatar,
  uploadAvatarByUserId,
  updateUserProfile,
  updateUser,
  checkEmail,
  deleteAvatar,
  forgotPassword,
} from "../controllers/authController.js";
import validateRequest from "./validateRequest.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  "/register",
  registerRateLimit,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("full_name").optional().isString(),
    body("institution_id").optional().isInt({ min: 1 }).withMessage("Valid institution ID is required"),
    body("program_id").optional().isInt({ min: 1 }).withMessage("Valid program ID is required"),
    body("level_id").optional().isInt({ min: 1 }).withMessage("Valid level ID is required"),
    body("current_semester_id").optional().isInt({ min: 1 }).withMessage("Valid current semester ID is required"),
    body("contribution_mode")
      .optional()
      .isIn(["learner", "contributor"])
      .withMessage("contribution_mode must be learner or contributor"),
    body("preferred_tag_ids").optional().isArray().withMessage("preferred_tag_ids must be an array"),
    body("preferred_tag_ids.*").optional().isInt({ min: 1 }).withMessage("Each preferred tag id must be a positive integer"),
    body().custom((payload) => {
      const fields = [
        payload?.institution_id,
        payload?.program_id,
        payload?.level_id,
        payload?.current_semester_id,
      ];
      const provided = fields.filter((value) => value !== undefined && value !== null && String(value).trim() !== "");
      if (provided.length > 0 && provided.length < fields.length) {
        throw new Error("Institution, program, level, and current semester must all be provided together");
      }
      return true;
    }),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  authRateLimit,
  [
    body("email").isEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.post(
  "/google",
  authRateLimit,
  [body("access_token").notEmpty().withMessage("Google access token is required")],
  validateRequest,
  googleAuth
);

router.post(
  "/email/check",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  checkEmail
);

router.post(
  "/password/forgot",
  forgotPasswordRateLimit,
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  forgotPassword
);

router.post(
  "/forgot-password",
  forgotPasswordRateLimit,
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password",
  authRateLimit,
  [
    body("token").isString().notEmpty().withMessage("Reset token is required"),
    body("new_password")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validateRequest,
  resetUserPassword
);

router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout);

router.patch(
  "/email",
  authMiddleware,
  [body("new_email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  updateEmail
);

router.patch(
  "/password",
  authMiddleware,
  [
    body("old_password").notEmpty().withMessage("Old password is required"),
    body("new_password")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validateRequest,
  updatePassword
);

router.post(
  "/password/reset",
  authMiddleware,
  [
    body("new_password")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validateRequest,
  resetUserPassword
);

router.patch(
  "/profile",
  authMiddleware,
  [body("full_name").isString().withMessage("Full name is required")],
  validateRequest,
  updateUserProfile
);

router.post(
  "/avatar/upload-file",
  authMiddleware,
  upload.single("file"),
  uploadAvatar
);

router.post(
  "/user/:id/avatar/upload-file",
  authMiddleware,
  requireRole("admin"),
  [param("id").isUUID().withMessage("Valid user ID is required")],
  validateRequest,
  upload.single("file"),
  uploadAvatarByUserId
);

router.delete(
  "/avatar",
  authMiddleware,
  deleteAvatar
);

router.patch(
  "/active",
  authMiddleware,
  [body("is_active").isBoolean().withMessage("is_active must be boolean")],
  validateRequest,
  toggleActive
);

router.delete("/me", authMiddleware, removeUser);

router.get(
  "/user/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isUUID().withMessage("Valid user ID is required")],
  validateRequest,
  getUserById
);

router.patch(
  "/user/:id",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isUUID().withMessage("Valid user ID is required"),
    body("email").optional().isEmail(),
    body("full_name").optional().isString(),
    body("is_active").optional().isBoolean(),
  ],
  validateRequest,
  updateUser
);

router.delete(
  "/user/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isUUID().withMessage("Valid user ID is required")],
  validateRequest,
  removeUserById
);

export default router;
