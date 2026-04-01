import { Router } from "express";
import { adminController } from "./admin.controller";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";

const router = Router();

router.get("/owners", authorize(Role.ADMIN), adminController.getAllOwners);
router.get("/dashboard-data", authorize(Role.ADMIN), adminController.adminDashboardData);
router.get("/analytics", authorize(Role.ADMIN), adminController.adminAnalytics);
router.get("/owner/:id", authorize(Role.ADMIN), adminController.getOwnerById);
router.get("/analytics", authorize(Role.ADMIN), adminController.adminAnalytics);

router.patch('/owner/:id', authorize(Role.ADMIN), adminController.deleteOwner);

export const adminRoute = router;