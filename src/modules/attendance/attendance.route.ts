import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { createAttendanceSchema, updateAttendanceSchema } from "./attendance.zod.validation";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { attendanceController } from "./attendance.controller";

const router = Router()
router.get("/", authorize(Role.ADMIN, Role.OWNER, Role.STUDENT, Role.TEACHER), attendanceController.getAllAttendance)
// router.get("/:id")

router.post("/", requestValidation(createAttendanceSchema), authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), attendanceController.createAttendance)

router.patch("/:id", requestValidation(updateAttendanceSchema), authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), attendanceController.updateAttendance)
router.delete("/:id",authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), attendanceController.deleteAttendance)

export const attendanceRoutes = router;