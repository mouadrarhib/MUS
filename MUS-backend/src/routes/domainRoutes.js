import { Router } from "express";
import { body, param } from "express-validator";
import {
    addDomain,
    listDomains,
    getDomain,
    updateExistingDomain,
    deleteExistingDomain,
    getDomainByNameHandler,
    searchDomainsHandler,
    listDomainsWithProgramCount,
    getDomainWithPrograms,
    listDomainPrograms,
    countDomainProgramsHandler,
} from "../controllers/domainController.js";
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
    addDomain
);

router.get("/", listDomains);

router.get("/with-program-count", listDomainsWithProgramCount);

router.get(
    "/search/:searchTerm",
    [param("searchTerm").isString().withMessage("Search term is required")],
    validateRequest,
    searchDomainsHandler
);

router.get(
    "/name/:name",
    [param("name").isString().withMessage("Name is required")],
    validateRequest,
    getDomainByNameHandler
);

router.get(
    "/:id",
    [param("id").isInt().withMessage("Valid domain ID is required")],
    validateRequest,
    getDomain
);

router.patch(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    [
        param("id").isInt().withMessage("Valid domain ID is required"),
        body("name").optional().isString(),
    ],
    validateRequest,
    updateExistingDomain
);

router.delete(
    "/:id",
    authMiddleware,
    requireRole("admin"),
    [param("id").isInt().withMessage("Valid domain ID is required")],
    validateRequest,
    deleteExistingDomain
);

router.get(
    "/:id/with-programs",
    [param("id").isInt().withMessage("Valid domain ID is required")],
    validateRequest,
    getDomainWithPrograms
);

router.get(
    "/:id/programs",
    [param("id").isInt().withMessage("Valid domain ID is required")],
    validateRequest,
    listDomainPrograms
);

router.get(
    "/:id/programs/count",
    [param("id").isInt().withMessage("Valid domain ID is required")],
    validateRequest,
    countDomainProgramsHandler
);

export default router;
