import { Router } from "express";
import { healthRoutes } from "../modules/health/health.route";
import { authRoutes } from "../modules/auth/auth.route";
import { coachingRoutes } from "../modules/coachingCenter/coaching-center.router";

const router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/coaching",coachingRoutes)

export const apiRoutes = router;
