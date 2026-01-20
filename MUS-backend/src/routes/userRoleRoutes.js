import { Router } from "express";
import { body, param } from "express-validator";
import {
  assignUserRole,
  removeUserRole,
  listUserRoles,
  updateUserRoleController,
} from "../controllers/userRoleController.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.post(
  "/assign",
  [
    body("userId").isUUID().withMessage("Valid user ID is required"),
    body("roleId").isInt().withMessage("Valid role ID is required"),
  ],
  validateRequest,
  assignUserRole
);

router.post(
  "/remove",
  [
    body("userId").isUUID().withMessage("Valid user ID is required"),
    body("roleId").isInt().withMessage("Valid role ID is required"),
  ],
  validateRequest,
  removeUserRole
);

router.get(
  "/:userId",
  [param("userId").isUUID().withMessage("Valid user ID is required")],
  validateRequest,
  listUserRoles
);

router.patch(
  "/:userId",
  [
    param("userId").isUUID().withMessage("Valid user ID is required"),
    body("oldRoleId").isInt().withMessage("Valid old role ID is required"),
    body("newRoleId").isInt().withMessage("Valid new role ID is required"),
  ],
  validateRequest,
  updateUserRoleController
);

export default router;
