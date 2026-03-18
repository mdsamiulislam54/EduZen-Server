import { Router } from "express";
import { healthRoutes } from "../modules/health/health.route";
import { authRoutes } from "../modules/auth/auth.route";
import { coachingRoutes } from "../modules/coachingCenter/coaching-center.router";
import { studentRoutes } from "../modules/student/student.route";
import { batchRoutes } from "../modules/batch/batch.route";
import { subjectRoutes } from "../modules/subject/subject.route";

const router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/coaching",coachingRoutes)
router.use("/student", studentRoutes)
router.use("/batch", batchRoutes)
router.use('/subject', subjectRoutes)

export const apiRoutes = router;
