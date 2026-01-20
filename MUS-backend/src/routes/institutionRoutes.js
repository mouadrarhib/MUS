import { Router } from "express";
import { body, param } from "express-validator";
import {
  addInstitution,
  listInstitutions,
  getInstitution,
  updateInstitution,
  deleteInstitution,
} from "../controllers/institutionController.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.post(
  "/",
  [
    body("name").isString().withMessage("Name is required"),
    body("institution_type_id")
      .isInt()
      .withMessage("Valid institution type ID is required"),
    body("country").optional().isString(),
    body("city").optional().isString(),
  ],
  validateRequest,
  addInstitution
);

router.get("/", listInstitutions);

router.get(
  "/:id",
  [param("id").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  getInstitution
);

router.patch(
  "/:id",
  [
    param("id").isInt().withMessage("Valid institution ID is required"),
    body("name").optional().isString(),
    body("institution_type_id")
      .optional()
      .isInt()
      .withMessage("Valid institution type ID is required"),
    body("country").optional().isString(),
    body("city").optional().isString(),
  ],
  validateRequest,
  updateInstitution
);

router.delete(
  "/:id",
  [param("id").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  deleteInstitution
);

export default router;
