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
  authorize(Role.ADMIN, Role.OWNER),
  subscriptionPlanController.createSubscriptionPlan
);


router.get("/", subscriptionPlanController.getAllSubscriptionPlans);


router.get("/:id", subscriptionPlanController.getSubscriptionPlanById);


router.patch(
  "/:id",
  authorize(Role.ADMIN, Role.OWNER),
  subscriptionPlanController.updateSubscriptionPlan
);


router.delete(
  "/:id",
  authorize(Role.ADMIN, Role.OWNER),
  subscriptionPlanController.deleteSubscriptionPlan
);

export const subscriptionPlanRoutes  = router