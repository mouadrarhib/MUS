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

const router = Router();

router.post(
    "/",
    [
        body("name").isString().withMessage("Name is required"),
        body("description").optional().isString(),
    ],
    validateRequest,
    addRole
);

router.get("/", listRoles);

router.get(
    "/:id",
    [param("id").isInt().withMessage("Valid role ID is required")],
    validateRequest,
    getRole
);

router.patch(
    "/:id",
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
    [param("id").isInt().withMessage("Valid role ID is required")],
    validateRequest,
    deleteRole
);

export default router;
