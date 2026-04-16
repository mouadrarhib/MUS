import { Router } from "express";
import { body, param } from "express-validator";
import {
  addStudentProfile,
  listStudentProfiles,
  getStudentProfile,
  updateExistingStudentProfile,
  deleteExistingStudentProfile,
  updateStudentInstitutionHandler,
  updateStudentProgramHandler,
  updateStudentSemesterHandler,
  updateStudentContributionModeHandler,
  studentProfileExistsHandler,
  listStudentProfilesByInstitution,
  listStudentProfilesByProgram,
  listStudentProfilesBySemester,
  countStudentProfilesByInstitutionHandler,
  countStudentProfilesByProgramHandler,
  countStudentProfilesBySemesterHandler,
  getStudentProfileFullDetailsHandler,
} from "../controllers/studentProfileController.js";
import validateRequest from "./validateRequest.js";
import authMiddleware from "../middleware/auth.js";
import { requireRole, requireSelfOrAdmin } from "../middleware/authorization.js";

const router = Router();
router.use(authMiddleware);

router.post(
  "/",
  requireSelfOrAdmin("user_id"),
  [
    body("user_id").isUUID().withMessage("Valid user UUID is required"),
    body("institution_id").isInt().withMessage("Valid institution ID is required"),
    body("program_id").isInt().withMessage("Valid program ID is required"),
    body("current_semester_id").isInt().withMessage("Valid current semester ID is required"),
    body("contribution_mode").optional().isIn(["learner", "contributor"]).withMessage("contribution_mode must be learner or contributor"),
  ],
  validateRequest,
  addStudentProfile
);

router.get("/", requireRole("admin"), listStudentProfiles);

router.get(
  "/institution/:institutionId",
  requireRole("admin"),
  [param("institutionId").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  listStudentProfilesByInstitution
);

router.get(
  "/institution/:institutionId/count",
  requireRole("admin"),
  [param("institutionId").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  countStudentProfilesByInstitutionHandler
);

router.get(
  "/program/:programId",
  requireRole("admin"),
  [param("programId").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  listStudentProfilesByProgram
);

router.get(
  "/program/:programId/count",
  requireRole("admin"),
  [param("programId").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  countStudentProfilesByProgramHandler
);

router.get(
  "/semester/:semesterId",
  requireRole("admin"),
  [param("semesterId").isInt().withMessage("Valid semester ID is required")],
  validateRequest,
  listStudentProfilesBySemester
);

router.get(
  "/semester/:semesterId/count",
  requireRole("admin"),
  [param("semesterId").isInt().withMessage("Valid semester ID is required")],
  validateRequest,
  countStudentProfilesBySemesterHandler
);

router.get(
  "/:userId",
  requireSelfOrAdmin("userId"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  getStudentProfile
);

router.patch(
  "/:userId",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("institution_id").optional().isInt(),
    body("program_id").optional().isInt(),
    body("current_semester_id").optional().isInt(),
    body("contribution_mode").optional().isIn(["learner", "contributor"]),
  ],
  validateRequest,
  updateExistingStudentProfile
);

router.patch(
  "/:userId/contribution-mode",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("contribution_mode")
      .isIn(["learner", "contributor"])
      .withMessage("contribution_mode must be learner or contributor"),
  ],
  validateRequest,
  updateStudentContributionModeHandler
);

router.delete(
  "/:userId",
  requireRole("admin"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  deleteExistingStudentProfile
);

router.get(
  "/:userId/exists",
  requireSelfOrAdmin("userId"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  studentProfileExistsHandler
);

router.get(
  "/:userId/full-details",
  requireSelfOrAdmin("userId"),
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  getStudentProfileFullDetailsHandler
);

router.patch(
  "/:userId/institution",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("institution_id").isInt().withMessage("Valid institution ID is required"),
  ],
  validateRequest,
  updateStudentInstitutionHandler
);

router.patch(
  "/:userId/program",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("program_id").isInt().withMessage("Valid program ID is required"),
  ],
  validateRequest,
  updateStudentProgramHandler
);

router.patch(
  "/:userId/semester",
  requireSelfOrAdmin("userId"),
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("current_semester_id").isInt().withMessage("Valid current semester ID is required"),
  ],
  validateRequest,
  updateStudentSemesterHandler
);

export default router;
