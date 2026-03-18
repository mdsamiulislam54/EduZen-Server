import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { batchSchema } from "./batch.zod.validation";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { batchController } from "./batch.controller";


const router = Router()
router.post("/", requestValidation(batchSchema), authorize(Role.ADMIN, Role.OWNER), batchController.createBatch)
export const batchRoutes = router;