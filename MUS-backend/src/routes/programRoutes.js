import { Router } from "express";
import { body, param } from "express-validator";
import {
  addProgram,
  listPrograms,
  getProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.post(
  "/",
  [
    body("name").isString().withMessage("Name is required"),
    body("domain_id").isInt().withMessage("Valid domain ID is required"),
  ],
  validateRequest,
  addProgram
);

router.get("/", listPrograms);

router.get(
  "/:id",
  [param("id").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  getProgram
);

router.patch(
  "/:id",
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
  [param("id").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  deleteProgram
);

export default router;
