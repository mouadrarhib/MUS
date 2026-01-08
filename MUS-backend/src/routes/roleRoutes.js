import { Router } from "express";
import { body, param } from "express-validator";
import authMiddleware from "../middleware/auth.js";
import {
    addRole,
    listRoles,
    getRole,
    updateRole,
    deleteRole,
    assignRole,
    removeRole,
    listUserRoles,
} from "../controllers/roleController.js";
import validateRequest from "./validateRequest.js";

const router = Router();

router.use(authMiddleware);

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

router.post(
    "/assign",
    [
        body("userId").isUUID().withMessage("Valid user ID is required"),
        body("roleId").isInt().withMessage("Valid role ID is required"),
    ],
    validateRequest,
    assignRole
);

router.post(
    "/remove",
    [
        body("userId").isUUID().withMessage("Valid user ID is required"),
        body("roleId").isInt().withMessage("Valid role ID is required"),
    ],
    validateRequest,
    removeRole
);

router.get(
    "/user/:id",
    [param("id").isUUID().withMessage("Valid user ID is required")],
    validateRequest,
    listUserRoles
);


export default router;
