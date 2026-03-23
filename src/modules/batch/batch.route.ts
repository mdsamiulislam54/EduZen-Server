import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { batchSchema, batchUpdateSchema } from "./batch.zod.validation";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { batchController } from "./batch.controller";


const router = Router()
router.get("/", batchController.getAllBatch)
router.get("/:id", batchController.getBatchById)

router.post("/", requestValidation(batchSchema), authorize(Role.ADMIN, Role.OWNER), batchController.createBatch)

router.patch("/:id", requestValidation(batchUpdateSchema), authorize(Role.ADMIN, Role.OWNER), batchController.batchUpdateById)
router.patch("/delete/:id", authorize(Role.ADMIN, Role.OWNER), batchController.batchDeleteById)

export const batchRoutes = router;