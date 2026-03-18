import { Router } from "express";
import { requestValidation } from "../../shared/middlewares/zodValidation";
import { subjectSchema } from "./subject.zod.validation";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";
import { subjectController } from "./subject.controller";

const router = Router()
router.get("/", subjectController.getAllSubject);
router.get("/:id", subjectController.getSubjectById)


router.post("/", requestValidation(subjectSchema), authorize(Role.ADMIN,Role.OWNER), subjectController.createSubject);

router.patch("/:id",requestValidation(subjectSchema), authorize(Role.ADMIN,Role.OWNER), subjectController.subjectUpdateById )
router.delete("/:id", authorize(Role.ADMIN,Role.OWNER), subjectController.deleteSubjectById )

export const subjectRoutes = router;