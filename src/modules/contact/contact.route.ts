import express from "express";
import { contactController } from "./contact.controller";
const router = express.Router();

router.post("/", contactController.createContactMessage);
router.get("/", contactController.getAllContactMessages);

export const contactRoute = router;