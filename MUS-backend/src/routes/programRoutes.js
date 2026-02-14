import { Router } from "express";
import { body, param } from "express-validator";
import {
  addProgram,
  listPrograms,
  getProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import { listInstitutionsByProgram } from "../controllers/institutionProgramController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole } from "../middleware/authorization.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole("admin"),
  [
    body("name").isString().withMessage("Name is required"),
    body("domain_id").isInt().withMessage("Valid domain ID is required"),
  ],
  validateRequest,
  addProgram
);

router.get("/", listPrograms);

router.get(
  "/:id/institutions",
  [param("id").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  listInstitutionsByProgram
);

router.get(
  "/:id",
  [param("id").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  getProgram
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [
    param("id").isInt().withMessage("Valid program ID is required"),
    body("name").optional().isString(),
    body("domain_id")
      .optional()
      .isInt()
      .withMessage("Valid domain ID is required"),
  ],
  validateRequest,
  updateProgram
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  [param("id").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  deleteProgram
);

export default router;
