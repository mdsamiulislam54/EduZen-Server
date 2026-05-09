import { Router } from "express";

import { noticeController } from "./notice.controller";
import { authorize } from "../../shared/middlewares/authorize.middleware";
import { Role } from "../../generated/enums";


const router = Router();


// ======================
// CREATE NOTICE
// ======================
router.post("/create", authorize(Role.OWNER), noticeController.createNotice);


// ======================
// GET ALL NOTICE
// ======================
router.get("/", authorize(Role.ADMIN, Role.OWNER, Role.STUDENT, Role.TEACHER), noticeController.getAllNotice);


router.get("/:id", authorize(Role.ADMIN, Role.OWNER, Role.STUDENT, Role.TEACHER), noticeController.getNoticeById);

router.patch("/:id", authorize(Role.ADMIN, Role.OWNER), noticeController.updateNotice);

router.delete("/:id", authorize(Role.ADMIN, Role.OWNER), noticeController.deleteNotice);

export const noticeRoutes = router;