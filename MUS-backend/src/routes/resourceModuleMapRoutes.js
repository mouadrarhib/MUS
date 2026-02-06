import { Router } from "express";
import { param, body } from "express-validator";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireStudent } from "../middleware/authorization.js";
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

// Protection: toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(requireStudent);

// ===== RESOURCE → MODULE =====

// Associer resource à module
router.post(
  "/resources/:resourceId/modules",
  [
    param("resourceId").isInt().withMessage("resourceId must be an integer"),
    body("module_id").isInt().withMessage("module_id is required and must be an integer"),
    body("chapter").optional().isString().trim(),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("difficulty must be: easy, medium, or hard"),
    body("exam_related").optional().isBoolean(),
  ],
  validateRequest,
  addModuleToResourceHandler
);

// Récupérer les modules d'une resource
router.get(
  "/resources/:resourceId/modules",
  [param("resourceId").isInt()],
  validateRequest,
  getModulesByResourceHandler
);

// Retirer un module d'une resource
router.delete(
  "/resources/:resourceId/modules/:moduleId",
  [
    param("resourceId").isInt(),
    param("moduleId").isInt(),
  ],
  validateRequest,
  removeModuleFromResourceHandler
);

// Retirer tous les modules d'une resource
router.delete(
  "/resources/:resourceId/modules",
  [param("resourceId").isInt()],
  validateRequest,
  removeAllModulesHandler
);

// Mettre à jour l'association
router.patch(
  "/resources/:resourceId/modules/:moduleId",
  [
    param("resourceId").isInt(),
    param("moduleId").isInt(),
    body("chapter").optional().isString().trim(),
    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"]),
    body("exam_related").optional().isBoolean(),
  ],
  validateRequest,
  updateResourceModuleMapHandler
);

// ===== MODULE → RESOURCES =====

// Récupérer les resources d'un module
router.get(
  "/modules/:moduleId/resources",
  [param("moduleId").isInt()],
  validateRequest,
  getResourcesByModuleHandler
);

// ===== STUDENT UTILITIES =====

// Récupérer les modules disponibles pour moi
router.get(
  "/students/me/available-modules",
  getAvailableModulesHandler
);

export default router;
