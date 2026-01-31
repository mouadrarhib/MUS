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
import resourceRoutes from "./resourceRoutes.js";
import moduleRoutes from "./moduleRoutes.js";
import ratingRoutes from "./ratingRoutes.js";


const router = Router();

router.use("/auth", authRoutes);
router.use(authMiddleware);
router.use("/roles", roleRoutes);
router.use("/user-roles", userRoleRoutes);
router.use("/institution-types", institutionTypeRoutes);
router.use("/institutions", institutionRoutes);
router.use("/domains", domainRoutes);
router.use("/programs", programRoutes);
router.use("/institution-programs", institutionProgramRoutes);
router.use("/levels", levelRoutes);
router.use("/semesters", semesterRoutes);
router.use("/student-profiles", studentProfileRoutes);
router.use("/resources", resourceRoutes);
router.use("/modules", moduleRoutes);
router.use("/ratings", ratingRoutes);


export default router;
