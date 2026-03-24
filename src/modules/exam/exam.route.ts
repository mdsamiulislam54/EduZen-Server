import { Router } from "express";
import { examController } from "./exam.controller";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { createExamSchema, updateExamSchema } from "./exam.zod.validation";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";

const router = Router();
router.get("/",examController.getAllExams);
router.get("/:id",examController.getExamById);

router.post("/", requestValidation(createExamSchema),authorize(Role.ADMIN,Role.OWNER,Role.TEACHER), examController.createExam);

router.patch("/:id", requestValidation(updateExamSchema),authorize(Role.ADMIN,Role.OWNER,Role.TEACHER), examController.updateExam);

router.delete("/:id",examController.deleteExam)


export const examRoutes = router;