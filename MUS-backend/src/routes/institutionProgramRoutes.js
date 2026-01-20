import { Router } from "express";
import { body, param } from "express-validator";
import {
  addAssociation,
  removeAssociation,
  listProgramsByInstitution,
  listInstitutionsByProgram,
} from "../controllers/institutionProgramController.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.post(
  "/add",
  [
    body("institution_id")
      .isInt()
      .withMessage("Valid institution ID is required"),
    body("program_id").isInt().withMessage("Valid program ID is required"),
  ],
  validateRequest,
  addAssociation
);

router.post(
  "/remove",
  [
    body("institution_id")
      .isInt()
      .withMessage("Valid institution ID is required"),
    body("program_id").isInt().withMessage("Valid program ID is required"),
  ],
  validateRequest,
  removeAssociation
);

router.get(
  "/institutions/:id/programs",
  [param("id").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  listProgramsByInstitution
);

router.get(
  "/programs/:id/institutions",
  [param("id").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  listInstitutionsByProgram
);

export default router;
