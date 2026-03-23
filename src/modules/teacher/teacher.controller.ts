import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { teacherService } from "./teacher.service";

const createTeacher = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;
    const id = req.user.id as string;
    console.log(payload)

    const result = await teacherService.createTeacher(payload, id)
    sendResponse(res, {
        status: status.CREATED,
        success: true,
        message: "Teacher create successfully",
        data: result
    })
});
const updateTeacher = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const id = req.params.id as string;
    const result = await teacherService.updateTeacher(payload, id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Teacher update successfully",
        data: result
    })
});
const getAllTeacher = catchAsync(async (req: Request, res: Response) => {
    const result = await teacherService.getAllTeacher()
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Teacher Retrieved successfully",
        data: result
    })
});
const getAllTeacherById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await teacherService.getAllTeacherById(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Teacher Retrieved successfully",
        data: result
    })
});
const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await teacherService.deleteTeacher(id)
    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Teacher delete successfully",
        data: result
    })
});




export const teacherController = {
    createTeacher,
    getAllTeacher,
    updateTeacher,
    deleteTeacher,
    getAllTeacherById
}