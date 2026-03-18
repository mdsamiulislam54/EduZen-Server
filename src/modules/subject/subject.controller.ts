import status from "http-status";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { Request, Response } from "express";
import { subjectService } from "./subject.service";


const createSubject = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const ownerId = req.user.id;
    const result = await subjectService.createSubject(payload, ownerId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Student create successfully",
        data: result
    })
});
const getAllSubject = catchAsync(async (req: Request, res: Response) => {
    const result = await subjectService.getAllSubject()
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Subject Retrieved successfully",
        data: result
    })
});
const getSubjectById = catchAsync(async (req: Request, res: Response) => {
    const subjectId = req.params.id as string;
    const result = await subjectService.getSubjectById(subjectId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Subject Retrieved successfully",
        data: result
    })
});
const subjectUpdateById = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const subjectId = req.params.id as string
    const result = await subjectService.subjectUpdateById(payload, subjectId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Subject Update successfully",
        data: result
    })
});
const deleteSubjectById = catchAsync(async (req: Request, res: Response) => {
    const subjectId = req.params.id as string
    const result = await subjectService.deleteSubjectById(subjectId)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Subject Delete successfully",
        data: result
    })
});

export const subjectController = {
    createSubject,
    getAllSubject,
    getSubjectById,
    subjectUpdateById,
deleteSubjectById


}