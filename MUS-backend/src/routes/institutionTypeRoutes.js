import { Router } from "express";
import { body, param } from "express-validator";
import {
  addInstitutionType,
  listInstitutionTypes,
  getInstitutionType,
  updateInstitutionType,
  deleteInstitutionType,
} from "../controllers/institutionTypeController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  [body("name").isString().withMessage("Name is required")],
  validateRequest,
  addInstitutionType
);

router.get("/", listInstitutionTypes);

router.get(
  "/:id",
  [param("id").isInt().withMessage("Valid institution type ID is required")],
  validateRequest,
  getInstitutionType
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt().withMessage("Valid institution type ID is required"),
    body("name").optional().isString(),
  ],
  validateRequest,
  updateInstitutionType
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt().withMessage("Valid institution type ID is required")],
  validateRequest,
  deleteInstitutionType
);

export default router;
