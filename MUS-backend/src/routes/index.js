import { Router } from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import userRoleRoutes from "./userRoleRoutes.js";
import institutionTypeRoutes from "./institutionTypeRoutes.js";
import institutionRoutes from "./institutionRoutes.js";
import domainRoutes from "./domainRoutes.js";
import programRoutes from "./programRoutes.js";
import institutionProgramRoutes from "./institutionProgramRoutes.js";
import authMiddleware from "../middleware/auth.js";
import levelRoutes from "./levelRoutes.js";
import semesterRoutes from "./semesterRoutes.js";
import studentProfileRoutes from "./studentProfileRoutes.js";
import userSettingsRoutes from "./userSettingsRoutes.js";
import resourceRoutes from "./resourceRoutes.js";
import moduleRoutes from "./moduleRoutes.js";
import ratingRoutes from "./ratingRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import adminRoutes from "./adminRoutes.js";
import resourceModuleMapRoutes from "./resourceModuleMapRoutes.js";
import qaRoutes from "./qaRoutes.js";


const router = Router();

router.use("/auth", authRoutes);

router.use("/institution-types", institutionTypeRoutes);
router.use("/institutions", institutionRoutes);
router.use("/domains", domainRoutes);
router.use("/programs", programRoutes);
router.use("/institution-programs", institutionProgramRoutes);
router.use("/levels", levelRoutes);
router.use("/semesters", semesterRoutes);
router.use("/modules", moduleRoutes);
router.use("/ratings", ratingRoutes);
router.use("/resources", resourceRoutes);
router.use("/qa", qaRoutes);
router.use("", resourceModuleMapRoutes);

router.use(authMiddleware);
router.use("/roles", roleRoutes);
router.use("/user-roles", userRoleRoutes);
router.use("/student-profiles", studentProfileRoutes);
router.use("/user-settings", userSettingsRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/admin", adminRoutes);


export default router;
