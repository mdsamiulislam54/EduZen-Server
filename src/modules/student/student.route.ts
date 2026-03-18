import { Router } from "express";
import { studentController } from "./student.controller";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { studentSchema } from "./student.zod.validation";

const router = Router()

router.post("/", requestValidation(studentSchema), authorize(Role.ADMIN,Role.OWNER),  studentController.createStudent)
export const studentRoutes = router;