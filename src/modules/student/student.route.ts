import { Router } from "express";
import { studentController } from "./student.controller";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { createStudentSchema, updateZodSchema } from "./student.zod.validation";


const router = Router()
router.get("/", authorize(Role.ADMIN, Role.OWNER, Role.TEACHER, Role.STUDENT), studentController.getAllStudent);
router.get("/student-fee", authorize(Role.ADMIN, Role.OWNER, Role.TEACHER, Role.STUDENT), studentController.studentFee);

router.get("/dashboard-card", authorize(Role.STUDENT, Role.TEACHER), studentController.studentDashboardCard);
router.get("/class-schedule", authorize(Role.STUDENT, Role.TEACHER, Role.OWNER), studentController.studentClassSchedule);


router.get("/:id", authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), studentController.getStudentById);

router.post("/", requestValidation(createStudentSchema), authorize(Role.ADMIN, Role.OWNER), studentController.createStudent);

router.patch("/:id", requestValidation(updateZodSchema), authorize(Role.ADMIN, Role.OWNER), studentController.studentUpdate);
router.patch("/delete/:id", authorize(Role.ADMIN, Role.OWNER), studentController.studentDelete);

export const studentRoutes = router;