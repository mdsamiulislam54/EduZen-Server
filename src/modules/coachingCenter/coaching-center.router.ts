import { Router } from "express";
import { coachingCenterController } from "./coaching-center.controller";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { coachingCenterSchema } from "./coaching-center.zodSchema";

const router = Router();
router.post("/", requestValidation(coachingCenterSchema), coachingCenterController.createCoachingCenter)

export const coachingRoutes = router