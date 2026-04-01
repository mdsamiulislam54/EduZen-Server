import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";

import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { subscriptionPlanController } from "./SubscriptionPlan.controller";
import { subscriptionPlanSchema } from "./SubscriptionPlan.zod.validation";

const router = Router();
router.post(
  "/",
  requestValidation(subscriptionPlanSchema),
  authorize(Role.ADMIN),
  subscriptionPlanController.createSubscriptionPlan
);


router.get("/",  authorize(Role.ADMIN), subscriptionPlanController.getAllSubscriptionPlans);


router.get("/:id",  authorize(Role.ADMIN), subscriptionPlanController.getSubscriptionPlanById);


router.patch(
  "/:id",
  authorize(Role.ADMIN),
  subscriptionPlanController.updateSubscriptionPlan
);


router.delete(
  "/:id",
  authorize(Role.ADMIN),
  subscriptionPlanController.deleteSubscriptionPlan
);

export const subscriptionPlanRoutes  = router