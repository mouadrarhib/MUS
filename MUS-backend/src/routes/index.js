import { Router } from "express";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import userRoleRoutes from "./userRoleRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/roles", roleRoutes);
router.use("/user-roles", userRoleRoutes);

export default router;
