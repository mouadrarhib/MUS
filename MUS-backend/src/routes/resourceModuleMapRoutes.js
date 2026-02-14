import { Router } from "express";
import { param, body } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware, { optionalAuthMiddleware } from "../middleware/auth.js";
import { requireOwnerOrAdmin, requirePublishedOrOwnerOrAdmin } from "../middleware/authorization.js";
import { getResourceById } from "../services/resourceService.js";
import {
  addModuleToResourceHandler,
  removeModuleFromResourceHandler,
  getModulesByResourceHandler,
  getResourcesByModuleHandler,
  updateResourceModuleMapHandler,
  getAvailableModulesHandler,
  removeAllModulesHandler,
} from "../controllers/resourceModuleMapController.js";

const router = Router();

const getResourceOwnerId = async (req) => {
  const resourceId = Number.parseInt(req.params.resourceId, 10);
  if (!Number.isInteger(resourceId) || resourceId < 1) {
    return null;
  }

  const resource = await getResourceById(resourceId);
  return resource?.created_by || null;
};

const getResourceForVisibility = async (req) => {
  const resourceId = Number.parseInt(req.params.resourceId, 10);
  if (!Number.isInteger(resourceId) || resourceId < 1) {
    return null;
  }

  return getResourceById(resourceId);
};

router.get("/students/me/available-modules", authMiddleware, getAvailableModulesHandler);

router.get(
  "/resources/:resourceId/modules",
  optionalAuthMiddleware,
  requirePublishedOrOwnerOrAdmin(getResourceForVisibility),
  [param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required")],
  validateRequest,
  getModulesByResourceHandler
);

router.post(
  "/resources/:resourceId/modules",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    body("module_id")
      .isInt({ min: 1 })
      .withMessage("Module ID is required and must be a positive integer"),
    body("chapter").optional().isString().trim().isLength({ max: 255 }),
    body("difficulty").optional().isIn(["easy", "medium", "hard"]),
    body("exam_related").optional().isBoolean(),
  ],
  validateRequest,
  addModuleToResourceHandler
);

router.patch(
  "/resources/:resourceId/modules/:moduleId",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    param("moduleId").isInt({ min: 1 }).withMessage("Valid module ID is required"),
    body("chapter").optional().isString().trim().isLength({ max: 255 }),
    body("difficulty").optional().isIn(["easy", "medium", "hard"]),
    body("exam_related").optional().isBoolean(),
  ],
  validateRequest,
  updateResourceModuleMapHandler
);

router.delete(
  "/resources/:resourceId/modules/:moduleId",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [
    param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required"),
    param("moduleId").isInt({ min: 1 }).withMessage("Valid module ID is required"),
  ],
  validateRequest,
  removeModuleFromResourceHandler
);

router.delete(
  "/resources/:resourceId/modules",
  authMiddleware,
  requireOwnerOrAdmin(getResourceOwnerId),
  [param("resourceId").isInt({ min: 1 }).withMessage("Valid resource ID is required")],
  validateRequest,
  removeAllModulesHandler
);

router.get(
  "/modules/:moduleId/resources",
  optionalAuthMiddleware,
  [param("moduleId").isInt({ min: 1 }).withMessage("Valid module ID is required")],
  validateRequest,
  getResourcesByModuleHandler
);

export default router;
