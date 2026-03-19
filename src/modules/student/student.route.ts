import { Router } from "express";
import { studentController } from "./student.controller";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { createStudentSchema, updateZodSchema } from "./student.zod.validation";


const router = Router()
router.get("/", studentController.getAllStudent)
router.get("/:id", studentController.getStudentById)
router.post("/", requestValidation(createStudentSchema), authorize(Role.ADMIN, Role.OWNER), studentController.createStudent);

router.patch("/:id", requestValidation(updateZodSchema), authorize(Role.ADMIN, Role.OWNER), studentController.studentUpdate);
router.patch("/delete/:id",  authorize(Role.ADMIN, Role.OWNER), studentController.studentDelete);

export const studentRoutes = router;