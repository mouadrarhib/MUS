import { Router } from "express";
import { body, param } from "express-validator";
import {
  addRole,
  listRoles,
  getRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import validateRequest from "./validateRequest.js";
import { requireRole } from "../middleware/authorization.js";

const router = Router();

router.post(
  "/",
  requireRole("admin"),
  [
    body("name").isString().withMessage("Name is required"),
    body("description").optional().isString(),
  ],
  validateRequest,
  addRole
);

router.get("/", requireRole("admin"), listRoles);

router.get(
  "/:id",
  requireRole("admin"),
  [param("id").isInt().withMessage("Valid role ID is required")],
  validateRequest,
  getRole
);

router.patch(
  "/:id",
  requireRole("admin"),
  [
    param("id").isInt().withMessage("Valid role ID is required"),
    body("name").optional().isString(),
    body("description").optional().isString(),
  ],
  validateRequest,
  updateRole
);

router.delete(
  "/:id",
  requireRole("admin"),
  [param("id").isInt().withMessage("Valid role ID is required")],
  validateRequest,
  deleteRole
);

export default router;
