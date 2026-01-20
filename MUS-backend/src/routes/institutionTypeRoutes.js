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

const router = Router();

router.post(
  "/",
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
  [
    param("id").isInt().withMessage("Valid institution type ID is required"),
    body("name").optional().isString(),
  ],
  validateRequest,
  updateInstitutionType
);

router.delete(
  "/:id",
  [param("id").isInt().withMessage("Valid institution type ID is required")],
  validateRequest,
  deleteInstitutionType
);

export default router;
