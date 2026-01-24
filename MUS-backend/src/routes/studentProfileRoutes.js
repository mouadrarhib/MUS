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

const router = Router();

router.post(
  "/",
  [
    body("user_id").isUUID().withMessage("Valid user UUID is required"),
    body("institution_id").isInt().withMessage("Valid institution ID is required"),
    body("program_id").isInt().withMessage("Valid program ID is required"),
    body("current_semester_id").isInt().withMessage("Valid current semester ID is required"),
  ],
  validateRequest,
  addStudentProfile
);

router.get("/", listStudentProfiles);

router.get(
  "/institution/:institutionId",
  [param("institutionId").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  listStudentProfilesByInstitution
);

router.get(
  "/institution/:institutionId/count",
  [param("institutionId").isInt().withMessage("Valid institution ID is required")],
  validateRequest,
  countStudentProfilesByInstitutionHandler
);

router.get(
  "/program/:programId",
  [param("programId").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  listStudentProfilesByProgram
);

router.get(
  "/program/:programId/count",
  [param("programId").isInt().withMessage("Valid program ID is required")],
  validateRequest,
  countStudentProfilesByProgramHandler
);

router.get(
  "/semester/:semesterId",
  [param("semesterId").isInt().withMessage("Valid semester ID is required")],
  validateRequest,
  listStudentProfilesBySemester
);

router.get(
  "/semester/:semesterId/count",
  [param("semesterId").isInt().withMessage("Valid semester ID is required")],
  validateRequest,
  countStudentProfilesBySemesterHandler
);

router.get(
  "/:userId",
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  getStudentProfile
);

router.patch(
  "/:userId",
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("institution_id").optional().isInt(),
    body("program_id").optional().isInt(),
    body("current_semester_id").optional().isInt(),
  ],
  validateRequest,
  updateExistingStudentProfile
);

router.delete(
  "/:userId",
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  deleteExistingStudentProfile
);

router.get(
  "/:userId/exists",
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  studentProfileExistsHandler
);

router.get(
  "/:userId/full-details",
  [param("userId").isUUID().withMessage("Valid user UUID is required")],
  validateRequest,
  getStudentProfileFullDetailsHandler
);

router.patch(
  "/:userId/institution",
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("institution_id").isInt().withMessage("Valid institution ID is required"),
  ],
  validateRequest,
  updateStudentInstitutionHandler
);

router.patch(
  "/:userId/program",
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("program_id").isInt().withMessage("Valid program ID is required"),
  ],
  validateRequest,
  updateStudentProgramHandler
);

router.patch(
  "/:userId/semester",
  [
    param("userId").isUUID().withMessage("Valid user UUID is required"),
    body("current_semester_id").isInt().withMessage("Valid current semester ID is required"),
  ],
  validateRequest,
  updateStudentSemesterHandler
);

export default router;
