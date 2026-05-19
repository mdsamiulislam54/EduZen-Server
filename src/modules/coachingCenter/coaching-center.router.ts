import { Router } from "express";
import { coachingCenterController } from "./coaching-center.controller";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { coachingCenterSchema, coachingCenterUpdateSchema } from "./coaching-center.zodSchema";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";

const router = Router();
router.get("/", authorize(Role.ADMIN, Role.OWNER), coachingCenterController.getCoachingCenter);

router.get("/owner/dashboard", authorize(Role.ADMIN, Role.OWNER), coachingCenterController.getCoachingOwnerDashboardData);
router.get("/owner/dashboard/student-growth", authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), coachingCenterController.coachingCenterOwnerDashboardStudentGrowth);
router.get("/subscription", authorize(Role.ADMIN, Role.OWNER), coachingCenterController.getOwnSubscriptions);
router.get("/:roll", authorize(Role.ADMIN, Role.OWNER), coachingCenterController.findStudentByRollNumber);``
// router.post("/", requestValidation(coachingCenterSchema), coachingCenterController.createCoachingCenter);

router.patch("/:id", requestValidation(coachingCenterUpdateSchema), authorize(Role.OWNER, Role.ADMIN), coachingCenterController.updateCoachingCenterById)
router.patch("/delete/:id", authorize(Role.OWNER, Role.ADMIN), coachingCenterController.coachingCenterDeleteById)

export const coachingRoutes = router