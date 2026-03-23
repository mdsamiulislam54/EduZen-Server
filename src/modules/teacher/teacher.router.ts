import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { createTeacherSchema, updateTeacherSchema } from "./teacher.zod.validation";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { teacherController } from "./teacher.controller";

const router = Router()

router.get("/", teacherController.getAllTeacher);
router.get("/:id", teacherController.getAllTeacherById);

router.post("/", requestValidation(createTeacherSchema), authorize(Role.OWNER), teacherController.createTeacher);
router.patch("/:id", requestValidation(updateTeacherSchema), authorize(Role.OWNER), teacherController.updateTeacher);
router.patch("/delete/:id", authorize(Role.OWNER), teacherController.deleteTeacher);

export const teacherRoutes = router