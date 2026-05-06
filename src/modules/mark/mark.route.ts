import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { Role } from "../../generated/enums";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { markController } from "./mark.controller";
import { upsertMarkSchema } from "./mark.zod.validation";

const router = Router();
router.get("/", markController.getAllMarks);
router.get("/:id", markController.getMarkById);
router.get("/result/:roll", markController.getStudentResultsByRoll);
router.get("/student/:examId", markController.getAllStudentByExamId);

router.post("/", requestValidation(upsertMarkSchema), authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), markController.upsertMark);

router.delete("/:id", authorize(Role.ADMIN, Role.OWNER, Role.TEACHER), markController.deleteMark);

export const markRoutes = router;