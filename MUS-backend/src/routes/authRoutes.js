import { Router } from "express";
import { body } from "express-validator";
import authMiddleware from "../middleware/auth.js";
import {
  login,
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
  updateUserProfile,
  updateUser,
  checkEmail,
  forgotPassword,
} from "../controllers/authController.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("full_name").optional().isString(),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

// Public endpoints for forgot password
router.post(
  "/email/check",
  [
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validateRequest,
  checkEmail
);

router.post(
  "/password/forgot",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("new_password")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validateRequest,
  forgotPassword
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

router.patch(
  "/active",
  authMiddleware,
  [body("is_active").isBoolean().withMessage("is_active must be boolean")],
  validateRequest,
  toggleActive
);

router.delete("/me", authMiddleware, removeUser);

router.get("/user/:id", authMiddleware, getUserById);

router.patch(
  "/user/:id",
  authMiddleware,
  [
    body("email").optional().isEmail(),
    body("full_name").optional().isString(),
    body("is_active").optional().isBoolean(),
  ],
  validateRequest,
  updateUser
);

router.delete("/user/:id", authMiddleware, removeUserById);

export default router;
